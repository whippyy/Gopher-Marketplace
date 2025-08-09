'use client';

import { useCallback, useContext, useEffect, useState, useRef } from 'react';
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
  imageUrls?: string[];
}

interface ImageFile {
  file: File;
  previewUrl: string;
  id: string;
}

export default function EditListingPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listing, setListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contactEmail: '',
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchListing = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await authenticatedFetch(`${apiUrl}/api/listings/${id}`);
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
      // Set existing images if they exist
      if (data.imageUrls && Array.isArray(data.imageUrls)) {
        setExistingImages(data.imageUrls);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Could not load listing.');
      } else {
        setError('Could not load listing.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Handle new image selection
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImagesToAdd: ImageFile[] = [];
      const files = Array.from(e.target.files);
      
      // Limit to 5 total images (existing + new)
      const totalImages = existingImages.length + newImages.length + imagesToDelete.length;
      const filesToProcess = files.slice(0, 5 - totalImages);
      
      filesToProcess.forEach(file => {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newImagesToAdd.push({
          file,
          previewUrl,
          id: Math.random().toString(36).substring(2, 9)
        });
      });
      
      setNewImages(prev => [...prev, ...newImagesToAdd]);
    }
  };

  // Remove a new image
  const removeNewImage = (id: string) => {
    setNewImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl); // Clean up memory
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Mark an existing image for deletion
  const markImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
  };

  // Unmark an image from deletion
  const unmarkImageForDeletion = (imageUrl: string) => {
    setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
  };

  // Clear all new images
  const clearNewImages = () => {
    newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setNewImages([]);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (id) {
      fetchListing();
    }
  }, [id, loading, user, router, fetchListing]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        contactEmail: user.email || '', // Ensure string, never null
      }));
    }
  }, [user]);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Create FormData object for multipart form submission
      const formDataToSend = new FormData();
      
      // Add listing data as JSON string
      const listingData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        imageUrls: existingImages.filter(url => !imagesToDelete.includes(url))
      };
      
      formDataToSend.append('listingData', JSON.stringify(listingData));
      
      // Add new image files
      newImages.forEach(img => {
        formDataToSend.append('newImages', img.file);
      });
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        imagesToDelete.forEach(url => {
          formDataToSend.append('deleteImageUrls', url);
        });
      }

      // Send request with FormData (multipart/form-data content type is set automatically)
      const response = await authenticatedFetch(`${apiUrl}/api/listings/${id}`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update listing');
      }
      router.push('/listings');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update listing. Please try again.');
      } else {
        setError('Failed to update listing. Please try again.');
      }
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
      <div className="bg-gray-50 rounded-lg shadow-md border p-6">
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
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add up to 5 images of your item. First image will be displayed as the main image.
            </p>
            
            {/* Existing Images Preview */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Listing image ${index + 1}`}
                        className={`w-full h-24 object-cover rounded-lg border ${
                          imagesToDelete.includes(imageUrl)
                            ? 'border-red-500 opacity-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {imagesToDelete.includes(imageUrl) ? (
                        <button
                          type="button"
                          onClick={() => unmarkImageForDeletion(imageUrl)}
                          className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center text-white text-xs"
                        >
                          Undo Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markImageForDeletion(imageUrl)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">New Images:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {newImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.previewUrl}
                        alt="New image preview"
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* File Input */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleNewImageChange}
                accept="image/*"
                multiple
                disabled={existingImages.length + newImages.length - imagesToDelete.length >= 5}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={existingImages.length + newImages.length - imagesToDelete.length >= 5}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Images
              </button>
              {newImages.length > 0 && (
                <button
                  type="button"
                  onClick={clearNewImages}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Clear New
                </button>
              )}
              <span className="text-sm text-gray-500">
                {existingImages.length + newImages.length - imagesToDelete.length}/5 images
              </span>
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