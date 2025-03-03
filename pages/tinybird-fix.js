import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function TinybirdFix() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFixQuarantine = async () => {
    try {
      setLoading(true);
      setError(null);
      setResults(null);

      const response = await axios.post('/api/tinybird/fix-quarantine');
      setResults(response.data);
    } catch (err) {
      console.error('Error fixing quarantined data:', err);
      setError(err.response?.data?.message || err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Fix Tinybird Quarantined Data</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Fix Tinybird Quarantined Data</h1>

      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">About Quarantined Data</h2>
        <p className="mb-4">
          When Tinybird receives data that does not match the expected schema, it places the data in
          a quarantine table. This page helps you fix those quarantined rows by:
        </p>
        <ol className="list-decimal pl-5 space-y-2 mb-4">
          <li>Retrieving the quarantined data from Tinybird</li>
          <li>Fixing type issues in the data</li>
          <li>Re-sending the corrected data to Tinybird</li>
        </ol>
        <p>
          This process helps recover analytics data that would otherwise be lost due to type errors.
        </p>
      </div>

      <div className="mb-8">
        <button
          onClick={handleFixQuarantine}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processing...' : 'Fix Quarantined Data'}
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-semibold mb-2">Results</h3>
          <p className="mb-2">{results.message}</p>

          {results.results && (
            <div className="mt-4">
              <p>Processed: {results.results.processed}</p>
              <p>Fixed: {results.results.fixed}</p>

              {results.results.errors && results.results.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">Errors ({results.results.errors.length})</h4>
                  <ul className="list-disc pl-5 mt-2">
                    {results.results.errors.map((err, index) => (
                      <li key={index}>
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Preventing Future Issues</h2>
        <p className="mb-2">
          To prevent data from being quarantined in the future, we have implemented:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Data validation and sanitization in the proxy endpoint</li>
          <li>Type checking in the ProxyFlock component</li>
          <li>Proper error handling for analytics tracking</li>
        </ul>
        <p className="mt-4">
          These measures should significantly reduce the likelihood of data being quarantined due to
          type errors.
        </p>
      </div>
    </div>
  );
}
