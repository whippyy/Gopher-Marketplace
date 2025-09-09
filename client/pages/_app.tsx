import type { AppProps } from 'next/app';
import type { NextRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Footer from '../components/Footer';
import '../src/app/globals.css';

const noAuthRequired = ['/', '/login'];

function MyApp({ Component, pageProps, router }: AppProps & { router: NextRouter }) {
  const isProtected = !noAuthRequired.includes(router.pathname);
  const showFooter = router.pathname !== '/login';

  return (
    <AuthProvider>
      {isProtected ? (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      ) : (
        <Component {...pageProps} />
      )}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {isProtected ? (
            <ProtectedRoute>
              <Component {...pageProps} />
            </ProtectedRoute>
          ) : (
            <Component {...pageProps} />
          )}
        </main>
        {showFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default MyApp; 