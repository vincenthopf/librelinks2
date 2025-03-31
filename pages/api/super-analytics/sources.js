import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { queryPlausibleV2, formatTimeRangeV2, processDimensionResults } from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible traffic sources for a specific user
 *
 * This fetches traffic sources from various channels and campaigns
 * filtered by the URL path of the user's page.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  console.log('Sources API called with query:', req.query);

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
    const { timeRange = 'day' } = req.query;
    const userId = session.user.id;

    // console.log(`Fetching sources data for user ID: ${userId}, time range: ${timeRange}`);

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

    // Get traffic source dimensions
    const sourceDimensions = [
      'visit:source',
      'visit:utm_medium',
      'visit:utm_source',
      'visit:utm_campaign',
    ];

    // Array to store all source results
    const allSources = [];

    // Make separate requests for each dimension type to get complete data
    for (const dimension of sourceDimensions) {
      const response = await queryPlausibleV2({
        site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
        metrics: ['visitors'],
        date_range,
        dimensions: [dimension],
        filters: [['contains', 'event:page', [pathToFilter]]],
      });

      // Process the dimension results
      const processedResults = processDimensionResults(response.results, ['visitors'], [dimension]);

      // Add to our combined results
      allSources.push(
        ...processedResults.map(item => ({
          source: item[dimension] || 'Direct / Unknown',
          visitors: item.visitors,
          dimension, // Track which dimension this came from
        }))
      );
    }

    console.log(`Received data for ${allSources.length} different traffic sources`);

    // De-duplicate and prioritize results by dimension type and visitor count
    const sourceMap = {};

    // Process sources in a specific order to prioritize UTM parameters
    allSources.forEach(item => {
      const sourceName = item.source;

      if (
        !sourceMap[sourceName] ||
        (item.dimension === 'visit:utm_campaign' &&
          sourceMap[sourceName].dimension !== 'visit:utm_campaign') ||
        (item.dimension === 'visit:utm_source' &&
          sourceMap[sourceName].dimension !== 'visit:utm_campaign' &&
          sourceMap[sourceName].dimension !== 'visit:utm_source') ||
        (item.dimension === 'visit:utm_medium' &&
          sourceMap[sourceName].dimension === 'visit:source') ||
        item.visitors > sourceMap[sourceName].visitors
      ) {
        sourceMap[sourceName] = {
          source: sourceName,
          visitors: item.visitors,
          dimension: item.dimension,
        };
      }
    });

    // Convert the map back to an array and sort by visitor count
    const sources = Object.values(sourceMap)
      .sort((a, b) => b.visitors - a.visitors)
      .map(({ source, visitors }) => ({ source, visitors }));

    // If no sources were found, add a fallback "Direct / Unknown" entry
    if (sources.length === 0) {
      // Get total visitors for this user's page to use as the count
      try {
        const aggregateResponse = await queryPlausibleV2({
          metrics: ['visitors'],
          date_range,
          filters: [['is', 'event:page', [pathToFilter]]],
        });

        const visitorCount =
          aggregateResponse.results && aggregateResponse.results.length > 0
            ? aggregateResponse.results[0].visitors || 0
            : 0;

        if (visitorCount > 0) {
          sources.push({
            source: 'Direct / Unknown',
            visitors: visitorCount,
          });

          console.log(`Added fallback "Direct / Unknown" with ${visitorCount} visitors`);
        }
      } catch (aggregateError) {
        console.error('Error fetching aggregate visitor count:', aggregateError.message);
      }
    }

    // Close Prisma connection
    await prisma.$disconnect();

    // Return the sources data
    return res.status(200).json({ sources });
  } catch (error) {
    console.error('Error fetching Plausible sources data:', error.response?.data || error.message);

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
      // Create a fallback response with a "Direct / Unknown" source
      const fallbackResponse = {
        sources: [
          {
            source: 'Direct / Unknown',
            visitors: 1,
          },
        ],
      };

      console.log('Returning fallback source data with "Direct / Unknown" entry');
      return res.status(200).json(fallbackResponse);
    }

    return res.status(500).json({
      error: 'Failed to fetch sources data',
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
 * Get mock sources data for development/testing
 * @returns {Object} Mock sources data
 */
function getMockSourcesData() {
  return {
    sources: [
      { name: 'Direct / None', visitors: 851 },
      { name: 'Google', visitors: 212 },
      { name: 'Twitter', visitors: 119 },
      { name: 'Facebook', visitors: 87 },
      { name: 'LinkedIn', visitors: 65 },
      { name: 'GitHub', visitors: 43 },
    ],
    utm_medium: [
      { name: 'referral', visitors: 231 },
      { name: 'organic', visitors: 187 },
      { name: 'social', visitors: 156 },
      { name: 'email', visitors: 98 },
      { name: 'paid', visitors: 74 },
    ],
    utm_source: [
      { name: 'google', visitors: 213 },
      { name: 'twitter', visitors: 119 },
      { name: 'facebook', visitors: 87 },
      { name: 'linkedin', visitors: 65 },
      { name: 'newsletter', visitors: 54 },
    ],
    utm_campaign: [
      { name: 'spring_launch', visitors: 119 },
      { name: 'product_update', visitors: 87 },
      { name: 'blog_promotion', visitors: 65 },
      { name: 'winter_sale', visitors: 43 },
      { name: 'webinar', visitors: 32 },
    ],
  };
}
