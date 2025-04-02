/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo, useRef } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import LinkCard from '@/components/core/user-profile/links-card';
import Link from 'next/link';
import Loader from '@/components/utils/loading-spinner';
import NotFound from '@/components/utils/not-found';
import useLinks from '@/hooks/useLinks';
import { SocialCards } from '@/components/core/user-profile/social-cards';
import useCurrentUser from '@/hooks/useCurrentUser';
import { X } from 'lucide-react';
import { UserAvatarSetting } from '@/components/utils/avatar';
import { getCurrentBaseURL } from '@/utils/helpers';

const PreviewMobile = ({ close }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef(null);
  const dimensionUpdateTimeoutRef = useRef(null);
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true&photoBookLayout=${currentUser?.photoBookLayout || 'grid'}`;

  const { data: userLinks } = useLinks(currentUser?.id);

  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette?.palette?.[0] || '#ffffff',
      secondary: currentUser?.themePalette?.palette?.[1] || '#f8f8f8',
      accent: currentUser?.themePalette?.palette?.[2] || '#000000',
      neutral: currentUser?.themePalette?.palette?.[3] || '#888888',
    }),
    [currentUser?.themePalette?.palette]
  );

  const socialLinks = useMemo(
    () => userLinks?.filter(link => link.isSocial && !link.archived),
    [userLinks]
  );

  const nonSocialLinks = useMemo(() => userLinks?.filter(link => !link.isSocial), [userLinks]);

  // Add effect to refresh whenever links data changes
  useEffect(() => {
    if (userLinks) {
      setRefreshKey(prev => prev + 1);
    }
  }, [userLinks]);

  useEffect(() => {
    if (currentUser && userLinks) {
      setIsDataLoaded(true);
    }
  }, [currentUser, userLinks]);

  useEffect(() => {
    const handleMessage = event => {
      // Handle string messages (standard format)
      if (
        event.data &&
        typeof event.data === 'string' &&
        ['refresh', 'update_user', 'update_links'].includes(event.data) &&
        iframeRef.current
      ) {
        // Force a complete iframe refresh by updating the key
        setRefreshKey(prev => prev + 1);
        return;
      }

      // Handle structured messages (new format)
      if (event.data && typeof event.data === 'object' && event.data.type && iframeRef.current) {
        const { type } = event.data;

        // Special handling for dimension updates to avoid screen flashing
        if (type === 'update_dimensions') {
          // For dimension updates, we don't need to refresh the entire iframe
          // Instead, we can forward the message to the iframe content
          if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
              // Forward the dimension update to the iframe content
              iframeRef.current.contentWindow.postMessage(event.data, '*');
              console.log('Forwarded dimension update to mobile iframe:', event.data);

              // Clear any existing timeout
              if (dimensionUpdateTimeoutRef.current) {
                clearTimeout(dimensionUpdateTimeoutRef.current);
              }

              // Set a fallback refresh after a delay to ensure synchronization
              // This will only happen if the forwarded message doesn't work properly
              dimensionUpdateTimeoutRef.current = setTimeout(() => {
                console.log('Fallback refresh for dimension update in mobile preview');
                setRefreshKey(prev => prev + 1);
                dimensionUpdateTimeoutRef.current = null;
              }, 500);

              return;
            } catch (error) {
              console.error('Error forwarding dimension update to mobile iframe:', error);
              // Fall through to full refresh on error
            }
          }
        }

        // For other message types, fall back to a full refresh
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up timeout on unmount
      if (dimensionUpdateTimeoutRef.current) {
        clearTimeout(dimensionUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Re-render iframe when photoBookLayout changes
  useEffect(() => {
    if (currentUser?.photoBookLayout) {
      setRefreshKey(prev => prev + 1);
    }
  }, [currentUser?.photoBookLayout]);

  if (isUserLoading) {
    return <Loader message={'Loading...'} bgColor="black" textColor="black" />;
  }

  if (!currentUser?.id) {
    return <NotFound />;
  }

  return (
    <>
      <section
        style={{ background: theme.primary }}
        className="h-[100vh] w-[100vw] overflow-auto relative"
      >
        <iframe
          ref={iframeRef}
          key={`${refreshKey}-${currentUser.handle}-${currentUser.photoBookLayout}-${userLinks ? userLinks.length : 0}`}
          seamless
          loading="lazy"
          title="preview"
          id="preview-mobile"
          className="w-full h-full"
          style={{ height: '100%' }}
          src={url}
        />
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={close}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }}
            className="px-6 py-2 rounded-full text-white border-2 border-white hover:bg-black/50 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </section>
    </>
  );
};

export default PreviewMobile;
