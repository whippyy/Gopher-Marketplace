import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget as HTMLFormElement).email.value;
    const password = (e.currentTarget as HTMLFormElement).password.value;

    if (!email.endsWith('@umn.edu')) {
      alert('Only UMN emails allowed!');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Email login success:', auth.currentUser);
      router.push('/');
    } catch (error: any) {
      console.error('Email login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      console.log('Google login success:', auth.currentUser);
      router.push('/');
    } catch (error: any) {
      console.error('Google login error:', error);
      alert('Google login failed: ' + error.message);
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
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded"
          required
        />
        <button 
          type="submit" 
          className="w-full bg-maroon text-white p-2 rounded"
        >
          Sign In
        </button>
      </form>
      <button 
        onClick={handleGoogleLogin}
        className="w-full mt-4 bg-white border p-2 rounded flex items-center justify-center"
      >
        <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" />
        Sign in with Google
      </button>
    </div>
  );
} 