import { useState, useEffect, type FormEvent } from 'react';
import { neon } from '../neon';
import type { Todo } from '../db/schema';

export default function TodoApp() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState('');

    // Get the current session
    const { data } = neon.auth.useSession();

    useEffect(() => {
        if (data?.user) {
            const fetchTodos = async () => {
                // Query the Data API directly
                // RLS automatically ensures that only the current user's todos are returned
                const { data: todosData, error } = await neon
                    .from('todos')
                    .select('*')
                    .order('id', { ascending: false });

                if (error) {
                    console.error('Error fetching todos:', error);
                } else {
                    setTodos(todosData || []);
                }
            };

            fetchTodos();
        }
    }, [data]);

    const handleAddTodo = async (e: FormEvent) => {
        if (!data?.user) return;
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Optimistic UI update
        const tempId = Date.now();
        const newTodo = { id: tempId, text: inputValue, completed: false, user_id: data.user.id };
        setTodos([newTodo, ...todos]);
        setInputValue('');

        // Insert into Database
        const { data: insertedData } = await neon
            .from('todos')
            .insert({
                text: newTodo.text,
                completed: newTodo.completed,
                user_id: data.user.id,
            })
            .select()
            .single();

        // Update with real ID from DB
        if (insertedData) {
            setTodos((prev) => prev.map((t) => (t.id === tempId ? insertedData : t)));
        }
    };

    const toggleTodo = async (id: number) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        // Optimistic update
        setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

        // Update in Database
        await neon.from('todos').update({ completed: !todo.completed }).eq('id', id);
    };

    const deleteTodo = async (id: number) => {
        setTodos(todos.filter((t) => t.id !== id));

        await neon.from('todos').delete().eq('id', id);
    };

    return (
        <div className="border-gray-200 mx-auto mt-10 max-w-md rounded-lg border bg-white p-6 shadow-lg">
            <h2 className="text-gray-800 mb-6 text-2xl font-bold">My Tasks</h2>

            <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Add a new task..."
                    className="border-gray-300 focus:ring-blue-500 flex-1 rounded border p-2 focus:outline-none focus:ring-2"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-white transition"
                >
                    Add
                </button>
            </form>

            <ul className="space-y-3">
                {todos.length === 0 && <p className="text-gray-500 text-center italic">No tasks yet.</p>}
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className="bg-gray-50 hover:bg-gray-100 group flex items-center justify-between rounded p-3 transition"
                    >
                        <div
                            onClick={() => toggleTodo(todo.id)}
                            className="flex cursor-pointer select-none items-center gap-3"
                        >
                            <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}
                            >
                                {todo.completed && <span className="text-xs text-white">✓</span>}
                            </div>
                            <span className={todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}>
                                {todo.text}
                            </span>
                        </div>
                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 transition group-hover:opacity-100"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}