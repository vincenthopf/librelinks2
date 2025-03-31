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
  // console.log('Outbound Links API called with query:', req.query); // Commented out

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

    // console.log(`Fetching outbound links data for user ID: ${userId}, time range: ${timeRange}`);

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
    // console.log(`Filtering Plausible data by path: ${pathToFilter}`);

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

    // Create a map of user links for quick lookup - normalize URLs for better matching
    const userLinkMap = {};
    const normalizedUrlMap = {};

    userLinks.forEach(link => {
      userLinkMap[link.url] = link;

      // Also store normalized versions of URLs for better matching
      const normalizedUrl = normalizeUrl(link.url);
      normalizedUrlMap[normalizedUrl] = link;
    });

    // Make the API request to Plausible v2 API - include both visitors and events metrics
    const response = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: ['visitors', 'events'],
      date_range,
      dimensions: ['event:props:url'],
      filters: [
        ['contains', 'event:page', [pathToFilter]],
        ['is', 'event:goal', ['Outbound Link: Click']],
      ],
    });

    // Added Logging:
    // console.log('Plausible API Response:', JSON.stringify(response, null, 2)); // Commented out
    // console.log('User Links from DB:', JSON.stringify(userLinks, null, 2)); // Commented out

    // console.log(`Found ${response.results.length} outbound link clicks for page: ${pathToFilter}`); // Commented out

    // Process the outbound links data
    const outboundLinks = [];

    // If we have user links and outbound link data, match them
    if (userLinks.length > 0 && response.results.length > 0) {
      // Process the dimension results
      const processedResults = processDimensionResults(
        response.results,
        ['visitors', 'events'],
        ['event:props:url']
      );

      // console.log('Processed results:', processedResults); // Commented out

      // Process each outbound link
      for (const item of processedResults) {
        const url = item['event:props:url'];
        const normalizedUrl = normalizeUrl(url);

        // Added Logging:
        // console.log(`Processing Plausible URL: ${url}, Normalized: ${normalizedUrl}`); // Commented out

        // Check if this URL belongs to the user - using both exact and normalized matching
        let userLink = null;

        if (url in userLinkMap) {
          userLink = userLinkMap[url];
        } else if (normalizedUrl in normalizedUrlMap) {
          userLink = normalizedUrlMap[normalizedUrl];
        } else {
          // Try to find a partial match
          for (const [storedUrl, link] of Object.entries(userLinkMap)) {
            if (url.includes(storedUrl) || storedUrl.includes(url)) {
              userLink = link;
              break;
            }
          }
        }

        // Added Logging:
        // console.log(`Match found? ${userLink ? `Yes (DB URL: ${userLink.url})` : 'No'}`); // Commented out

        if (userLink) {
          outboundLinks.push({
            id: userLink.id,
            title: userLink.title,
            url: userLink.url,
            visitors: parseInt(item.visitors) || 0,
            events: parseInt(item.events) || 0,
          });
        }
      }
    }

    // Sort outbound links by visitors (descending)
    outboundLinks.sort((a, b) => b.visitors - a.visitors);

    // If no matches found between Plausible and user links, return empty array instead of DB fallback
    if (outboundLinks.length === 0 && userLinks.length > 0) {
      console.log(
        'No matches found between Plausible data and user links. Returning empty array instead of database fallback.'
      );
      return res.status(200).json({
        outboundLinks: [],
        source: 'no_plausible_match', // Indicate why data is empty
      });
    }

    // If we still have no data after potential Plausible matching (e.g., Plausible returned empty results initially),
    // check if we should try fetching aggregate data or just return empty.
    // For now, just ensuring the final return happens correctly.

    // console.log(
    //   'Returning outbound links:',
    //   JSON.stringify(outboundLinks, null, 2)
    // ); // Commented out

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

    // If all else fails, return an empty array instead of hardcoded data
    return res.status(500).json({
      outboundLinks: [],
      error: 'Failed to fetch outbound links data from Plausible.',
      details: error.response?.data?.error || error.message,
    });
  }
}

/**
 * Normalize a URL for better matching
 * @param {string} url - The URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  try {
    // Remove protocol, trailing slashes, www. prefix
    let normalized = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    normalized = normalized.replace(/^www\./, '');

    // Return the normalized URL
    return normalized.toLowerCase();
  } catch (e) {
    return url;
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
