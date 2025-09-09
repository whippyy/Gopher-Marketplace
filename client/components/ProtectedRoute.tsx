import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
      } else if (!user.email?.endsWith('@umn.edu')) {
        console.log('Non-UMN email detected, signing out');
        auth.signOut();
        alert('Only UMN students can access this platform.');
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only render children if user is authenticated and has UMN email
  return <>{user && user.email?.endsWith('@umn.edu') ? children : null}</>;
} 