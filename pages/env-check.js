import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function EnvCheck() {
  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEnvData() {
      try {
        setLoading(true);
        const response = await fetch('/api/test-tinybird');

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        setEnvData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching environment data:', err);
        setError(`Failed to fetch environment data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchEnvData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Environment Variables Check</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <div className="mt-4">
            <h3 className="font-semibold">Troubleshooting:</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>Check that your API route at /api/test-tinybird.js exists and is working</li>
              <li>Verify that your .env.local file contains the necessary environment variables</li>
              <li>Restart your development server to load any new environment variables</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Environment Variables Retrieved Successfully</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded">
              <h2 className="text-xl font-semibold mb-2">Tracker Token</h2>
              <p className="mb-1">
                <span className="font-medium">Status:</span>{' '}
                {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN ? 'Set ✅' : 'Not Set ❌'}
              </p>
              {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN && (
                <p className="text-sm text-gray-600">
                  Preview: {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN}
                </p>
              )}
              <p className="mt-2 text-sm">
                Used for: Tracking pageviews and events from the client-side
              </p>
            </div>

            <div className="p-4 border rounded">
              <h2 className="text-xl font-semibold mb-2">Dashboard Token</h2>
              <p className="mb-1">
                <span className="font-medium">Status:</span>{' '}
                {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN
                  ? 'Set ✅'
                  : 'Not Set ❌'}
              </p>
              {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN && (
                <p className="text-sm text-gray-600">
                  Preview: {envData.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN}
                </p>
              )}
              <p className="mt-2 text-sm">
                Used for: Accessing analytics data from the API endpoints
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Additional Tokens</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-1">Analytics Token</h3>
              <p className="mb-1">
                <span className="font-medium">Status:</span>{' '}
                {envData.ANALYTICS_TOKEN ? 'Set ✅' : 'Not Set ❌'}
              </p>
              {envData.ANALYTICS_TOKEN && (
                <p className="text-sm text-gray-600">Preview: {envData.ANALYTICS_TOKEN}</p>
              )}
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-1">Device Token</h3>
              <p className="mb-1">
                <span className="font-medium">Status:</span>{' '}
                {envData.DEVICE_ANALYTICS_TOKEN ? 'Set ✅' : 'Not Set ❌'}
              </p>
              {envData.DEVICE_ANALYTICS_TOKEN && (
                <p className="text-sm text-gray-600">Preview: {envData.DEVICE_ANALYTICS_TOKEN}</p>
              )}
            </div>

            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-1">Location Token</h3>
              <p className="mb-1">
                <span className="font-medium">Status:</span>{' '}
                {envData.LOCATION_ANALYTICS_TOKEN ? 'Set ✅' : 'Not Set ❌'}
              </p>
              {envData.LOCATION_ANALYTICS_TOKEN && (
                <p className="text-sm text-gray-600">Preview: {envData.LOCATION_ANALYTICS_TOKEN}</p>
              )}
            </div>
          </div>

          <div className="p-4 border rounded mb-6">
            <h2 className="text-xl font-semibold mb-2">API URL</h2>
            <p>
              <span className="font-medium">Tinybird API URL:</span> {envData.TINYBIRD_API_URL}
            </p>
          </div>

          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <h3 className="font-semibold">Next Steps:</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>
                Visit the{' '}
                <Link href="/test-analytics" className="underline">
                  Test Analytics
                </Link>{' '}
                page to test the API endpoints
              </li>
              <li>Check the browser console for any errors related to Tinybird</li>
              <li>If you are experiencing issues, try using the ProxyFlock component</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
