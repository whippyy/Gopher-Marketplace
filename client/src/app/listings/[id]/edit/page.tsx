'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AuthContext } from '../../../../../context/AuthContext';
import { authenticatedFetch } from '../../../../../lib/api';

interface Listing {
  id: number;
  title: string;
  description?: string;
  price: number;
  contactEmail: string;
  createdAt: string;
  ownerId: string;
}

export default function EditListingPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contactEmail: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [id, loading, user, router]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        contactEmail: user.email || '', // Ensure string, never null
      }));
    }
  }, [user]);

  const fetchListing = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5192/api/listings/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      const data = await response.json();
      setListing(data);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        contactEmail: data.contactEmail || '',
      });
    } catch (err: any) {
      setError('Could not load listing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only allow the owner to edit
  const isOwner = user && listing && user.email === listing.ownerId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than $0');
      return false;
    }
    if (!formData.contactEmail.endsWith('@umn.edu')) {
      setError('Contact email must be a UMN email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5192/api/listings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          contactEmail: user?.email || '', // Always use logged-in user's email
        }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update listing');
      }
      router.push('/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to update listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Listing not found.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">You do not have permission to edit this listing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Edit Listing
        </h1>
        <p className="text-gray-600">
          Update your listing details below
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={user?.email || ''}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-100 cursor-not-allowed"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Only UMN email addresses are allowed
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/listings')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 