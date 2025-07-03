import { auth } from '../lib/firebase';

export default function Header() {
  return (
    <header className="bg-maroon text-white p-4">
      <button 
        onClick={() => auth.signOut()}
        className="float-right bg-gold text-maroon px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </header>
  );
} 