import type { AppProps } from 'next/app';
import type { NextRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import '../src/app/globals.css';

const noAuthRequired = ['/', '/login'];

function MyApp({ Component, pageProps, router }: AppProps & { router: NextRouter }) {
  const isProtected = !noAuthRequired.includes(router.pathname);

  return (
    <AuthProvider>
      {isProtected ? (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        <Component {...pageProps} />
      )}
    </AuthProvider>
  );
}

export default MyApp; 