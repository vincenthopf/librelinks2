import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef, useState } from 'react';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true&photoBookLayout=${currentUser?.photoBookLayout || 'grid'}`;
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    const handleMessage = (event) => {
      if (event.data === 'refresh' && iframeRef.current) {
        // Force a complete iframe refresh by updating the key
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Re-render iframe when photoBookLayout changes
  useEffect(() => {
    if (currentUser?.photoBookLayout) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [currentUser?.photoBookLayout]);

  return (
    <>
      <div className="relative border-[2px] lg:border-[8px] border-black rounded-[2rem] max-w-80 lg:max-w-96 xl:max-w-[28rem] aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
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
