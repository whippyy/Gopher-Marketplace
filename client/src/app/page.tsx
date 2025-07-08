'use client';

import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to Gopher Marketplace
        </h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                You are logged in!
              </h2>
              <p className="text-green-700">
                Email: <span className="font-mono">{user.email}</span>
              </p>
              <p className="text-green-700">
                User ID: <span className="font-mono">{user.uid}</span>
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Authentication Status:</h3>
              <ul className="text-sm space-y-1">
                <li>✅ User authenticated: {user ? 'Yes' : 'No'}</li>
                <li>✅ UMN email verified: {user?.email?.endsWith('@umn.edu') ? 'Yes' : 'No'}</li>
                <li>✅ Email verified: {user?.emailVerified ? 'Yes' : 'No'}</li>
                <li>✅ Loading state: {loading ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">You need to log in to access the marketplace.</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-maroon text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
