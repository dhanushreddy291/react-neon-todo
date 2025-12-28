import { UserButton } from '@neondatabase/neon-js/auth/react';

export default function Header() {
    return (
        <header className="bg-blue-600 p-4 text-white shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <h1 className="text-xl font-bold">Neon Todo App</h1>
                <UserButton size={'icon'} />
            </div>
        </header>
    );
}