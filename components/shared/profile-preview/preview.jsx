import useCurrentUser from '@/hooks/useCurrentUser';
import { getCurrentBaseURL } from '@/utils/helpers';
import { useEffect, useRef, useState, useMemo } from 'react';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';

const Preview = () => {
  const { data: currentUser } = useCurrentUser();
  const baseURL = getCurrentBaseURL();
  const url = `${baseURL}/${currentUser?.handle}?isIframe=true&photoBookLayout=${currentUser?.photoBookLayout || 'grid'}`;
  const iframeRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const dimensionUpdateTimeoutRef = useRef(null);

  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);
  const { photos } = usePhotoBook();

  // Create a value that changes when link orders change
  const linksOrderString = useMemo(() => {
    if (!userLinks) return '';
    // Sort the links by order to create a consistent ordering before joining
    return [...userLinks]
      .sort((a, b) => a.order - b.order)
      .map(link => `${link.id}-${link.order}`)
      .join('|');
  }, [userLinks]);

  // Create a value that changes when text orders change
  const textsOrderString = useMemo(() => {
    if (!userTexts) return '';
    // Sort the texts by order to create a consistent ordering before joining
    return [...userTexts]
      .sort((a, b) => a.order - b.order)
      .map(text => `${text.id}-${text.order}`)
      .join('|');
  }, [userTexts]);

  // Create a value that changes when photo orders change
  const photosOrderString = useMemo(() => {
    if (!photos) return '';
    // Sort photos by order before creating the string for consistency
    return [...photos]
      .sort((a, b) => a.order - b.order)
      .map(p => `${p.id}-${p.order}`)
      .join('|');
  }, [photos]);

  // Create a comprehensive string representation of links for dependency tracking
  const linksSnapshot = useMemo(() => {
    if (!userLinks) return '';
    // Sort links for consistency before stringifying
    return JSON.stringify(
      [...userLinks]
        .sort((a, b) => a.order - b.order)
        .map(link => ({
          id: link.id,
          order: link.order,
          title: link.title, // Include title
          url: link.url, // Include url
          archived: link.archived, // Include archived status
          isSocial: link.isSocial, // Include type
          alwaysExpandEmbed: link.alwaysExpandEmbed, // Include expansion state
        }))
    );
  }, [userLinks]);

  // Create a string representation of animation settings for dependency tracking
  const animationSettings = useMemo(() => {
    const frameAnimString = currentUser?.frameAnimation
      ? JSON.stringify(currentUser.frameAnimation)
      : '{}';
    const contentAnimString = currentUser?.contentAnimation
      ? JSON.stringify(currentUser.contentAnimation)
      : '{}';
    return `${frameAnimString}|${contentAnimString}`;
  }, [currentUser?.frameAnimation, currentUser?.contentAnimation]);

  const refreshDependencies = [
    currentUser?.handle,
    currentUser?.photoBookLayout,
    userTexts?.length,
    photos?.length,
    linksSnapshot, // Use the comprehensive snapshot
    textsOrderString, // Add dependency on text orders
    photosOrderString, // Add dependency on photo order
    currentUser?.photoBookOrder, // Keep this? Or remove? Let's keep for now.
    animationSettings, // Add dependency on animation settings
  ];

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
    setRefreshKey(prev => prev + 1);
  }, refreshDependencies);

  useEffect(() => {
    const handleMessage = event => {
      // Handle string messages
      if (
        event.data &&
        typeof event.data === 'string' &&
        ['refresh', 'update_user', 'update_links'].includes(event.data) && // Re-add 'refresh'
        iframeRef.current
      ) {
        console.log('Preview: Received string message, forcing full reload:', event.data);
        setRefreshKey(prev => prev + 1);
        return;
      }

      // Handle structured messages (like update_dimensions)
      if (event.data && typeof event.data === 'object' && event.data.type && iframeRef.current) {
        const { type } = event.data;

        // Special handling for dimension updates
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

        // Fallback for other *structured* messages (if any appear later)
        console.log(
          'Preview: Received unhandled structured message, forcing full reload:',
          event.data
        );
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
      <div className="relative border-[2px] lg:border-[5px] border-black rounded-[2rem] max-w-80 lg:max-w-96 xl:max-w-[28rem] aspect-[9/19] overflow-hidden max-w-sm mx-auto z-0">
        {/* Dynamic Island */}
        <div className="absolute inset-0 z-10">
          {currentUser && (
            <iframe
              ref={iframeRef}
              key={`${refreshKey}-${currentUser.handle}-${currentUser.photoBookLayout}-${linksSnapshot}-${textsOrderString}-${photosOrderString}-${currentUser?.photoBookOrder}-${animationSettings}`}
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
