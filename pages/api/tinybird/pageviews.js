import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { handle, timeRange = 'last_24_hours' } = req.query;

    if (!handle || typeof handle !== 'string') {
      return res.status(400).json({ error: 'Handle is required' });
    }

    // Construct the Tinybird API URL using the existing analytics_pages pipe
    const tinybirdUrl = 'https://api.us-east.tinybird.co/v0/pipes/analytics_pages.json';

    // Make the request to Tinybird
    const response = await axios.get(tinybirdUrl, {
      params: {
        token: process.env.ANALYTICS_TOKEN,
        path: `/${handle}`, // Filter by path which contains the handle
        time_range: timeRange,
      },
    });

    // Format the response data
    const formattedData = response.data.data.map(item => ({
      timestamp: item.timestamp || item.date,
      visits: item.visits || item.count,
    }));

    // Calculate total visits
    const totalVisits = formattedData.reduce((sum, item) => sum + item.visits, 0);

    return res.status(200).json({
      data: formattedData,
      totalVisits,
    });
  } catch (error) {
    console.error('Error fetching pageview analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}
