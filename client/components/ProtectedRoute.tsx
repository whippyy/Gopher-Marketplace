import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../lib/firebase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && !user.email?.endsWith('@umn.edu')) {
        console.log('Non-UMN email detected, signing out');
        // Prevent rendering children before sign-out completes
        auth.signOut();
        alert('Only UMN students can access this platform.');
        router.push('/login'); // Redirect after signing out
      } else if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
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

  // Render children only if user is authenticated and has a UMN email.
  // Otherwise, render null while the useEffect handles the redirect.
  if (user && user.email?.endsWith('@umn.edu')) {
    return <>{children}</>;
  }

  return null; // Or a loading/redirecting indicator
} 