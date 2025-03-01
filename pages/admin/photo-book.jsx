import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const PhotoBookRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Show toast notification
    toast.success(
      'Photo Book is now available directly in the admin panel! Redirecting...',
      { duration: 4000 }
    );

    // Redirect to admin page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/admin');
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Photo Book Updated!</h1>
        <p className="text-gray-600 mb-4">
          The Photo Book is now available directly in the admin panel as a
          collapsible item.
        </p>
        <p className="text-gray-500">Redirecting to admin panel...</p>
      </div>
    </div>
  );
};

export default PhotoBookRedirectPage;
