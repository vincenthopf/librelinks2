import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function TestAnalytics() {
  const [envVars, setEnvVars] = useState({
    trackerToken: '',
    dashboardToken: '',
    analyticsToken: '',
    deviceToken: '',
    locationToken: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testHandle, setTestHandle] = useState('test-user');
  const [testResults, setTestResults] = useState({
    pageviews: null,
    devices: null,
    locations: null,
    links: null,
  });

  // Fetch environment variables
  useEffect(() => {
    async function fetchEnvVars() {
      try {
        setLoading(true);
        const response = await fetch('/api/test-tinybird');

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();

        setEnvVars({
          trackerToken: data.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN || '',
          dashboardToken: data.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN || '',
          analyticsToken: data.ANALYTICS_TOKEN || '',
          deviceToken: data.DEVICE_ANALYTICS_TOKEN || '',
          locationToken: data.LOCATION_ANALYTICS_TOKEN || '',
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching environment variables:', err);
        setError(`Failed to fetch environment variables: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvVars();
  }, []);

  // Test an endpoint
  const testEndpoint = async (endpoint, params = {}) => {
    try {
      // Construct query string with test handle and any additional parameters
      const queryParams = new URLSearchParams({
        handle: testHandle,
        ...params,
      });

      const response = await fetch(`/api/tinybird/${endpoint}?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API responded with status ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      // Update test results for this endpoint
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        },
      }));

      return data;
    } catch (err) {
      console.error(`Error testing ${endpoint} endpoint:`, err);

      // Update test results with error
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: err.message,
          timestamp: new Date().toISOString(),
        },
      }));

      return null;
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testEndpoint('pageviews', { timeRange: '30d' });
    await testEndpoint('devices', { timeRange: '30d' });
    await testEndpoint('locations', { timeRange: '30d' });
    await testEndpoint('links', { timeRange: '30d' });
  };

  // Test manual tracking
  const trackManualPageview = async () => {
    try {
      if (typeof window.flock !== 'undefined') {
        await window.flock.trackPageview(window.location.href, testHandle);
        alert('Pageview tracked successfully! Check the console for details.');
      } else {
        throw new Error('window.flock is not defined');
      }
    } catch (err) {
      console.error('Error tracking pageview:', err);
      alert(`Error tracking pageview: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Tinybird Analytics Test</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">Tinybird Analytics Test</h1>

      {/* Environment Variables Section */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>

        {loading ? (
          <p>Loading environment variables...</p>
        ) : error ? (
          <div className="text-red-500">
            <p>{error}</p>
            <p className="mt-2">
              Make sure you have the following environment variables set in your .env.local file:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN</li>
              <li>NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN</li>
              <li>ANALYTICS_TOKEN</li>
              <li>DEVICE_ANALYTICS_TOKEN</li>
              <li>LOCATION_ANALYTICS_TOKEN</li>
            </ul>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Tracker Token:</strong>{' '}
                  {envVars.trackerToken ? `${envVars.trackerToken.substring(0, 10)}...` : 'Not set'}
                </p>
                <p>
                  <strong>Dashboard Token:</strong>{' '}
                  {envVars.dashboardToken
                    ? `${envVars.dashboardToken.substring(0, 10)}...`
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p>
                  <strong>Analytics Token:</strong>{' '}
                  {envVars.analyticsToken
                    ? `${envVars.analyticsToken.substring(0, 10)}...`
                    : 'Not set'}
                </p>
                <p>
                  <strong>Device Token:</strong>{' '}
                  {envVars.deviceToken ? `${envVars.deviceToken.substring(0, 10)}...` : 'Not set'}
                </p>
                <p>
                  <strong>Location Token:</strong>{' '}
                  {envVars.locationToken
                    ? `${envVars.locationToken.substring(0, 10)}...`
                    : 'Not set'}
                </p>
              </div>
            </div>

            {(!envVars.trackerToken || !envVars.dashboardToken) && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                <p>Warning: Some required tokens are missing. Analytics may not work correctly.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Handle Input */}
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
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Run All Tests
        </button>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pageviews */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Pageviews</h3>
          <button
            onClick={() => testEndpoint('pageviews', { timeRange: '30d' })}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
          >
            Test Pageviews
          </button>

          {testResults.pageviews && (
            <div className="mt-2">
              {testResults.pageviews.success ? (
                <div>
                  <p className="text-green-600">Success!</p>
                  <p>Total Visits: {testResults.pageviews.data.totalVisits || 0}</p>
                  <p>Data Points: {testResults.pageviews.data.data?.length || 0}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.pageviews.timestamp}
                  </p>
                </div>
              ) : (
                <div className="text-red-500">
                  <p>Error: {testResults.pageviews.error}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.pageviews.timestamp}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Devices</h3>
          <button
            onClick={() => testEndpoint('devices', { timeRange: '30d' })}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
          >
            Test Devices
          </button>

          {testResults.devices && (
            <div className="mt-2">
              {testResults.devices.success ? (
                <div>
                  <p className="text-green-600">Success!</p>
                  <p>Total Visits: {testResults.devices.data.totalVisits || 0}</p>
                  <p>Data Points: {testResults.devices.data.data?.length || 0}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.devices.timestamp}
                  </p>
                </div>
              ) : (
                <div className="text-red-500">
                  <p>Error: {testResults.devices.error}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.devices.timestamp}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Locations */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Locations</h3>
          <button
            onClick={() => testEndpoint('locations', { timeRange: '30d' })}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
          >
            Test Locations
          </button>

          {testResults.locations && (
            <div className="mt-2">
              {testResults.locations.success ? (
                <div>
                  <p className="text-green-600">Success!</p>
                  <p>Total Visits: {testResults.locations.data.totalVisits || 0}</p>
                  <p>Data Points: {testResults.locations.data.data?.length || 0}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.locations.timestamp}
                  </p>
                </div>
              ) : (
                <div className="text-red-500">
                  <p>Error: {testResults.locations.error}</p>
                  <p className="text-xs text-gray-500">
                    Tested at: {testResults.locations.timestamp}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-2">Links</h3>
          <button
            onClick={() => testEndpoint('links', { timeRange: '30d' })}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mb-3"
          >
            Test Links
          </button>

          {testResults.links && (
            <div className="mt-2">
              {testResults.links.success ? (
                <div>
                  <p className="text-green-600">Success!</p>
                  <p>Total Clicks: {testResults.links.data.totalClicks || 0}</p>
                  <p>Data Points: {testResults.links.data.data?.length || 0}</p>
                  <p className="text-xs text-gray-500">Tested at: {testResults.links.timestamp}</p>
                </div>
              ) : (
                <div className="text-red-500">
                  <p>Error: {testResults.links.error}</p>
                  <p className="text-xs text-gray-500">Tested at: {testResults.links.timestamp}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Tracking Test */}
      <div className="mt-6 p-4 border rounded">
        <h3 className="text-lg font-semibold mb-2">Manual Tracking Test</h3>
        <button
          onClick={trackManualPageview}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 mb-3"
        >
          Track Pageview Manually
        </button>

        <div className="mt-3">
          <p className="text-sm">
            This will attempt to track a pageview using the window.flock object. Check the browser
            console for details.
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold">Troubleshooting</h4>
          <ul className="list-disc ml-6 mt-2 text-sm">
            <li>Make sure your environment variables are correctly set</li>
            <li>Check the browser console for any errors</li>
            <li>Verify that the Tinybird script is loading correctly</li>
            <li>Try using the proxy implementation if direct tracking fails</li>
          </ul>
        </div>
      </div>

      {/* Load Tinybird Flock.js */}
      <Script
        src="https://unpkg.com/@tinybirdco/flock.js"
        data-token={envVars.trackerToken}
        onLoad={() => {
          console.log('Tinybird Flock.js loaded successfully');
        }}
        onError={e => {
          console.error('Error loading Tinybird Flock.js:', e);
        }}
      />
    </div>
  );
}
