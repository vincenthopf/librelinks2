import axios from 'axios';
import { db } from '@/lib/db';
import { getUserIdFromHandle } from '@/utils/user-utils';

export default async function handler(req, res) {
  try {
    // Log the API call
    console.log('Links API called with query:', req.query);

    // Get the handle and time range from the query parameters
    const { handle, timeRange = '7d' } = req.query;

    if (!handle) {
      return res.status(400).json({ error: 'Handle parameter is required' });
    }

    console.log(`Fetching links data for handle: ${handle}, timeRange: ${timeRange}`);

    try {
      // Step 1: Get the user ID from handle
      const userId = await getUserIdFromHandle(handle);
      if (!userId) {
        return res.status(404).json({ error: 'User not found for this handle' });
      }

      console.log(`Found userId: ${userId} for handle: ${handle}`);

      // Step 2: Get all user links from database
      const userLinks = await db.link.findMany({
        where: {
          userId,
          archived: false,
        },
        select: {
          id: true,
          title: true,
          url: true,
          clicks: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      });

      console.log(`Found ${userLinks.length} links for user`);

      // Step 3: Get analytics data from Tinybird for click events
      // Get the token from environment variables - use the ANALYTICS_TOKEN for link clicks
      const analyticsToken = process.env.ANALYTICS_TOKEN;

      if (!analyticsToken) {
        console.warn('Analytics token not configured. Returning links with zero clicks.');
        return res.status(200).json({
          data: userLinks.map(link => ({
            ...link,
            clicks: 0,
          })),
          totalClicks: 0,
        });
      }

      console.log('Using analytics token (preview):', analyticsToken.substring(0, 10) + '...');

      try {
        // Construct the Tinybird API URL
        const apiBaseUrl = process.env.TINYBIRD_API_URL || 'https://api.us-east.tinybird.co';

        // Make a direct SQL query to get click data from the events table
        const response = await axios.post(
          `${apiBaseUrl}/v0/sql`,
          `SELECT url, COUNT(*) as clicks 
           FROM events 
           WHERE event_name = 'click' 
           AND handle = '${handle}' 
           GROUP BY url`,
          {
            headers: {
              'Content-Type': 'text/plain',
              Authorization: `Bearer ${analyticsToken}`,
            },
          }
        );

        // Log the response status and a preview of the data
        console.log(`Tinybird SQL query response status: ${response.status}`);
        console.log(
          'Response data preview:',
          JSON.stringify(response.data).substring(0, 100) + '...'
        );

        // Extract click data
        const clickData = response.data.data || [];

        // Step 4: Merge user links with click data
        const mergedLinks = userLinks.map(link => {
          // Find matching click data for this link (if any)
          const linkClicks = clickData.find(item => item.url === link.url);

          return {
            ...link,
            clicks: linkClicks ? linkClicks.clicks || 0 : link.clicks || 0,
          };
        });

        // Calculate total clicks across all links
        const totalClicks = mergedLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);

        // Log the result
        console.log(`Returning ${mergedLinks.length} links with ${totalClicks} total clicks`);

        // Return the merged data
        return res.status(200).json({
          data: mergedLinks,
          totalClicks,
        });
      } catch (pipeError) {
        console.warn('Error fetching click data from Tinybird SQL:', pipeError.message);

        // Try an alternative approach - query the events endpoint directly
        try {
          const apiBaseUrl = process.env.TINYBIRD_API_URL || 'https://api.us-east.tinybird.co';

          // Try to get events directly
          const alternativeResponse = await axios.get(`${apiBaseUrl}/v0/events`, {
            params: {
              name: 'click',
              token: analyticsToken,
              filter: `handle='${handle}'`,
            },
          });

          // Extract click data from alternative endpoint
          const events = alternativeResponse.data.data || [];

          // Group events by URL and count them
          const clicksByUrl = {};
          events.forEach(event => {
            const url = event.url || '';
            if (!clicksByUrl[url]) {
              clicksByUrl[url] = 0;
            }
            clicksByUrl[url]++;
          });

          // Convert to array format
          const alternativeClickData = Object.entries(clicksByUrl).map(([url, count]) => ({
            url,
            clicks: count,
          }));

          // Merge user links with alternative click data
          const alternativeMergedLinks = userLinks.map(link => {
            // Find matching click data for this link (if any)
            const linkClicks = alternativeClickData.find(item => item.url === link.url);

            return {
              ...link,
              clicks: linkClicks ? linkClicks.clicks : link.clicks || 0,
            };
          });

          // Calculate total clicks
          const totalClicks = alternativeMergedLinks.reduce(
            (sum, link) => sum + (link.clicks || 0),
            0
          );

          console.log(
            `Returning ${alternativeMergedLinks.length} links with ${totalClicks} total clicks (alternative endpoint)`
          );

          return res.status(200).json({
            data: alternativeMergedLinks,
            totalClicks,
          });
        } catch (alternativeError) {
          console.warn('Alternative endpoint also failed:', alternativeError.message);

          // Fall back to database clicks as a last resort
          console.log('Falling back to database click counts');

          // Calculate total clicks from database
          const totalDbClicks = userLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);

          return res.status(200).json({
            data: userLinks,
            totalClicks: totalDbClicks,
            warning: 'Using database click counts. Tinybird analytics unavailable.',
          });
        }
      }
    } catch (error) {
      console.error('Error processing links data:', error);
      return res.status(500).json({
        error: 'Failed to process links data',
        message: error.message,
      });
    }
  } catch (error) {
    // Log the error
    console.error('Error in links API:', error);

    // Return an error response
    return res.status(500).json({
      error: 'Failed to fetch links data',
      message: error.message,
      details: error.response?.data,
    });
  }
}
