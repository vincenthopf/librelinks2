import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_FRAME_COLOR, DEFAULT_FRAME_TYPE } from '@/utils/frame-helpers';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;
  const iframeRef = useRef(null);
  const [error, setError] = useState(false);

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

  const handleIframeError = () => {
    setError(true);
    console.error('Preview iframe failed to load');
  };

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] w-72 lg:w-80 xl:w-96 aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
        <div className="absolute inset-0 z-10">
          {currentUser && !error && (
            <iframe
              ref={iframeRef}
              key={`${currentUser.headToPicturePadding}-${currentUser.pictureToNamePadding}-${currentUser.betweenCardsPadding}-${currentUser.linkCardHeight}-${currentUser.profileFrameType || DEFAULT_FRAME_TYPE}-${currentUser.profileFrameColor || DEFAULT_FRAME_COLOR}`}
              seamless
              loading="lazy"
              title="preview"
              id="preview"
              className="w-full h-full"
              style={{ height: '100%' }}
              src={url}
              onError={handleIframeError}
            ></iframe>
          )}
          {error && (
            <div className="flex items-center justify-center h-full text-center p-4 text-gray-500">
              Failed to load preview. Please refresh the page.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Preview;
