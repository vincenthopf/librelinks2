import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '@/styles/globals.css';
import '@/styles/animations.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { ProxyFlock } from '@/components/analytics/ProxyFlock';
import 'flag-icons/css/flag-icons.min.css';

// Create a client for React Query
const queryClient = new QueryClient();

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Setup NProgress loading indicator
  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  // Get the handle from the URL if available
  const handle = router.query.handle || null;

  // Initialize QueryClient
  const [queryClient] = useState(() => new QueryClient());

  // Always enable debug mode for troubleshooting
  const debugMode = true;

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session} basePath="/api/auth" refetchInterval={0}>
        <Toaster
          toastOptions={{
            duration: 3000, // Default duration for all toasts
          }}
        />
        <ProxyFlock handle={handle} debug={debugMode}>
          <Component {...pageProps} />
        </ProxyFlock>
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
