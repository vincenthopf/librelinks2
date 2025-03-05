/**
 * Plausible Analytics API v2 Utilities
 *
 * This file contains utility functions for interacting with the Plausible Analytics API v2.
 * The v2 API uses a single endpoint with POST requests instead of multiple GET endpoints in v1.
 */

import axios from 'axios';

/**
 * Make a request to the Plausible v2 API
 * @param {Object} queryParams - Query parameters for the API
 * @returns {Promise} - Promise resolving to the API response
 */
export async function queryPlausibleV2(queryParams) {
  const apiKey = process.env.PLAUSIBLE_API_KEY;
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error('Plausible API key or domain not configured');
  }

  // Ensure site_id is set
  const params = {
    site_id: domain,
    ...queryParams,
  };

  console.log('Making Plausible v2 API request with params:', JSON.stringify(params, null, 2));

  try {
    // Make the API request
    const response = await axios.post('https://plausible.io/api/v2/query', params, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Plausible v2 API response received');

    // Validate response structure
    if (!response.data || !response.data.results) {
      console.warn('Unexpected API response structure:', JSON.stringify(response.data, null, 2));
      return { results: [] };
    }

    return response.data;
  } catch (error) {
    console.error('Error in Plausible v2 API request:', error.message);

    // Enhanced error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers));
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('No response received');
      console.error('Request details:', JSON.stringify(error.request));
    }

    throw error;
  }
}

/**
 * Format time range for Plausible v2 API
 * @param {string} timeRange - Time range parameter from query
 * @returns {string|Array} Formatted date range for Plausible v2 API
 */
export function formatTimeRangeV2(timeRange) {
  // For predefined time ranges, return the string directly as per API docs
  switch (timeRange) {
    case 'day':
      return 'day';
    case '7d':
      return '7d';
    case '30d':
      return '30d';
    case 'month':
      return 'month';
    case '6mo':
      return '6mo';
    case '12mo':
      return '12mo';
    case 'year':
      return 'year';
    case 'all':
      return 'all';
    default:
      // For custom date ranges, we would return an array with start and end dates
      // For now, default to 'day' if an unrecognized format is provided
      console.warn(`Unrecognized time range format: ${timeRange}, defaulting to 'day'`);
      return 'day';
  }
}

/**
 * Process metrics results from Plausible v2 API
 * Converts the metrics array to an object with named properties
 * @param {Array} results - Results array from the API response
 * @param {Array} metricNames - Array of metric names in the same order as the metrics array
 * @returns {Object} - Object with metric names as keys and values from the metrics array
 */
export function processMetricsResults(results, metricNames) {
  if (!results || results.length === 0) {
    // Return an object with all metrics set to 0
    return metricNames.reduce((acc, name) => {
      acc[name] = 0;
      return acc;
    }, {});
  }

  // Get the first result (for aggregate queries)
  const firstResult = results[0];

  // Check if metrics array exists
  if (!firstResult.metrics || !Array.isArray(firstResult.metrics)) {
    console.warn('Invalid metrics data in API response:', JSON.stringify(firstResult, null, 2));
    return metricNames.reduce((acc, name) => {
      acc[name] = 0;
      return acc;
    }, {});
  }

  // Create an object with metric names as keys and values from the metrics array
  return metricNames.reduce((acc, name, index) => {
    // Handle numeric values properly
    const value = firstResult.metrics[index];
    acc[name] = value !== undefined && value !== null ? value : 0;

    // Format floating point values to 2 decimal places if needed
    if (typeof acc[name] === 'number' && !Number.isInteger(acc[name])) {
      acc[name] = parseFloat(acc[name].toFixed(2));
    }

    return acc;
  }, {});
}

/**
 * Process dimension results from Plausible v2 API
 * Converts the results array to an array of objects with named properties
 * @param {Array} results - Results array from the API response
 * @param {Array} metricNames - Array of metric names in the same order as the metrics array
 * @param {Array} dimensionNames - Array of dimension names in the same order as the dimensions array
 * @returns {Array} - Array of objects with dimension and metric properties
 */
export function processDimensionResults(results, metricNames, dimensionNames) {
  if (!results || results.length === 0) {
    return [];
  }

  return results.map(result => {
    const item = {};

    // Validate result structure
    if (!result.dimensions || !Array.isArray(result.dimensions)) {
      console.warn('Invalid dimensions data in API response:', JSON.stringify(result, null, 2));
      dimensionNames.forEach(name => {
        item[name] = null;
      });
    } else {
      // Add dimensions
      dimensionNames.forEach((name, index) => {
        item[name] = result.dimensions[index] !== undefined ? result.dimensions[index] : null;
      });
    }

    // Validate metrics structure
    if (!result.metrics || !Array.isArray(result.metrics)) {
      console.warn('Invalid metrics data in API response:', JSON.stringify(result, null, 2));
      metricNames.forEach(name => {
        item[name] = 0;
      });
    } else {
      // Add metrics
      metricNames.forEach((name, index) => {
        const value = result.metrics[index];
        item[name] = value !== undefined && value !== null ? value : 0;

        // Format floating point values to 2 decimal places if needed
        if (typeof item[name] === 'number' && !Number.isInteger(item[name])) {
          item[name] = parseFloat(item[name].toFixed(2));
        }
      });
    }

    return item;
  });
}
