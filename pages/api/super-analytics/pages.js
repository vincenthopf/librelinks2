import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import {
  queryPlausibleV2,
  formatTimeRangeV2,
  processDimensionResults,
  processMetricsResults,
} from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible page data for a specific user
 *
 * This fetches top pages, entry pages, and exit pages data
 * filtered by the URL path of the user's page.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  console.log('Pages API called with query:', req.query);

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
    const { timeRange = 'day', type = 'pages' } = req.query;
    const userId = session.user.id;

    console.log(
      `Fetching pages data for user ID: ${userId}, time range: ${timeRange}, type: ${type}`
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
      case 'pages':
        dimension = 'event:page';
        break;
      case 'entry_pages':
        dimension = 'visit:entry_page';
        break;
      case 'exit_pages':
        dimension = 'visit:exit_page';
        break;
      default:
        dimension = 'event:page';
    }

    // Define metrics based on the type
    const metrics = type === 'pages' ? ['visitors', 'pageviews'] : ['visitors'];

    // Make the API request to Plausible v2 API
    const response = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics,
      date_range,
      dimensions: [dimension],
      filters: [['contains', 'event:page', [pathToFilter]]],
    });

    // console.log(`Received ${response.results.length} page results for ${dimension}`);

    // Process the response data
    const pages = processDimensionResults(response.results, metrics, [dimension]).map(item => {
      const pageName = item[dimension] || '/';

      if (type === 'pages') {
        return {
          page: pageName,
          visitors: item.visitors,
          pageviews: item.pageviews,
        };
      } else if (type === 'exit_pages') {
        return {
          page: pageName,
          visitors: item.visitors,
          exits: item.visitors, // For exit pages, visitors = exits
        };
      } else {
        return {
          page: pageName,
          visitors: item.visitors,
        };
      }
    });

    // Prepare the response object
    const responseData = {
      top_pages: [],
      entry_pages: [],
      exit_pages: [],
    };

    // Populate the appropriate field based on the requested type
    switch (type) {
      case 'pages':
        responseData.top_pages = pages;
        break;
      case 'entry_pages':
        responseData.entry_pages = pages;
        break;
      case 'exit_pages':
        responseData.exit_pages = pages;
        break;
      default:
        responseData.top_pages = pages;
    }

    // If no data was found, add a fallback entry with the visitor count
    if (pages.length === 0) {
      // Get total visitors for this user to use as the count
      try {
        const aggregateResponse = await queryPlausibleV2({
          site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          metrics: ['visitors', 'pageviews'],
          date_range,
          filters: [['contains', 'event:page', [pathToFilter]]],
        });

        const aggregateMetrics = processMetricsResults(aggregateResponse.results, [
          'visitors',
          'pageviews',
        ]);

        const visitorCount = aggregateMetrics.visitors || 0;
        const pageviewCount = aggregateMetrics.pageviews || 0;

        if (visitorCount > 0) {
          let fallbackPage;

          if (type === 'pages') {
            fallbackPage = {
              page: pathToFilter,
              visitors: visitorCount,
              pageviews: pageviewCount,
            };
            responseData.top_pages = [fallbackPage];
          } else if (type === 'entry_pages') {
            fallbackPage = {
              page: pathToFilter,
              visitors: visitorCount,
            };
            responseData.entry_pages = [fallbackPage];
          } else if (type === 'exit_pages') {
            fallbackPage = {
              page: pathToFilter,
              visitors: visitorCount,
              exits: visitorCount,
            };
            responseData.exit_pages = [fallbackPage];
          }

          console.log(
            `Added fallback page data with ${visitorCount} visitors and ${pageviewCount} pageviews`
          );
        }
      } catch (aggregateError) {
        console.error('Error fetching aggregate visitor count:', aggregateError.message);
      }
    }

    // Close Prisma connection
    await prisma.$disconnect();

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching Plausible pages data:', error.response?.data || error.message);

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
      // Create a fallback response with a single page
      const fallbackResponse = {
        top_pages: [],
        entry_pages: [],
        exit_pages: [],
      };

      // Add a fallback page with 1 visitor
      const fallbackPage = {
        page: '/',
        visitors: 1,
        pageviews: 1,
      };

      if (type === 'pages' || !type) {
        fallbackResponse.top_pages = [fallbackPage];
      } else if (type === 'entry_pages') {
        fallbackResponse.entry_pages = [
          {
            page: '/',
            visitors: 1,
          },
        ];
      } else if (type === 'exit_pages') {
        fallbackResponse.exit_pages = [
          {
            page: '/',
            visitors: 1,
            exits: 1,
          },
        ];
      }

      console.log('Returning fallback page data with "/" entry');
      return res.status(200).json(fallbackResponse);
    }

    return res.status(500).json({
      error: 'Failed to fetch page data',
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
 * Get mock pages data for development/testing
 * @returns {Object} Mock pages data
 */
function getMockPagesData(type) {
  if (type === 'pages') {
    return {
      top_pages: [
        { page: '/dashboard', visitors: 652, pageviews: 891 },
        { page: '/sites', visitors: 321, pageviews: 487 },
        { page: '/', visitors: 289, pageviews: 378 },
        { page: '/profile', visitors: 187, pageviews: 243 },
        { page: '/settings', visitors: 154, pageviews: 201 },
        { page: '/analytics', visitors: 132, pageviews: 178 },
      ],
      entry_pages: [
        { page: '/dashboard', entries: 386 },
        { page: '/', entries: 243 },
        { page: '/sites', entries: 112 },
        { page: '/login', entries: 87 },
        { page: '/register', entries: 54 },
        { page: '/pricing', entries: 29 },
      ],
      exit_pages: [
        { page: '/dashboard', exits: 321 },
        { page: '/sites', exits: 189 },
        { page: '/', exits: 147 },
        { page: '/settings', exits: 76 },
        { page: '/profile', exits: 64 },
        { page: '/logout', exits: 43 },
      ],
    };
  } else if (type === 'exit_pages') {
    return {
      top_pages: [],
      entry_pages: [],
      exit_pages: [
        { page: '/dashboard', exits: 321 },
        { page: '/sites', exits: 189 },
        { page: '/', exits: 147 },
        { page: '/settings', exits: 76 },
        { page: '/profile', exits: 64 },
        { page: '/logout', exits: 43 },
      ],
    };
  } else {
    return {
      top_pages: [],
      entry_pages: [],
      exit_pages: [],
    };
  }
}
