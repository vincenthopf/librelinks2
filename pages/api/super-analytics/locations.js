import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import {
  queryPlausibleV2,
  formatTimeRangeV2,
  processDimensionResults,
  processMetricsResults,
} from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible location data for a specific user
 *
 * This fetches countries, regions, and cities data
 * filtered by the URL path of the user's page.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  console.log('Locations API called with query:', req.query);

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });

  // Require authentication
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { timeRange = 'day', type = 'countries' } = req.query;
    const userId = session.user.id;

    console.log(
      `Fetching location data for user ID: ${userId}, time range: ${timeRange}, type: ${type}`
    );

    // Initialize Prisma client
    const prisma = new PrismaClient();

    // Get the user's unique path/slug from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true },
    });

    if (!user || !user.handle) {
      await prisma.$disconnect();
      return res.status(404).json({ error: 'User not found or no handle set' });
    }

    // Construct the path to filter by (e.g., "/q6nr393H91")
    const pathToFilter = `/${user.handle}`;
    console.log(`Filtering Plausible data by path: ${pathToFilter}`);

    // Format date range for v2 API
    const date_range = formatTimeRangeV2(timeRange);

    // Determine which dimension to use based on the type
    let dimension;
    switch (type) {
      case 'countries':
        dimension = 'visit:country';
        break;
      case 'regions':
        dimension = 'visit:region';
        break;
      case 'cities':
        dimension = 'visit:city';
        break;
      default:
        dimension = 'visit:country';
    }

    // Make the API request to Plausible v2 API
    const response = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: ['visitors'],
      date_range,
      dimensions: [dimension],
      filters: [['contains', 'event:page', [pathToFilter]]],
    });

    console.log(`Received ${response.results.length} location results for ${dimension}`);

    // Process the response data
    const locations = processDimensionResults(response.results, ['visitors'], [dimension]).map(
      item => {
        // Handle the case where location is null or empty
        const locationName = item[dimension] || 'Unknown';

        return {
          name: locationName,
          country_code: item.meta?.country_code,
          visitors: item.visitors,
        };
      }
    );

    // Prepare the response based on the requested type
    let responseData = {};

    if (type === 'countries') {
      responseData = {
        countries: locations,
        regions: [],
        cities: [],
      };
    } else if (type === 'regions') {
      responseData = {
        countries: [],
        regions: locations,
        cities: [],
      };
    } else if (type === 'cities') {
      responseData = {
        countries: [],
        regions: [],
        cities: locations,
      };
    } else {
      responseData = {
        countries: locations,
        regions: [],
        cities: [],
      };
    }

    // If no data was found, add a fallback "Unknown" entry with the visitor count
    // This ensures we always show something meaningful
    if (locations.length === 0) {
      // Get total visitors for this path to use as the count
      try {
        const aggregateResponse = await queryPlausibleV2({
          site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          metrics: ['visitors'],
          date_range,
          filters: [['contains', 'event:page', [pathToFilter]]],
        });

        const aggregateMetrics = processMetricsResults(aggregateResponse.results, ['visitors']);

        const visitorCount = aggregateMetrics.visitors || 0;

        if (visitorCount > 0) {
          const unknownLocation = {
            name: 'Unknown',
            country_code: null,
            visitors: visitorCount,
          };

          if (type === 'countries') {
            responseData.countries = [unknownLocation];
          } else if (type === 'regions') {
            responseData.regions = [unknownLocation];
          } else if (type === 'cities') {
            responseData.cities = [unknownLocation];
          }

          console.log(`Added fallback "Unknown" location with ${visitorCount} visitors`);
        }
      } catch (aggregateError) {
        console.error('Error fetching aggregate visitor count:', aggregateError.message);
      }
    }

    // Close Prisma connection
    await prisma.$disconnect();

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching Plausible location data:', error.response?.data || error.message);

    // Enhanced error logging
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', JSON.stringify(error.response.headers));
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('No response received');
      console.error('Request details:', JSON.stringify(error.request));
    } else {
      console.error('Error details:', error.message);
    }

    // Handle 404 errors from Plausible (common when no data is available)
    if (error.response?.status === 404) {
      // Create a fallback response with an "Unknown" location
      const fallbackResponse = {
        countries: [],
        regions: [],
        cities: [],
      };

      // Add an "Unknown" entry with 1 visitor as fallback
      const unknownLocation = {
        name: 'Unknown',
        country_code: null,
        visitors: 1,
      };

      if (type === 'countries' || !type) {
        fallbackResponse.countries = [unknownLocation];
      } else if (type === 'regions') {
        fallbackResponse.regions = [unknownLocation];
      } else if (type === 'cities') {
        fallbackResponse.cities = [unknownLocation];
      }

      console.log('Returning fallback location data with "Unknown" entry');
      return res.status(200).json(fallbackResponse);
    }

    return res.status(500).json({
      error: 'Failed to fetch location data',
      details: error.response?.data || error.message,
      info: 'To troubleshoot, check your Plausible API key and domain settings',
    });
  }
}

/**
 * Format time range for Plausible API
 * @param {string} timeRange - Time range parameter from query
 * @returns {Object} Formatted period and date for Plausible API
 */
function formatTimeRange(timeRange) {
  const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

  switch (timeRange) {
    case 'day':
      return { period: 'day', date: today };
    case '7d':
      return { period: '7d', date: today };
    case '30d':
      return { period: '30d', date: today };
    case 'month':
      return { period: 'month', date: today };
    case '6mo':
      return { period: '6mo', date: today };
    case '12mo':
      return { period: '12mo', date: today };
    default:
      return { period: 'day', date: today };
  }
}

/**
 * Get mock locations data for development/testing
 * @returns {Object} Mock locations data
 */
function getMockLocationsData(type) {
  if (type === 'countries') {
    return {
      countries: [
        { name: 'United States', country_code: 'US', visitors: 520 },
        { name: 'United Kingdom', country_code: 'GB', visitors: 243 },
        { name: 'Canada', country_code: 'CA', visitors: 189 },
        { name: 'Germany', country_code: 'DE', visitors: 157 },
        { name: 'France', country_code: 'FR', visitors: 132 },
        { name: 'Australia', country_code: 'AU', visitors: 98 },
      ],
    };
  } else if (type === 'regions') {
    return {
      regions: [
        { name: 'California', visitors: 287 },
        { name: 'New York', visitors: 198 },
        { name: 'Texas', visitors: 154 },
        { name: 'Florida', visitors: 132 },
        { name: 'Illinois', visitors: 87 },
        { name: 'Washington', visitors: 76 },
      ],
    };
  } else if (type === 'cities') {
    return {
      cities: [
        { name: 'San Francisco', visitors: 187 },
        { name: 'New York', visitors: 165 },
        { name: 'London', visitors: 143 },
        { name: 'Los Angeles', visitors: 121 },
        { name: 'Chicago', visitors: 87 },
        { name: 'Toronto', visitors: 76 },
      ],
    };
  }
  return {
    countries: [
      { name: 'United States', country_code: 'US', visitors: 520 },
      { name: 'United Kingdom', country_code: 'GB', visitors: 243 },
      { name: 'Canada', country_code: 'CA', visitors: 189 },
      { name: 'Germany', country_code: 'DE', visitors: 157 },
      { name: 'France', country_code: 'FR', visitors: 132 },
      { name: 'Australia', country_code: 'AU', visitors: 98 },
    ],
    regions: [
      { name: 'California', visitors: 287 },
      { name: 'New York', visitors: 198 },
      { name: 'Texas', visitors: 154 },
      { name: 'Florida', visitors: 132 },
      { name: 'Illinois', visitors: 87 },
      { name: 'Washington', visitors: 76 },
    ],
    cities: [
      { name: 'San Francisco', visitors: 187 },
      { name: 'New York', visitors: 165 },
      { name: 'London', visitors: 143 },
      { name: 'Los Angeles', visitors: 121 },
      { name: 'Chicago', visitors: 87 },
      { name: 'Toronto', visitors: 76 },
    ],
  };
}
