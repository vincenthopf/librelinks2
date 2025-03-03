export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get all environment variables that start with NEXT_PUBLIC
  const publicEnvVars = Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_PUBLIC'))
    .reduce((obj, key) => {
      // For security, only show if the variable exists, not its actual value
      obj[key] = process.env[key] ? 'Set' : 'Not set';
      return obj;
    }, {});

  // Check specific Tinybird tokens
  const tinybirdTokens = {
    NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN: process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN
      ? `${process.env.NEXT_PUBLIC_TINYBIRD_WEB_ANALYTICS_TOKEN.substring(0, 10)}...`
      : 'Not set',
    ANALYTICS_TOKEN: process.env.ANALYTICS_TOKEN
      ? `${process.env.ANALYTICS_TOKEN.substring(0, 10)}...`
      : 'Not set',
    DEVICE_ANALYTICS_TOKEN: process.env.DEVICE_ANALYTICS_TOKEN
      ? `${process.env.DEVICE_ANALYTICS_TOKEN.substring(0, 10)}...`
      : 'Not set',
    LOCATION_ANALYTICS_TOKEN: process.env.LOCATION_ANALYTICS_TOKEN
      ? `${process.env.LOCATION_ANALYTICS_TOKEN.substring(0, 10)}...`
      : 'Not set',
  };

  // Return the environment information
  return res.status(200).json({
    environment: process.env.NODE_ENV,
    tinybirdTokens,
    publicEnvVars,
  });
}
