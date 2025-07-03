import { useState, useEffect } from 'react';
import { authenticatedFetch } from '../lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      const res = await authenticatedFetch('/api/profiles/me');
      const data = await res.json();
      setProfile(data);
      setFormData({
        displayName: data.displayName || '',
        phoneNumber: data.phoneNumber || ''
      });
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticatedFetch('/api/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    alert('Profile updated!');
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email</label>
          <input 
            value={profile?.email || ''} 
            disabled 
            className="w-full p-2 bg-gray-100 rounded"
          />
        </div>
        <div>
          <label>Display Name</label>
          <input
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            value={formData.phoneNumber}
            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <button 
          type="submit" 
          className="bg-maroon text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
} 