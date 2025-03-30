import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef, useState } from 'react';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true&photoBookLayout=${currentUser?.photoBookLayout || 'grid'}`;
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const dimensionUpdateTimeoutRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const observer = new ResizeObserver(() => {
      if (iframeRef.current) {
        const container = iframeRef.current.parentElement;
        if (container) {
          iframeRef.current.style.height = `${container.offsetHeight}px`;
        }
      }
    });

    observer.observe(iframeRef.current.parentElement);
    return () => observer.disconnect();
  }, []);

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
              console.log('Forwarded dimension update to iframe:', event.data);

              // Clear any existing timeout
              if (dimensionUpdateTimeoutRef.current) {
                clearTimeout(dimensionUpdateTimeoutRef.current);
              }

              // Set a fallback refresh after a delay to ensure synchronization
              // This will only happen if the forwarded message doesn't work properly
              dimensionUpdateTimeoutRef.current = setTimeout(() => {
                console.log('Fallback refresh for dimension update');
                setRefreshKey(prev => prev + 1);
                dimensionUpdateTimeoutRef.current = null;
              }, 500);

              return;
            } catch (error) {
              console.error('Error forwarding dimension update:', error);
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

  return (
    <>
      <div className="relative border-[2px] lg:border-[6px] border-black rounded-[2rem] max-w-80 lg:max-w-96 xl:max-w-[28rem] aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
        <div className="absolute inset-0 z-10">
          {currentUser && (
            <iframe
              ref={iframeRef}
              key={`${refreshKey}-${currentUser.handle}-${currentUser.photoBookLayout}`}
              seamless
              loading="lazy"
              title="preview"
              id="preview"
              className="w-full h-full"
              style={{ height: '100%' }}
              src={url}
            ></iframe>
          )}
        </div>
      </div>
    </>
  );
};

export default Preview;
