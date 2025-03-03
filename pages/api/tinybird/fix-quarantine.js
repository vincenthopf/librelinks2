import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the tokens from environment variables
    const dashboardToken = process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN;
    const trackerToken = process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN;

    if (!dashboardToken) {
      return res.status(500).json({ error: 'Dashboard token not configured' });
    }

    if (!trackerToken) {
      return res.status(500).json({ error: 'Tracker token not configured' });
    }

    console.log('Using dashboard token (preview):', dashboardToken.substring(0, 10) + '...');
    console.log('Using tracker token (preview):', trackerToken.substring(0, 10) + '...');

    // Step 1: Get quarantined data using the dashboard token
    const quarantineResponse = await axios.get(
      'https://api.us-east.tinybird.co/v0/pipes/analytics_events_quarantine.json',
      {
        params: {
          token: dashboardToken,
          limit: 100, // Limit to 100 rows to avoid processing too much at once
        },
      }
    );

    const quarantinedRows = quarantineResponse.data.data || [];
    console.log(`Found ${quarantinedRows.length} quarantined rows`);

    if (quarantinedRows.length === 0) {
      return res.status(200).json({ message: 'No quarantined data to fix' });
    }

    // Step 2: Process and fix each row
    const results = {
      processed: 0,
      fixed: 0,
      errors: [],
    };

    for (const row of quarantinedRows) {
      try {
        results.processed++;

        // Extract the error details
        const errorDetail = row.error_detail;
        console.log(`Processing quarantined row with error: ${errorDetail}`);

        // Parse the original data if available
        let originalData;
        try {
          // The original data might be in the c__import_id field or elsewhere
          // This is a simplification - you may need to adjust based on your actual data structure
          originalData = JSON.parse(row.c__import_id || '{}');
        } catch (e) {
          console.error('Could not parse original data:', e);
          originalData = {};
        }

        // Create a fixed version of the data
        const fixedData = {
          name: originalData.name || 'unknown_event',
          data: {
            timestamp: new Date().toISOString(),
            path: typeof originalData.data?.path === 'string' ? originalData.data.path : '/',
            url: typeof originalData.data?.url === 'string' ? originalData.data.url : '',
            handle: typeof originalData.data?.handle === 'string' ? originalData.data.handle : null,
            // Add other fields as needed, ensuring proper types
            ...Object.entries(originalData.data || {}).reduce((acc, [key, value]) => {
              // Skip fields we've already handled
              if (['timestamp', 'path', 'url', 'handle'].includes(key)) return acc;

              // Handle different types appropriately
              if (typeof value === 'number') {
                acc[key] = value;
              } else if (typeof value === 'string') {
                acc[key] = value;
              } else if (typeof value === 'boolean') {
                acc[key] = value;
              } else if (value === null) {
                acc[key] = null;
              } else if (Array.isArray(value)) {
                // Convert arrays to strings to avoid type issues
                acc[key] = JSON.stringify(value);
              } else if (typeof value === 'object') {
                // Convert objects to strings to avoid type issues
                acc[key] = JSON.stringify(value);
              }

              return acc;
            }, {}),
          },
        };

        // Step 3: Send the fixed data to Tinybird using the tracker token
        await axios.post(
          'https://api.us-east.tinybird.co/v0/events?name=analytics_events',
          fixedData,
          {
            params: { token: trackerToken },
            headers: { 'Content-Type': 'application/json' },
          }
        );

        results.fixed++;
        console.log(`Successfully fixed row ${results.fixed}`);
      } catch (error) {
        console.error('Error fixing row:', error.message);
        results.errors.push({
          row: results.processed,
          error: error.message,
          response: error.response?.data,
        });
      }
    }

    // Step 4: Return the results
    return res.status(200).json({
      message: `Processed ${results.processed} rows, fixed ${results.fixed} rows`,
      results,
    });
  } catch (error) {
    console.error('Error in fix-quarantine:', error);

    return res.status(500).json({
      error: 'Failed to fix quarantined data',
      message: error.message,
      details: error.response?.data,
    });
  }
}
