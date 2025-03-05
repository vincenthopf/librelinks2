import { getSession } from 'next-auth/react';
import prisma from '@/lib/prismadb';
import { queryPlausibleV2, formatTimeRangeV2, processDimensionResults } from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible outbound links data for a specific user
 *
 * This fetches the outbound links data (clicked external links)
 * filtered by the URL path of the user's page and matches them with the user's link cards.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  console.log('Outbound Links API called with query:', req.query);

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

    console.log(`Fetching outbound links data for user ID: ${userId}, time range: ${timeRange}`);

    // Get the user's unique path/slug from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true },
    });

    if (!user || !user.handle) {
      return res.status(404).json({ error: 'User not found or no handle set' });
    }

    // Construct the path to filter by (e.g., "/q6nr393H91")
    const pathToFilter = `/${user.handle}`;
    console.log(`Filtering Plausible data by path: ${pathToFilter}`);

    // Format date range for v2 API
    const date_range = formatTimeRangeV2(timeRange);

    // First, fetch the user's links from the database
    const userLinks = await prisma.link.findMany({
      where: {
        userId: userId,
        archived: false,
      },
      select: {
        id: true,
        title: true,
        url: true,
        clicks: true,
      },
    });

    console.log(`Found ${userLinks.length} links for user ID: ${userId}`);

    // Create a map of user links for quick lookup
    const userLinkMap = {};
    userLinks.forEach(link => {
      userLinkMap[link.url] = link;
    });

    // Make the API request to Plausible v2 API
    const response = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: ['visitors'],
      date_range,
      dimensions: ['event:props:url'],
      filters: [
        ['contains', 'event:page', [pathToFilter]],
        ['is', 'event:name', ['outbound link click']],
      ],
    });

    console.log(`Found ${response.results.length} outbound link clicks for page: ${pathToFilter}`);

    // Process the outbound links data
    const outboundLinks = [];

    // If we have user links and outbound link data, match them
    if (userLinks.length > 0 && response.results.length > 0) {
      // Process the dimension results
      const processedResults = processDimensionResults(
        response.results,
        ['visitors'],
        ['event:props:url']
      );

      // Process each outbound link
      for (const item of processedResults) {
        const url = item['event:props:url'];

        // Check if this URL belongs to the user
        if (url in userLinkMap) {
          const userLink = userLinkMap[url];

          outboundLinks.push({
            id: userLink.id,
            title: userLink.title,
            url: userLink.url,
            visitors: item.visitors,
            events: item.events,
            cr: item.visitors > 0 ? Math.round((item.events / item.visitors) * 100) : 0,
          });
        }
      }
    }

    // If no matches found, return top links with real database click counts
    if (outboundLinks.length === 0 && userLinks.length > 0) {
      console.log(
        'No matches found with Plausible data, returning user links with database click counts'
      );

      // Return top 5 links by database click count
      const topLinks = userLinks
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)
        .map(link => ({
          id: link.id,
          title: link.title,
          url: link.url,
          visitors: Math.max(1, Math.ceil(link.clicks * 0.8)), // Estimate unique visitors as 80% of clicks
          events: link.clicks,
          cr: 100, // 100% conversion rate for simplicity
        }));

      return res.status(200).json({
        outboundLinks: topLinks,
      });
    }

    // If no data was found, add a fallback entry with the visitor count
    if (outboundLinks.length === 0) {
      // Get total visitors for this path to use as the count
      try {
        const aggregateResponse = await queryPlausibleV2({
          site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          metrics: ['visitors'],
          date_range,
          filters: [
            ['contains', 'event:page', [pathToFilter]],
            ['is', 'event:name', ['outbound link click']],
          ],
        });

        outboundLinks.push({
          id: null,
          title: 'Total visitors',
          url: pathToFilter,
          visitors: aggregateResponse.results[0].visitors,
          events: aggregateResponse.results[0].events,
          cr: 100, // Assuming a default 100% conversion rate
        });
      } catch (error) {
        console.error('Error fetching aggregate data:', error.response?.data || error.message);
        return res.status(500).json({
          error: 'Failed to fetch aggregate data',
          details: error.response?.data || error.message,
          info: 'To troubleshoot, check your Plausible API key and domain settings',
        });
      }
    }

    return res.status(200).json({
      outboundLinks,
    });
  } catch (error) {
    console.error(
      'Error fetching Plausible outbound links data:',
      error.response?.data || error.message
    );

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
      // Try to return user links with database click counts
      try {
        const userId = session.user.id;
        const userLinks = await prisma.link.findMany({
          where: {
            userId: userId,
            archived: false,
          },
          select: {
            id: true,
            title: true,
            url: true,
            clicks: true,
          },
          orderBy: {
            clicks: 'desc',
          },
          take: 5,
        });

        const outboundLinks = userLinks.map(link => ({
          id: link.id,
          title: link.title,
          url: link.url,
          visitors: Math.max(1, Math.ceil(link.clicks * 0.8)), // Estimate unique visitors as 80% of clicks
          events: link.clicks,
          cr: 100, // 100% conversion rate for simplicity
        }));

        return res.status(200).json({
          outboundLinks,
        });
      } catch (dbError) {
        console.error('Error fetching user links:', dbError);
        return res.status(200).json({
          outboundLinks: [],
        });
      }
    }

    return res.status(500).json({
      error: 'Failed to fetch outbound links data',
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
