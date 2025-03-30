import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Helper function to sanitize data
const sanitizeData = data => {
  // Ensure data is an object
  if (!data || typeof data !== 'object') {
    return {};
  }

  // Create a new object with sanitized values
  const sanitized = {};

  // Process each property
  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) return;

    // Handle different types
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Convert arrays to strings
      sanitized[key] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      // Convert objects to strings
      sanitized[key] = JSON.stringify(value);
    }
  });

  return sanitized;
};

// Function to track events through our proxy (now disabled)
export const trackEvent = async (name, data = {}) => {
  console.log(`ProxyFlock: Tracking disabled for event "${name}"`);
  // Do nothing, return success immediately
  return Promise.resolve(true);
  /*
  try {
    console.log(`ProxyFlock: Tracking event "${name}" with data:`, data);

    // Ensure timestamp is in ISO format
    const eventData = {
      ...sanitizeData(data),
      timestamp: new Date().toISOString(),
      // Add event_name to the data for Tinybird compatibility
      event_name: name,
    };

    // Format the request body according to Tinybird's expected format
    const requestBody = {
      name,
      data: eventData,
    };

    console.log('ProxyFlock: Sending request to /api/tinybird-proxy?endpoint=events');
    console.log('ProxyFlock: Request body:', JSON.stringify(requestBody));

    // Send the event to our proxy endpoint
    const response = await fetch('/api/tinybird-proxy?endpoint=events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status
    console.log(`ProxyFlock: Response status: ${response.status}`);

    // Parse the response JSON
    let responseData;
    try {
      responseData = await response.json();
      console.log('ProxyFlock: Response data:', responseData);
    } catch (jsonError) {
      console.error('ProxyFlock: Error parsing response JSON:', jsonError);
      responseData = { error: 'Failed to parse response' };
    }

    if (!response.ok) {
      console.error('ProxyFlock: Error tracking event:', responseData);

      // Dispatch an event to notify that tracking failed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('trackingFailed', {
            detail: { name, data: eventData, error: responseData },
          })
        );
      }

      return false;
    }

    console.log(`ProxyFlock: Successfully tracked event "${name}"`);
    return true;
  } catch (error) {
    console.error('ProxyFlock: Error tracking event:', error);

    // Dispatch an event to notify that tracking failed
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('trackingFailed', {
          detail: { name, data, error: error.message },
        })
      );
    }

    return false;
  }
  */
};

// Function to track pageviews (now disabled)
export const trackPageview = async (url, handle = null, referrer = null) => {
  console.log(`ProxyFlock: Tracking disabled for pageview: ${url}`);
  // Do nothing, return success immediately
  return Promise.resolve(true);
  /*
  try {
    console.log(`ProxyFlock: Tracking pageview for URL: ${url}`);

    // Get page path from URL
    const path = new URL(url, window.location.origin).pathname;

    // Create pageview data
    const pageviewData = {
      url,
      path,
      handle,
      referrer: referrer || document.referrer || null,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      timestamp: new Date().toISOString(),
    };

    // Track the pageview as an event
    return await trackEvent('pageview', pageviewData);
  } catch (error) {
    console.error('ProxyFlock: Error tracking pageview:', error);
    return false;
  }
  */
};

// Main ProxyFlock component
export const ProxyFlock = ({ children, handle = null, debug = false }) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [trackingErrors, setTrackingErrors] = useState([]);

  // Initialize the flock object
  useEffect(() => {
    // Create a proxy object that mimics the Flock.js API but does nothing
    if (typeof window !== 'undefined' && !window.flock) {
      console.log('ProxyFlock: Initializing disabled flock object');

      // Create the flock object with no-op functions
      window.flock = {
        trackPageview: (url = window.location.href, pageHandle = handle, pageReferrer = null) => {
          console.log(`ProxyFlock: trackPageview called (disabled) for URL: ${url}`);
          return Promise.resolve(true);
        },
        trackEvent: (name, data) => {
          console.log(`ProxyFlock: trackEvent called (disabled) for event: ${name}`);
          return Promise.resolve(true);
        },
        // Add compatibility with Tinybird's push method
        push: event => {
          console.log('ProxyFlock: push called (disabled)');
          return Promise.resolve(true);
          /*
          if (!event || typeof event !== 'object') return;

          const eventName = event.event_name || 'pageview';
          const eventData = { ...event };

          // Remove event_name from data if it exists there
          if (eventData.event_name) {
            delete eventData.event_name;
          }

          if (eventName === 'pageview') {
            return trackPageview(window.location.href, handle);
          } else {
            return trackEvent(eventName, eventData);
          }
          */
        },
      };

      // For backward compatibility
      window.proxyFlock = window.flock;

      // // Track initial pageview if handle is provided (commented out)
      // if (handle) {
      //   trackPageview(window.location.href, handle);
      // }

      if (debug) {
        console.log('ProxyFlock: Debug mode enabled (Tracking Disabled)');
        console.log('ProxyFlock: Handle:', handle);

        // Listen for tracking failures (though none should occur)
        const handleTrackingFailure = event => {
          console.error('ProxyFlock: Tracking failure detected (should not happen):', event.detail);
          setTrackingErrors(prev => [...prev, event.detail]);
        };

        window.addEventListener('trackingFailed', handleTrackingFailure);

        // Cleanup
        return () => {
          window.removeEventListener('trackingFailed', handleTrackingFailure);
        };
      }
    }
  }, [handle, debug]);

  // Track route changes (now disabled)
  useEffect(() => {
    const handleRouteChange = url => {
      console.log(`ProxyFlock: Route change detected (tracking disabled): ${url}`);
      // trackPageview(url, handle);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, handle]);

  // Provide the (disabled) flock object via context or props if needed
  // For now, it just initializes window.flock

  return (
    <>
      {children}
      {debug && trackingErrors.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 10000,
            maxHeight: '150px',
            overflowY: 'auto',
          }}
        >
          <strong>ProxyFlock Debug (Tracking Failures):</strong>
          <ul>
            {trackingErrors.map((error, index) => (
              <li key={index}>{JSON.stringify(error)}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

// Default export for backward compatibility
export default ProxyFlock;
