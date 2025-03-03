import axios from 'axios';

export default async function handler(req, res) {
  console.log('Tinybird proxy request received:', {
    method: req.method,
    endpoint: req.query.endpoint,
    body: req.body,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use a default endpoint if none provided
  const { endpoint = 'events' } = req.query;

  // For link clicks, we need to use the ANALYTICS_TOKEN which has write access to the events data
  const eventName = req.body.name || req.body.event_name;
  const isLinkClick = eventName === 'click';

  // Use the appropriate token based on the event type
  const token = process.env.ANALYTICS_TOKEN;

  if (!token) {
    console.error('Tinybird token is not set in environment variables');
    return res.status(500).json({ error: 'Analytics token not configured' });
  }

  try {
    // Log the token preview (first few characters) for debugging
    console.log(`Using Tinybird analytics token (preview):`, token.substring(0, 10) + '...');

    // Extract the data from the request body
    let dataToSend;

    // Handle different request formats
    if (req.body.data && typeof req.body.data === 'object') {
      // Format 1: { name: "event_name", data: { ... } }
      dataToSend = { ...req.body.data };

      // Ensure event_name is included in the data
      if (!dataToSend.event_name) {
        dataToSend.event_name = req.body.name;
      }
    } else {
      // Format 2: { event_name: "event_name", ... }
      dataToSend = { ...req.body };

      // If using Format 2, ensure event_name is set
      if (!dataToSend.event_name && req.body.name) {
        dataToSend.event_name = req.body.name;
      }
    }

    // Ensure timestamp is in ISO format
    if (!dataToSend.timestamp) {
      dataToSend.timestamp = new Date().toISOString();
    }

    // For link clicks, format the data specifically for the events table
    if (isLinkClick) {
      // Format data for link click tracking
      dataToSend = {
        timestamp: dataToSend.timestamp || new Date().toISOString(),
        handle: dataToSend.handle || null,
        url: dataToSend.link_url || dataToSend.url || '',
        title: dataToSend.link_title || dataToSend.title || '',
        link_id: dataToSend.link_id || null,
        event_name: 'click',
      };
    }

    console.log('Proxying request to Tinybird');
    console.log('Sanitized event data:', JSON.stringify(dataToSend));

    // Determine the appropriate endpoint based on the event type
    const apiBaseUrl = process.env.TINYBIRD_API_URL || 'https://api.us-east.tinybird.co';
    const tinybirdUrl = `${apiBaseUrl}/v0/events?name=${encodeURIComponent(dataToSend.event_name)}&token=${token}`;

    console.log('Using Tinybird URL:', tinybirdUrl);

    // Forward the request to Tinybird
    try {
      const response = await axios.post(tinybirdUrl, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Tinybird proxy response:', {
        status: response.status,
        data: response.data,
      });

      return res.status(response.status).json({
        success: true,
        message: 'Event tracked successfully',
        data: response.data,
      });
    } catch (proxyError) {
      // If the first attempt fails, try an alternative format
      console.warn('First attempt failed, trying alternative format:', proxyError.message);

      try {
        // Try an alternative endpoint
        const alternativeUrl = `${apiBaseUrl}/v0/datasources/events?token=${token}`;

        console.log('Trying alternative URL:', alternativeUrl);

        const alternativeResponse = await axios.post(alternativeUrl, dataToSend, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Alternative request succeeded:', {
          status: alternativeResponse.status,
          data: alternativeResponse.data,
        });

        return res.status(alternativeResponse.status).json({
          success: true,
          message: 'Event tracked successfully (alternative format)',
          data: alternativeResponse.data,
        });
      } catch (alternativeError) {
        console.error('Both request formats failed:', alternativeError.message);

        // Check for specific error codes from Tinybird
        if (proxyError.response) {
          if (proxyError.response.status === 404) {
            console.warn(
              `The endpoint "${endpoint}" does not exist in Tinybird. The event was not tracked.`
            );
            // Return a 200 response so the app doesn't crash, but include a warning
            return res.status(200).json({
              success: false,
              warning: `The endpoint "${endpoint}" does not exist in your Tinybird account`,
              message: 'Event was not tracked, but the application will continue to function',
            });
          } else if (proxyError.response.status === 403) {
            console.warn(
              `Permission denied for endpoint "${endpoint}". The token may not have the required permissions.`
            );
            // Return a 200 response with a warning about permissions
            return res.status(200).json({
              success: false,
              warning: `Permission denied for endpoint "${endpoint}". Check token permissions in Tinybird.`,
              message:
                'Event was not tracked due to permission issues, but the application will continue to function',
            });
          }

          // For other response errors, throw to be caught by the outer catch
          throw proxyError;
        }

        // For request errors or other types, throw to be caught by the outer catch
        throw proxyError;
      }
    }
  } catch (error) {
    console.error('Error in Tinybird proxy:', error.message);

    // Log detailed error information
    if (error.response) {
      console.error('Tinybird error response:', {
        status: error.response.status,
        data: error.response.data,
      });
      return res.status(error.response.status).json({
        error: 'Error from Tinybird API',
        details: error.response.data,
      });
    } else if (error.request) {
      console.error('No response received from Tinybird');
      return res.status(500).json({
        error: 'No response from Tinybird API',
        message: error.message,
      });
    } else {
      return res.status(500).json({
        error: 'Error setting up request to Tinybird',
        message: error.message,
      });
    }
  }
}
