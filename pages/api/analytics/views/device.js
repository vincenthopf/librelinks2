import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { handle } = req.query;
    const endpoint =
      'https://api.us-east.tinybird.co/v0/pipes/Device_Tracking_pipe_1352.json';

    if (!handle || typeof handle !== 'string') {
      return res.status(404).end();
    }

    const analytics = await axios.get(
      `${endpoint}?token=${process.env.DEVICE_ANALYTICS_TOKEN}&handle=/${handle}`
    );

    return res.status(200).json(analytics.data.data);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
}
