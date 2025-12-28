import { Routes, Route } from 'react-router';
import Header from './components/Header';
import Account from './pages/Account';
import Auth from './pages/Auth';
import { RedirectToSignIn, SignedIn } from '@neondatabase/neon-js/auth/react/ui';
import TodoApp from './pages/TodoApp';

const Layout = () => {
  return (
    <>
      <SignedIn>
        <div className="bg-gray-100 text-gray-900 min-h-screen font-sans">
          <Header />
          <TodoApp />
        </div>
      </SignedIn>
      {/* If not signed in, this component redirects to the login page */}
      <RedirectToSignIn />
    </>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} />
      <Route path="/auth/:path" element={<Auth />} />
      <Route path="/account/:path" element={<Account />} />
    </Routes>
  );
}