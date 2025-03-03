import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function TestAnalyticsLocal() {
  const [envVars, setEnvVars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testHandle, setTestHandle] = useState('test-user');
  const [events, setEvents] = useState([]);

  // Fetch environment variables on load
  useEffect(() => {
    async function fetchEnvVars() {
      try {
        setLoading(true);
        const response = await fetch('/api/test-tinybird');
        const data = await response.json();
        setEnvVars(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch environment variables: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvVars();
  }, []);

  // Initialize our custom analytics tracker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a custom analytics object
      window.localFlock = {
        trackPageview: async (customData = {}) => {
          try {
            const event = {
              name: 'pageview',
              data: {
                path: window.location.pathname,
                referrer: document.referrer,
                url: window.location.href,
                handle: testHandle,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                screen_width: window.screen.width,
                screen_height: window.screen.height,
                ...customData,
              },
            };

            console.log('Tracking pageview via proxy:', event);

            // Send through our proxy
            const response = await axios.post(
              '/api/tinybird-proxy?endpoint=events?name=analytics_events',
              event
            );

            console.log('Proxy response:', response.data);

            // Add to our events list
            setEvents(prev => [
              {
                type: 'pageview',
                timestamp: new Date().toISOString(),
                data: event.data,
                response: {
                  status: response.status,
                  data: response.data,
                },
              },
              ...prev,
            ]);

            return response;
          } catch (err) {
            console.error('Error tracking pageview:', err);

            // Add to our events list
            setEvents(prev => [
              {
                type: 'pageview',
                timestamp: new Date().toISOString(),
                error: err.message,
                data: customData,
              },
              ...prev,
            ]);

            throw err;
          }
        },

        trackEvent: async (eventName, customData = {}) => {
          try {
            const event = {
              name: eventName,
              data: {
                path: window.location.pathname,
                referrer: document.referrer,
                url: window.location.href,
                handle: testHandle,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                screen_width: window.screen.width,
                screen_height: window.screen.height,
                ...customData,
              },
            };

            console.log(`Tracking event "${eventName}" via proxy:`, event);

            // Send through our proxy
            const response = await axios.post(
              '/api/tinybird-proxy?endpoint=events?name=analytics_events',
              event
            );

            console.log('Proxy response:', response.data);

            // Add to our events list
            setEvents(prev => [
              {
                type: eventName,
                timestamp: new Date().toISOString(),
                data: event.data,
                response: {
                  status: response.status,
                  data: response.data,
                },
              },
              ...prev,
            ]);

            return response;
          } catch (err) {
            console.error(`Error tracking event "${eventName}":`, err);

            // Add to our events list
            setEvents(prev => [
              {
                type: eventName,
                timestamp: new Date().toISOString(),
                error: err.message,
                data: customData,
              },
              ...prev,
            ]);

            throw err;
          }
        },
      };

      // Track initial pageview
      window.localFlock.trackPageview().catch(err => {
        console.error('Failed to track initial pageview:', err);
      });
    }
  }, [testHandle]);

  // Track a manual pageview
  const trackManualPageview = () => {
    if (typeof window !== 'undefined' && window.localFlock) {
      window.localFlock
        .trackPageview({
          handle: testHandle,
          custom_property: 'manual_tracking',
        })
        .then(() => {
          console.log('Manual pageview tracked successfully');
        })
        .catch(err => {
          console.error('Error tracking manual pageview:', err);
        });
    } else {
      alert('window.localFlock is not available');
    }
  };

  // Track a custom event
  const trackCustomEvent = () => {
    if (typeof window !== 'undefined' && window.localFlock) {
      window.localFlock
        .trackEvent('button_click', {
          handle: testHandle,
          button_id: 'custom_event_button',
          custom_property: 'test_value',
        })
        .then(() => {
          console.log('Custom event tracked successfully');
        })
        .catch(err => {
          console.error('Error tracking custom event:', err);
        });
    } else {
      alert('window.localFlock is not available');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Local Tinybird Analytics Test</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">Local Tinybird Analytics Test</h1>
      <p className="mb-4">
        This page uses a custom implementation of Tinybird tracking that routes through our local
        proxy to avoid network blocking issues.
      </p>

      {loading ? (
        <p>Loading environment variables...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="whitespace-pre-wrap bg-gray-800 text-white p-4 rounded">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2">
          Test Handle:
          <input
            type="text"
            value={testHandle}
            onChange={e => setTestHandle(e.target.value)}
            className="ml-2 p-1 border rounded"
          />
        </label>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Manual Tracking</h2>
        <div className="flex space-x-4">
          <button
            onClick={trackManualPageview}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Track Pageview
          </button>
          <button
            onClick={trackCustomEvent}
            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
          >
            Track Custom Event
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Tracked Events</h2>
        {events.length === 0 ? (
          <p>No events tracked yet</p>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="p-3 bg-white rounded shadow">
                <div className="flex justify-between">
                  <span className="font-semibold">{event.type}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                {event.error ? (
                  <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                    Error: {event.error}
                  </div>
                ) : (
                  <pre className="mt-2 whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                )}
                {event.response && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold">Response:</div>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded text-sm">
                      {JSON.stringify(event.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5">
          <li className="mb-1">
            This page uses a custom implementation that routes through our local proxy
          </li>
          <li className="mb-1">
            If events are tracked successfully here but not on other pages, it confirms a network
            blocking issue
          </li>
          <li className="mb-1">
            You can implement this approach across your site by modifying the Tinybird script
            loading
          </li>
          <li className="mb-1">Check the server logs for any errors in the proxy endpoint</li>
        </ol>
      </div>
    </div>
  );
}
