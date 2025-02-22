import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef } from 'react';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true`;
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (iframeRef.current) {
        const container = iframeRef.current.parentElement;
        if (container) {
          const height = container.offsetHeight;
          iframeRef.current.style.height = `${height}px`;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="relative border-[4px] lg:border-[8px] border-black rounded-[2.5rem] aspect-[9/19] overflow-hidden mx-auto">
        <div className="relative h-full w-full">
          {currentUser && (
            <iframe
              ref={iframeRef}
              key={currentUser.headToPicturePadding + currentUser.pictureToNamePadding + currentUser.betweenCardsPadding + currentUser.linkCardHeight}
              seamless
              loading="lazy"
              title="preview"
              id="preview"
              className="h-full w-full"
              src={url}
            ></iframe>
          )}
        </div>
      </div>
    </>
  );
};

export default Preview;
