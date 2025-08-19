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
      <div className="bg-gray-50 shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to Gopher Marketplace
        </h1>
        
        {user ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                You are logged in!
              </h2>
              <p className="text-green-700">
                Email: <span className="font-mono">{user.email}</span>
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/listings')}
                className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🛍️</div>
                <h3 className="font-semibold text-lg">Browse Listings</h3>
                <p className="text-blue-100">Find items from fellow UMN students</p>
              </button>
              
              <button
                onClick={() => router.push('/listings/create')}
                className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold text-lg">Create Listing</h3>
                <p className="text-green-100">Sell your items to the community</p>
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
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
