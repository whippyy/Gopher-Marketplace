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
  imageUrls?: string[];
}

export default function ListingsPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    fetchListings();
  }, [loading, user, router]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await authenticatedFetch(`${apiUrl}/api/listings`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const data = await response.json();
      setListings(data);
      setFilteredListings(data);
    } catch (err) {
      setError('Failed to load listings. Please try again later.');
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = listings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    if (priceFilter) {
      const maxPrice = parseFloat(priceFilter);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(listing => listing.price <= maxPrice);
      }
    }

    setFilteredListings(filtered);
  }, [listings, searchTerm, priceFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleContact = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Gopher Marketplace
        </h1>
        <p className="text-gray-600">
          Buy and sell items with fellow UMN students
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-50 rounded-lg shadow-md border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="10">Under $10</option>
              <option value="25">Under $25</option>
              <option value="50">Under $50</option>
              <option value="100">Under $100</option>
              <option value="200">Under $200</option>
            </select>
          </div>
          <button
            onClick={() => router.push('/listings/create')}
            className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Create Listing
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Loading listings...</div>
        </div>
      )}

      {/* Listings Grid */}
      {!isLoading && (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No listings found
              </h3>
              <p className="text-gray-500">
                {searchTerm || priceFilter 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a listing!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-gray-50 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  {/* Image Preview */}
                  {listing.imageUrls && listing.imageUrls.length > 0 && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Handle broken image links gracefully
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
                        {listing.title}
                      </h3>
                      <span className="text-maroon font-bold text-lg">
                        {formatPrice(listing.price)}
                      </span>
                    </div>
                    
                    {listing.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {listing.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>Posted {formatDate(listing.createdAt)}</span>
                      <span>by {listing.contactEmail.split('@')[0]}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContact(listing.contactEmail)}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Contact Seller
                      </button>
                      {user.email === listing.contactEmail && (
                        <button
                          onClick={() => router.push(`/listings/${listing.id}/edit`)}
                          className="bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 