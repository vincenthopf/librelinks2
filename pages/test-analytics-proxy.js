import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import axios from 'axios';

export default function TestAnalyticsProxy() {
  const [envVars, setEnvVars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testHandle, setTestHandle] = useState('test-user');
  const [testResults, setTestResults] = useState({
    proxy: null,
    directEvent: null,
    proxyEvent: null,
  });

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

  // Test the proxy endpoint
  const testProxy = async () => {
    try {
      const response = await fetch('/api/tinybird-proxy');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, proxy: data }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        proxy: { error: err.message },
      }));
    }
  };

  // Test direct event tracking to Tinybird
  const testDirectEvent = async () => {
    try {
      // Create a test event
      const event = {
        name: 'test_event',
        data: {
          path: `/test/${testHandle}`,
          referrer: document.referrer,
          url: window.location.href,
          handle: testHandle,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
      };

      // Send directly to Tinybird
      const token = envVars?.tinybirdToken?.exists
        ? envVars.tinybirdToken.preview + '...'
        : 'missing-token';

      const response = await axios.post(
        `https://api.us-east.tinybird.co/v0/events?name=analytics_events&token=${token}`,
        event
      );

      setTestResults(prev => ({
        ...prev,
        directEvent: {
          status: response.status,
          data: response.data,
        },
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        directEvent: {
          error: err.message,
          code: err.code,
          response: err.response?.data,
        },
      }));
    }
  };

  // Test event tracking through our proxy
  const testProxyEvent = async () => {
    try {
      // Create a test event
      const event = {
        name: 'test_event',
        data: {
          path: `/test/${testHandle}`,
          referrer: document.referrer,
          url: window.location.href,
          handle: testHandle,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
      };

      // Send through our proxy
      const response = await axios.post(
        '/api/tinybird-proxy?endpoint=events?name=analytics_events',
        event
      );

      setTestResults(prev => ({
        ...prev,
        proxyEvent: {
          status: response.status,
          data: response.data,
        },
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        proxyEvent: {
          error: err.message,
          code: err.code,
          response: err.response?.data,
        },
      }));
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testProxy();
    await testDirectEvent();
    await testProxyEvent();
  };

  // Manual tracking test using window.flock
  const trackManualPageview = () => {
    if (typeof window !== 'undefined' && window.flock) {
      try {
        window.flock.trackPageview({
          path: `/test/${testHandle}`,
          handle: testHandle,
        });
        alert('Pageview tracked! Check console for details.');
      } catch (err) {
        alert('Error tracking pageview: ' + err.message);
      }
    } else {
      alert('window.flock is not available. Make sure the script has loaded.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Tinybird Analytics Proxy Test</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">Tinybird Analytics Proxy Test</h1>

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
        <button
          onClick={runAllTests}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run All Tests
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Proxy Test</h2>
          <button
            onClick={testProxy}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mb-2"
          >
            Test Proxy
          </button>
          {testResults.proxy && (
            <pre className="whitespace-pre-wrap bg-gray-800 text-white p-2 rounded text-sm">
              {JSON.stringify(testResults.proxy, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Direct Event Test</h2>
          <button
            onClick={testDirectEvent}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mb-2"
          >
            Test Direct Event
          </button>
          {testResults.directEvent && (
            <pre className="whitespace-pre-wrap bg-gray-800 text-white p-2 rounded text-sm">
              {JSON.stringify(testResults.directEvent, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Proxy Event Test</h2>
          <button
            onClick={testProxyEvent}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mb-2"
          >
            Test Proxy Event
          </button>
          {testResults.proxyEvent && (
            <pre className="whitespace-pre-wrap bg-gray-800 text-white p-2 rounded text-sm">
              {JSON.stringify(testResults.proxyEvent, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Manual Tracking Test</h2>
        <button
          onClick={trackManualPageview}
          className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
        >
          Track Manual Pageview
        </button>
        <p className="mt-2 text-sm">
          This will attempt to use window.flock to track a pageview. Check the console for results.
        </p>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-5">
          <li className="mb-1">
            Check if your browser or network is blocking requests to Tinybird
          </li>
          <li className="mb-1">Verify that your Tinybird tokens are correct and not expired</li>
          <li className="mb-1">
            Make sure the pipe names in your API calls match what is in your Tinybird account
          </li>
          <li className="mb-1">
            Try using the proxy endpoint to bypass potential network restrictions
          </li>
          <li className="mb-1">Check browser console for detailed error messages</li>
        </ol>
      </div>

      {/* Load Tinybird script with debug mode */}
      <Script
        src={`https://unpkg.com/@tinybirdco/flock.js`}
        data-host="https://api.us-east.tinybird.co"
        data-token={process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN}
        data-debug="true"
        onLoad={() => {
          console.log('Tinybird script loaded successfully');
          console.log(
            'Tinybird token exists:',
            !!process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN
          );
          if (window.flock) {
            console.log('window.flock is available');
          } else {
            console.error('window.flock is not available even though script loaded');
          }
        }}
        onError={e => {
          console.error('Error loading Tinybird script:', e);
        }}
      />
    </div>
  );
}
