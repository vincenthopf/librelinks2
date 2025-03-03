import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Log the API call
    console.log('Devices API called with query:', req.query);

    // Get the handle and time range from the query parameters
    const { handle, timeRange = '7d' } = req.query;

    if (!handle) {
      return res.status(400).json({ error: 'Handle parameter is required' });
    }

    console.log(`Fetching devices data for handle: ${handle}, timeRange: ${timeRange}`);

    // Get the token from environment variables
    const dashboardToken =
      process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN ||
      process.env.DEVICE_ANALYTICS_TOKEN;

    if (!dashboardToken) {
      return res.status(500).json({ error: 'Dashboard token not configured' });
    }

    console.log('Using dashboard token (preview):', dashboardToken.substring(0, 10) + '...');

    try {
      // Make the request to Tinybird - use top_devices instead of analytics_devices
      const response = await axios.get(
        'https://api.us-east.tinybird.co/v0/pipes/top_devices.json',
        {
          params: {
            token: dashboardToken,
            handle,
            timeRange,
          },
        }
      );

      // Log the response status and a preview of the data
      console.log(`Tinybird response status: ${response.status}`);
      console.log(
        'Response data preview:',
        JSON.stringify(response.data).substring(0, 100) + '...'
      );

      // Calculate total visits
      const totalVisits = response.data.data.reduce((sum, item) => sum + item.visits, 0);

      // Log the number of data points and total visits
      console.log(
        `Returning ${response.data.data.length} data points with ${totalVisits} total visits`
      );

      // Return the data
      return res.status(200).json({
        data: response.data.data,
        totalVisits,
      });
    } catch (pipeError) {
      // Check if error is due to missing pipe (404) or forbidden access (403)
      if (pipeError.response) {
        if (pipeError.response.status === 404) {
          console.warn('The pipe "top_devices" does not exist in Tinybird. Returning empty data.');
          return res.status(200).json({
            data: [],
            totalVisits: 0,
            warning: 'The pipe "top_devices" does not exist in your Tinybird account',
          });
        } else if (pipeError.response.status === 403) {
          console.warn(
            'The token provided does not have access to the top_devices pipe. Returning empty data.'
          );
          console.warn('To fix this, check your token permissions in Tinybird.');

          return res.status(200).json({
            data: [],
            totalVisits: 0,
            warning: 'Token does not have access to the top_devices pipe',
          });
        }
      }
      // Re-throw other errors
      throw pipeError;
    }
  } catch (error) {
    // Log the error
    console.error('Error fetching devices data:', error);

    // Return an error response
    return res.status(500).json({
      error: 'Failed to fetch devices data',
      message: error.message,
      details: error.response?.data,
    });
  }
}
