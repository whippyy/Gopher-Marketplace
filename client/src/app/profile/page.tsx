'use client';

import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">You must be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const x500 = user.email?.split('@')[0] || '';
  const displayName = user.displayName || '';

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600">View your UMN account details</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <div className="text-lg font-semibold text-gray-900">
            {displayName ? (
              <>{displayName} <span className="text-gray-500">({x500})</span></>
            ) : (
              <>{x500}</>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UMN Email</label>
          <div className="text-lg text-gray-900">{user.email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">x500</label>
          <div className="text-lg text-gray-900">{x500}</div>
        </div>
      </div>
    </div>
  );
} 