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

// Function to track events through our proxy
export const trackEvent = async (name, data = {}) => {
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
};

// Function to track pageviews
export const trackPageview = async (url, handle = null, referrer = null) => {
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
};

// Main ProxyFlock component
export const ProxyFlock = ({ children, handle = null, debug = false }) => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [trackingErrors, setTrackingErrors] = useState([]);

  // Initialize the flock object
  useEffect(() => {
    // Create a proxy object that mimics the Flock.js API
    if (typeof window !== 'undefined' && !window.flock) {
      console.log('ProxyFlock: Initializing proxy flock object');

      // Create the flock object
      window.flock = {
        trackPageview: (url = window.location.href, pageHandle = handle, pageReferrer = null) =>
          trackPageview(url, pageHandle, pageReferrer),
        trackEvent: (name, data) => trackEvent(name, data),
        // Add compatibility with Tinybird's push method
        push: event => {
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
        },
      };

      // For backward compatibility
      window.proxyFlock = window.flock;

      // Track initial pageview if handle is provided
      if (handle) {
        trackPageview(window.location.href, handle);
      }

      if (debug) {
        console.log('ProxyFlock: Debug mode enabled');
        console.log('ProxyFlock: Handle:', handle);

        // Listen for tracking failures
        const handleTrackingFailure = event => {
          console.error('ProxyFlock: Tracking failure detected:', event.detail);
          setTrackingErrors(prev => [...prev, event.detail]);
        };

        window.addEventListener('trackingFailed', handleTrackingFailure);

        // Cleanup
        return () => {
          window.removeEventListener('trackingFailed', handleTrackingFailure);
        };
      }

      setIsLoaded(true);
      console.log('ProxyFlock: Proxy flock object initialized');
    }
  }, [handle, debug]);

  // Track route changes
  useEffect(() => {
    if (!router) return;

    const handleRouteChange = url => {
      // Use setTimeout to ensure the page has loaded
      setTimeout(() => {
        // Get the handle from the current route if not provided
        let currentHandle = handle;

        // If no handle was provided, try to extract it from the URL
        if (!currentHandle) {
          const match = url.match(/\/([^\/]+)$/);
          if (match && match[1]) {
            currentHandle = match[1];
          }
        }

        if (debug) {
          console.log(`ProxyFlock: Route changed to ${url}, handle:`, currentHandle);
        }

        trackPageview(url, currentHandle);
      }, 100);
    };

    // Subscribe to route change events
    router.events.on('routeChangeComplete', handleRouteChange);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, handle, debug]);

  // Render debug information if in debug mode
  if (debug && trackingErrors.length > 0) {
    return (
      <>
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid red',
            padding: '10px',
            borderRadius: '5px',
            maxWidth: '300px',
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '12px',
          }}
        >
          <h4 style={{ margin: '0 0 5px 0' }}>ProxyFlock Debug ({trackingErrors.length} errors)</h4>
          <ul style={{ margin: 0, padding: '0 0 0 20px' }}>
            {trackingErrors.slice(-5).map((error, i) => (
              <li key={i}>
                {error.name}: {error.error?.toString() || 'Unknown error'}
              </li>
            ))}
          </ul>
        </div>
        {children || null}
      </>
    );
  }

  return children || null;
};

// Default export for backward compatibility
export default ProxyFlock;
