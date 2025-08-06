import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login success:', result.user.email);
      
      if (!result.user.email?.endsWith('@umn.edu')) {
        await auth.signOut();
        setError('Only UMN emails are allowed for this platform.');
        return;
      }
      
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Google login error:', error);
        setError('Google login failed: ' + error.message);
      } else {
        setError('An unknown error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Gopher Marketplace</h1>
        <p className="text-gray-600 mb-8">
          Please sign in with your UMN Google account to continue.
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-maroon text-white p-3 rounded-lg flex items-center justify-center text-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          <Image src="https://www.google.com/favicon.ico" alt="Google icon" width={24} height={24} className="mr-3" />
          {loading ? 'Signing In...' : 'Sign in with UMN Account'}
        </button>
      </div>
    </div>
  );
} 