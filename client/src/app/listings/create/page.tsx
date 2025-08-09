'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '../../../../lib/api';

interface ListingForm {
  title: string;
  description: string;
  price: string;
  contactEmail: string;
}

interface ImageFile {
  file: File;
  previewUrl: string;
  id: string;
}

export default function CreateListingPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ListingForm>({
    title: '',
    description: '',
    price: '',
    contactEmail: user?.email || '',
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: ImageFile[] = [];
      const files = Array.from(e.target.files);
      
      // Limit to 5 images
      const filesToProcess = files.slice(0, 5 - images.length);
      
      filesToProcess.forEach(file => {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          previewUrl,
          id: Math.random().toString(36).substring(2, 9)
        });
      });
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Remove an image
  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl); // Clean up memory
      }
      return prev.filter(img => img.id !== id);
    });
  };

  // Clear all images
  const clearImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        contactEmail: user.email || '', // Ensure string, never null
      }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

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

    if (!validateForm()) {
      return;
    }

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
      };
      
      formDataToSend.append('listingData', JSON.stringify(listingData));
      
      // Add image files
      images.forEach(img => {
        formDataToSend.append('images', img.file);
      });

      // Send request with FormData (multipart/form-data content type is set automatically)
      const response = await authenticatedFetch(`${apiUrl}/api/listings`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create listing');
      }

      router.push('/listings');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to create listing. Please try again.');
      } else {
        setError('Failed to create listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Create New Listing
        </h1>
        <p className="text-gray-600">
          Sell your items to fellow UMN students
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg shadow-md border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
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
              placeholder="e.g., Calculus Textbook, Bike, Coffee Table"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your item, condition, why you're selling, etc."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Price */}
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
                placeholder="0.00"
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
              Images (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add up to 5 images of your item. First image will be displayed as the main image.
            </p>
            
            {/* Image Preview Area */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.previewUrl}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* File Input */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                disabled={images.length >= 5}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 5}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Select Images
              </button>
              {images.length > 0 && (
                <button
                  type="button"
                  onClick={clearImages}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
              <span className="text-sm text-gray-500">
                {images.length}/5 images selected
              </span>
            </div>
          </div>
          
          {/* Contact Email */}
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

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
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

      {/* Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Tips for a great listing:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a clear, descriptive title</li>
          <li>• Include details about condition and any defects</li>
          <li>• Mention why you&apos;re selling (graduating, moving, etc.)</li>
          <li>• Set a fair price - check similar items online</li>
          <li>• Respond quickly to interested buyers</li>
        </ul>
      </div>
    </div>
  );
} 