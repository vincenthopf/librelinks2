import axios from 'axios';

export default async function handler(req, res) {
  console.log('Pageviews API called with query:', req.query);

  const { handle, timeRange = 'last_7_days' } = req.query;

  if (!handle) {
    return res.status(400).json({ error: 'Handle parameter is required' });
  }

  console.log(`Fetching pageviews for handle: ${handle}, time range: ${timeRange}`);

  try {
    // Get the token from environment variables - use dashboard token for reading analytics
    const token =
      process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN || process.env.ANALYTICS_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'Analytics dashboard token not configured' });
    }

    console.log('Using analytics dashboard token (preview):', token.substring(0, 10) + '...');

    // Construct the path parameter for the API
    const path = `/${handle}`;

    try {
      // Use the correct pipe name - analytics_pages instead of analytics_pageviews
      const response = await axios.get(
        'https://api.us-east.tinybird.co/v0/pipes/analytics_pages.json',
        {
          params: {
            token,
            path,
            time_range: timeRange,
          },
        }
      );

      console.log(
        'Tinybird response status:',
        response.status,
        'Data preview:',
        JSON.stringify(response.data).substring(0, 100) + '...'
      );

      // Process the data to get total visits and data points
      const data = response.data.data || [];
      const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);

      console.log(`Returning ${data.length} data points with ${totalVisits} total visits`);

      return res.status(200).json({
        data,
        totalVisits,
      });
    } catch (pipeError) {
      // If the pipe doesn't exist or access is forbidden, return empty data instead of an error
      if (pipeError.response) {
        if (pipeError.response.status === 404) {
          console.warn(
            'The analytics_pages pipe does not exist in Tinybird. Returning empty data.'
          );
          console.warn('To fix this, create the necessary pipes in your Tinybird account.');

          return res.status(200).json({
            data: [],
            totalVisits: 0,
            warning:
              'The analytics_pages pipe does not exist in your Tinybird account. Please create it first.',
          });
        } else if (pipeError.response.status === 403) {
          console.warn(
            'The token provided does not have access to the analytics_pages pipe. Returning empty data.'
          );
          console.warn('To fix this, check your token permissions in Tinybird.');

          return res.status(200).json({
            data: [],
            totalVisits: 0,
            warning:
              'Token does not have access to the analytics_pages pipe. Please check your token permissions in Tinybird.',
          });
        }
      }

      // For other errors, rethrow
      throw pipeError;
    }
  } catch (error) {
    console.error('Error fetching pageview analytics:', error);

    // Log detailed error information
    if (error.response) {
      console.error('Error details:', error.response.data);
    }

    return res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message,
      warning: 'There was an error fetching pageview data. Check server logs for details.',
    });
  }
}
