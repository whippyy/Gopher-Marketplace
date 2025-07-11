'use client';

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../../../lib/api';

interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number;
  contactEmail: string;
  createdAt: string;
  ownerId: string;
}

export default function ProfilePage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchMyListings();
    }
  }, [user]);

  const fetchMyListings = async () => {
    setIsLoadingListings(true);
    setError('');
    try {
      const response = await authenticatedFetch('http://localhost:5192/api/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      // Only show listings owned by the user
      setMyListings(data.filter((l: Listing) => l.ownerId === user?.email));
    } catch (err: any) {
      setError('Could not load your listings.');
    } finally {
      setIsLoadingListings(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      const response = await authenticatedFetch(`http://localhost:5192/api/listings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      setMyListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete listing. Please try again.');
    }
  };

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
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6 mb-8">
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
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Listings</h2>
        {isLoadingListings ? (
          <div className="text-gray-600">Loading your listings...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        ) : myListings.length === 0 ? (
          <div className="text-gray-500">You have not created any listings yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myListings.map(listing => (
              <div key={listing.id} className="bg-gray-50 border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-semibold text-lg text-gray-900">{listing.title}</div>
                  <div className="text-gray-600 text-sm mb-1">${listing.price.toFixed(2)}</div>
                  <div className="text-gray-500 text-xs">Created: {new Date(listing.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/listings/${listing.id}/edit`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 