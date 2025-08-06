import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google login success:', result.user.email);
      
      if (!result.user.email?.endsWith('@umn.edu')) {
        await auth.signOut();
        alert('Only UMN emails are allowed for this platform.');
        setLoading(false);
        return;
      }
      
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Google login error:', error);
        alert('Google login failed: ' + error.message);
      } else {
        alert('Google login failed');
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