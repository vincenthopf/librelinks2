import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import {
  queryPlausibleV2,
  formatTimeRangeV2,
  processDimensionResults,
  processMetricsResults,
} from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible device data for a specific user
 *
 * This fetches browser, OS, and screen size data
 * filtered by the URL path of the user's page.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  console.log('Devices API called with query:', req.query);

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
    const { timeRange = 'day', type = 'browser' } = req.query;
    const userId = session.user.id;

    console.log(
      `Fetching device data for user ID: ${userId}, time range: ${timeRange}, type: ${type}`
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
    // console.log(`Filtering Plausible data by path: ${pathToFilter}`);

    // Format date range for v2 API
    const date_range = formatTimeRangeV2(timeRange);

    // Determine which dimension to use based on the type
    let dimension;
    switch (type) {
      case 'browser':
        dimension = 'visit:browser';
        break;
      case 'os':
        dimension = 'visit:os';
        break;
      case 'size':
        dimension = 'visit:device';
        break;
      default:
        dimension = 'visit:browser';
    }

    // Make the API request to Plausible v2 API
    const response = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: ['visitors'],
      date_range,
      dimensions: [dimension],
      filters: [['contains', 'event:page', [pathToFilter]]],
    });

    // console.log(`Received ${response.results.length} device results for ${dimension}`);

    // Process the response data
    const devices = processDimensionResults(response.results, ['visitors'], [dimension]).map(
      item => ({
        name: item[dimension] || 'Unknown',
        visitors: item.visitors,
      })
    );

    // Prepare the response object
    const responseData = {
      browsers: [],
      operating_systems: [],
      screen_sizes: [],
    };

    // Populate the appropriate field based on the requested type
    switch (type) {
      case 'browser':
        responseData.browsers = devices;
        break;
      case 'os':
        responseData.operating_systems = devices;
        break;
      case 'size':
        responseData.screen_sizes = devices;
        break;
      default:
        responseData.browsers = devices;
    }

    // If no data was found, add a fallback entry with the visitor count
    if (devices.length === 0) {
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
          const unknownDevice = {
            name: 'Unknown',
            visitors: visitorCount,
          };

          switch (type) {
            case 'browser':
              responseData.browsers = [unknownDevice];
              break;
            case 'os':
              responseData.operating_systems = [unknownDevice];
              break;
            case 'size':
              responseData.screen_sizes = [unknownDevice];
              break;
            default:
              responseData.browsers = [unknownDevice];
          }

          console.log(`Added fallback "Unknown" device with ${visitorCount} visitors`);
        }
      } catch (aggregateError) {
        console.error('Error fetching aggregate visitor count:', aggregateError.message);
      }
    }

    // Close Prisma connection
    await prisma.$disconnect();

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching Plausible device data:', error.response?.data || error.message);

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
      // Create a fallback response with an "Unknown" device
      const fallbackResponse = {
        browsers: [],
        operating_systems: [],
        screen_sizes: [],
      };

      // Add an "Unknown" entry with 1 visitor as fallback
      const unknownDevice = {
        name: 'Unknown',
        visitors: 1,
      };

      if (type === 'browser' || !type) {
        fallbackResponse.browsers = [unknownDevice];
      } else if (type === 'os') {
        fallbackResponse.operating_systems = [unknownDevice];
      } else if (type === 'size') {
        fallbackResponse.screen_sizes = [unknownDevice];
      }

      console.log('Returning fallback device data with "Unknown" entry');
      return res.status(200).json(fallbackResponse);
    }

    return res.status(500).json({
      error: 'Failed to fetch device data',
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
 * Get mock devices data for development/testing
 * @returns {Object} Mock devices data
 */
function getMockDevicesData(type) {
  if (type === 'browser') {
    return {
      browsers: [
        { name: 'Chrome', visitors: 532 },
        { name: 'Safari', visitors: 287 },
        { name: 'Firefox', visitors: 143 },
        { name: 'Edge', visitors: 98 },
        { name: 'Opera', visitors: 43 },
        { name: 'Internet Explorer', visitors: 12 },
      ],
      operating_systems: [],
      screen_sizes: [],
    };
  } else if (type === 'os') {
    return {
      browsers: [],
      operating_systems: [
        { name: 'Windows', visitors: 387 },
        { name: 'macOS', visitors: 342 },
        { name: 'iOS', visitors: 187 },
        { name: 'Android', visitors: 154 },
        { name: 'Linux', visitors: 89 },
        { name: 'ChromeOS', visitors: 32 },
      ],
      screen_sizes: [],
    };
  } else if (type === 'size') {
    return {
      browsers: [],
      operating_systems: [],
      screen_sizes: [
        { name: 'Desktop', visitors: 643 },
        { name: 'Mobile', visitors: 298 },
        { name: 'Tablet', visitors: 89 },
      ],
    };
  } else {
    return {
      browsers: [
        { name: 'Chrome', visitors: 532 },
        { name: 'Safari', visitors: 287 },
        { name: 'Firefox', visitors: 143 },
        { name: 'Edge', visitors: 98 },
        { name: 'Opera', visitors: 43 },
        { name: 'Internet Explorer', visitors: 12 },
      ],
      operating_systems: [
        { name: 'Windows', visitors: 387 },
        { name: 'macOS', visitors: 342 },
        { name: 'iOS', visitors: 187 },
        { name: 'Android', visitors: 154 },
        { name: 'Linux', visitors: 89 },
        { name: 'ChromeOS', visitors: 32 },
      ],
      screen_sizes: [
        { name: 'Desktop', visitors: 643 },
        { name: 'Mobile', visitors: 298 },
        { name: 'Tablet', visitors: 89 },
      ],
    };
  }
}
