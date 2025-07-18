import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const email = (e.currentTarget as HTMLFormElement).email.value;
    const password = (e.currentTarget as HTMLFormElement).password.value;

    if (!email.endsWith('@umn.edu')) {
      alert('Only UMN emails allowed!');
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email login success:', result.user.email);
      router.push('/');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Email login error:', error);
        alert('Login failed: ' + error.message);
      } else {
        alert('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Gopher Marketplace Login</h1>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input 
          type="email" 
          name="email" 
          placeholder="your@umn.edu" 
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded"
          required
          disabled={loading}
        />
        <button 
          type="submit" 
          className="w-full bg-maroon text-white p-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <button 
        onClick={handleGoogleLogin}
        className="w-full mt-4 bg-white border p-2 rounded flex items-center justify-center disabled:opacity-50"
        disabled={loading}
      >
        <Image src="https://www.google.com/favicon.ico" alt="Google icon" width={20} height={20} className="w-5 h-5 mr-2" />
        {loading ? 'Signing In...' : 'Sign in with Google'}
      </button>
    </div>
  );
} 