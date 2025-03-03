import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function TestProxyFlock() {
  const [logs, setLogs] = useState([]);
  const [handle, setHandle] = useState('test-handle');
  const [eventName, setEventName] = useState('test_event');
  const [eventData, setEventData] = useState('{}');
  const [proxyStatus, setProxyStatus] = useState('unknown');

  // Add a log entry with timestamp
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Test the proxy endpoint
  const testProxy = async () => {
    try {
      addLog('Testing proxy endpoint...');
      const response = await axios.post(
        '/api/tinybird-proxy?endpoint=events?name=analytics_events',
        {
          name: 'test_proxy',
          data: {
            path: window.location.pathname,
            timestamp: new Date().toISOString(),
            test: true,
          },
        }
      );
      addLog(`Proxy test successful: ${JSON.stringify(response.data)}`, 'success');
      setProxyStatus('working');
    } catch (error) {
      addLog(`Proxy test failed: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
      setProxyStatus('error');
    }
  };

  // Track a pageview using our proxy
  const trackPageview = async () => {
    try {
      addLog(`Tracking pageview for handle: ${handle}`);
      const response = await axios.post(
        '/api/tinybird-proxy?endpoint=events?name=analytics_events',
        {
          name: 'pageview',
          data: {
            path: window.location.pathname,
            referrer: document.referrer,
            url: window.location.href,
            handle: handle,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_width: window.screen.width,
            screen_height: window.screen.height,
          },
        }
      );
      addLog(`Pageview tracked successfully: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`Failed to track pageview: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  };

  // Track a custom event using our proxy
  const trackCustomEvent = async () => {
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(eventData);
      } catch (e) {
        addLog(`Warning: Could not parse event data as JSON. Using empty object.`, 'warning');
      }

      addLog(`Tracking custom event: ${eventName}`);
      const response = await axios.post(
        '/api/tinybird-proxy?endpoint=events?name=analytics_events',
        {
          name: eventName,
          data: {
            path: window.location.pathname,
            url: window.location.href,
            handle: handle,
            timestamp: new Date().toISOString(),
            ...parsedData,
          },
        }
      );
      addLog(`Custom event tracked successfully: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`Failed to track custom event: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  };

  // Test the pageviews API
  const testPageviewsAPI = async () => {
    try {
      addLog(`Testing pageviews API for handle: ${handle}`);
      const response = await axios.get(`/api/tinybird/pageviews?handle=${handle}`);
      addLog(`Pageviews API response: ${JSON.stringify(response.data)}`, 'success');
    } catch (error) {
      addLog(`Pageviews API error: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  };

  // Check if our proxy is working on page load
  useEffect(() => {
    testProxy();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Tinybird Proxy Test</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Tinybird Proxy Test</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">
          Proxy Status:
          <span
            className={`ml-2 ${
              proxyStatus === 'working'
                ? 'text-green-600'
                : proxyStatus === 'error'
                  ? 'text-red-600'
                  : 'text-gray-600'
            }`}
          >
            {proxyStatus === 'working' ? 'Working' : proxyStatus === 'error' ? 'Error' : 'Unknown'}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Handle</label>
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={testProxy}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Test Proxy
            </button>
            <button
              onClick={trackPageview}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            >
              Track Pageview
            </button>
            <button
              onClick={testPageviewsAPI}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test API
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Custom Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Data (JSON)</label>
              <input
                type="text"
                value={eventData}
                onChange={e => setEventData(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={trackCustomEvent}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Track Custom Event
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Logs</h2>
        <div className="h-96 overflow-y-auto border rounded p-4 bg-gray-900 text-gray-100 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet...</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.type === 'error'
                    ? 'text-red-400'
                    : log.type === 'success'
                      ? 'text-green-400'
                      : log.type === 'warning'
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{log.timestamp.split('T')[1].split('.')[0]}]</span>{' '}
                {log.message}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setLogs([])}
          className="mt-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
        >
          Clear Logs
        </button>
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>If the proxy test fails, check the server logs for more details.</li>
          <li>
            Verify that your{' '}
            <code className="bg-gray-200 px-1 rounded">
              NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN
            </code>{' '}
            environment variable is set correctly.
          </li>
          <li>
            Check the Network tab in your browser developer tools to see the requests being made.
          </li>
          <li>
            If you are seeing{' '}
            <code className="bg-gray-200 px-1 rounded">net::ERR_BLOCKED_BY_ADMINISTRATOR</code>{' '}
            errors, this proxy solution should help bypass those restrictions.
          </li>
        </ul>
      </div>
    </div>
  );
}
