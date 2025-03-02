import { useEffect, useRef } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { forceRefreshAllIframes } from './frame-refresh';
import { signalIframe } from '@/utils/helpers';

/**
 * Component that handles frame refreshes at the application level
 * This component doesn't render anything, it just handles the refresh logic
 */
const FrameRefreshHandler = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);
  const prevDimensionsRef = useRef({ width: 0, height: 0 });
  const refreshTimeoutRef = useRef(null);
  const initialLoadRef = useRef(true);

  // Initial refresh when the component mounts
  useEffect(() => {
    // Small delay to ensure the page has loaded
    const timeoutId = setTimeout(() => {
      if (initialLoadRef.current) {
        console.log('FrameRefreshHandler: Initial refresh');
        forceRefreshAllIframes();
        initialLoadRef.current = false;
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle frame dimension changes
  useEffect(() => {
    if (fetchedUser?.frameWidth && fetchedUser?.frameHeight) {
      // Check if dimensions have actually changed
      const prevWidth = prevDimensionsRef.current.width;
      const prevHeight = prevDimensionsRef.current.height;
      const currentWidth = fetchedUser.frameWidth;
      const currentHeight = fetchedUser.frameHeight;

      if (Math.abs(currentWidth - prevWidth) > 5 || Math.abs(currentHeight - prevHeight) > 5) {
        console.log('FrameRefreshHandler: Dimensions changed significantly', {
          prevWidth,
          currentWidth,
          prevHeight,
          currentHeight,
        });

        // Update the stored dimensions
        prevDimensionsRef.current = {
          width: currentWidth,
          height: currentHeight,
        };

        // Clear any existing timeout
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        // Use a balanced approach - first try a gentle update
        signalIframe('update_user');
      } else if (prevWidth === 0 && prevHeight === 0) {
        // First time setting dimensions
        prevDimensionsRef.current = {
          width: currentWidth,
          height: currentHeight,
        };
      }
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchedUser?.frameWidth, fetchedUser?.frameHeight]);

  // Handle image changes
  useEffect(() => {
    if (fetchedUser?.image) {
      // When the image changes, refresh to ensure proper display
      const timeoutId = setTimeout(() => {
        signalIframe('update_user');
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [fetchedUser?.image]);

  // This component doesn't render anything
  return null;
};

export default FrameRefreshHandler;
