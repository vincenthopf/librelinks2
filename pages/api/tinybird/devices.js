import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { handle } = req.query;

    if (!handle || typeof handle !== 'string') {
      return res.status(400).json({ error: 'Handle is required' });
    }

    // Construct the Tinybird API URL using the existing top_devices pipe
    const tinybirdUrl = 'https://api.us-east.tinybird.co/v0/pipes/top_devices.json';

    // Make the request to Tinybird
    const response = await axios.get(tinybirdUrl, {
      params: {
        token: process.env.DEVICE_ANALYTICS_TOKEN,
        path: `/${handle}`, // Filter by path which contains the handle
      },
    });

    // Format the response data
    const formattedData = response.data.data.map(item => ({
      device: item.device || item.device_type || 'unknown',
      visits: item.visits || item.count,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching device analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch device analytics data' });
  }
}
