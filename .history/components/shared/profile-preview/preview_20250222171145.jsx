import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef } from 'react';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;
  const iframeRef = useRef(null);

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

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] aspect-[9/19] h-full">
        <div className="absolute inset-0">
          {currentUser && (
            <iframe
              ref={iframeRef}
              key={`${currentUser.headToPicturePadding}-${currentUser.pictureToNamePadding}-${currentUser.betweenCardsPadding}-${currentUser.linkCardHeight}`}
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
