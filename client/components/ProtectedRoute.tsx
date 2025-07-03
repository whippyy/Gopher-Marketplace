import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (!user.email?.endsWith('@umn.edu')) {
      auth.signOut();
      alert('Only UMN students can access this platform.');
    }
  }, [user]);

  return <>{user ? children : null}</>;
} 