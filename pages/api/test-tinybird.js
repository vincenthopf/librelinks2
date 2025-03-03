export default function handler(req, res) {
  try {
    // Return environment variables related to Tinybird
    // Only return the first few characters of tokens for security
    const envVars = {
      NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN: process.env
        .NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN
        ? `${process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN.substring(0, 10)}...`
        : null,
      NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN: process.env
        .NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN
        ? `${process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN.substring(0, 10)}...`
        : null,
      ANALYTICS_TOKEN: process.env.ANALYTICS_TOKEN
        ? `${process.env.ANALYTICS_TOKEN.substring(0, 10)}...`
        : null,
      DEVICE_ANALYTICS_TOKEN: process.env.DEVICE_ANALYTICS_TOKEN
        ? `${process.env.DEVICE_ANALYTICS_TOKEN.substring(0, 10)}...`
        : null,
      LOCATION_ANALYTICS_TOKEN: process.env.LOCATION_ANALYTICS_TOKEN
        ? `${process.env.LOCATION_ANALYTICS_TOKEN.substring(0, 10)}...`
        : null,
      TINYBIRD_API_URL: process.env.TINYBIRD_API_URL || 'https://api.us-east.tinybird.co',
    };

    // Log the environment variables being returned (without full tokens)
    console.log('Returning Tinybird environment variables:', {
      NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN:
        envVars.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TRACKER_TOKEN ? 'Set' : 'Not set',
      NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN:
        envVars.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_DASHBOARD_TOKEN ? 'Set' : 'Not set',
      ANALYTICS_TOKEN: envVars.ANALYTICS_TOKEN ? 'Set' : 'Not set',
      DEVICE_ANALYTICS_TOKEN: envVars.DEVICE_ANALYTICS_TOKEN ? 'Set' : 'Not set',
      LOCATION_ANALYTICS_TOKEN: envVars.LOCATION_ANALYTICS_TOKEN ? 'Set' : 'Not set',
      TINYBIRD_API_URL: envVars.TINYBIRD_API_URL,
    });

    return res.status(200).json(envVars);
  } catch (error) {
    console.error('Error in test-tinybird API:', error);
    return res.status(500).json({ error: 'Failed to retrieve environment variables' });
  }
}
