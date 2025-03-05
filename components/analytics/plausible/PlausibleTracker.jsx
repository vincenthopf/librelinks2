import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * PlausibleTracker component for tracking user-specific analytics data.
 *
 * This component does NOT inject the Plausible script (that's done in _document.js)
 * but sets up custom property tracking for user IDs.
 *
 * Note: The Plausible script is loaded globally in _document.js to ensure it's
 * available on all pages. This component only adds user tracking functionality.
 */
const PlausibleTracker = ({ customProps = {} }) => {
  const { data: session } = useSession();
  const setupComplete = useRef(false);
  const userId = session?.user?.id;

  // Set up custom props for tracking user ID
  useEffect(() => {
    // Only run if we have a user ID and haven't set up tracking yet
    if (userId && !setupComplete.current && typeof window !== 'undefined') {
      // Check if plausible is available (should be loaded from _document.js)
      const checkPlausibleInterval = setInterval(() => {
        if (window.plausible) {
          clearInterval(checkPlausibleInterval);

          try {
            console.log('Setting up Plausible user tracking for ID:', userId);

            // Add user ID to all subsequent events
            const originalPlausible = window.plausible;
            window.plausible = function (eventName, options) {
              const mergedOptions = {
                ...options,
                props: {
                  ...(options?.props || {}),
                  userId: userId,
                  ...customProps,
                },
              };

              return originalPlausible(eventName, mergedOptions);
            };

            // Track page view with user ID
            window.plausible('pageview', {
              props: {
                userId: userId,
                ...customProps,
              },
            });

            setupComplete.current = true;
          } catch (error) {
            console.error('Error setting up Plausible user tracking:', error);
          }
        }
      }, 500); // Check every 500ms

      // Clean up interval on unmount
      return () => clearInterval(checkPlausibleInterval);
    }
  }, [userId, customProps]);

  // This component doesn't render anything
  return null;
};

export default PlausibleTracker;
