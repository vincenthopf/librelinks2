import { getSession } from 'next-auth/react';
import prisma from '@/lib/prismadb';
import { queryPlausibleV2, formatTimeRangeV2, processDimensionResults } from '@/lib/plausibleV2Api';

// Removed the custom categorizeSource helper function

/**
 * API endpoint for fetching Plausible sources data (channels AND sources) for a specific user
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { timeRange = 'day', timezone = 'UTC' } = req.query;
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true },
    });

    if (!user || !user.handle) {
      return res.status(404).json({ error: 'User not found or no handle set' });
    }

    const pathToFilter = `/${user.handle}`;
    const date_range = formatTimeRangeV2(timeRange, timezone);
    const site_id = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const commonParams = {
      site_id,
      date_range,
      filters: [['contains', 'event:page', [pathToFilter]]],
    };

    // Make two API calls concurrently
    const [channelResponse, sourceResponse] = await Promise.all([
      queryPlausibleV2({
        ...commonParams,
        metrics: ['visitors'],
        dimensions: ['visit:channel'], // Get Plausible's official channels
      }),
      queryPlausibleV2({
        ...commonParams,
        metrics: ['visitors'],
        dimensions: ['visit:source'], // Get raw sources
      }),
    ]);

    // Process Channels results
    const channels = processDimensionResults(
      channelResponse.results,
      ['visitors'],
      ['visit:channel']
    )
      .map(item => ({
        name: item['visit:channel'] || 'Unknown', // Use Unknown if channel is null/undefined
        visitors: parseInt(item.visitors) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors); // Sort channels by visitors desc

    // Process Sources results
    const sources = processDimensionResults(sourceResponse.results, ['visitors'], ['visit:source'])
      .map(item => ({
        name: item['visit:source'] || 'Direct', // Plausible uses null for Direct source
        visitors: parseInt(item.visitors) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors); // Sort sources by visitors desc

    return res.status(200).json({
      sources, // Raw source data from visit:source
      channels, // Official channel data from visit:channel
    });
  } catch (error) {
    console.error(
      'Error fetching Plausible sources/channels data:',
      error.response?.data || error.message
    );
    // Log specific Plausible error if available
    if (error.response?.data?.error) {
      console.error('Plausible API error:', error.response.data.error);
    }
    return res.status(500).json({
      sources: [],
      channels: [],
      error: 'Failed to fetch sources/channels data from Plausible.',
      details: error.response?.data?.error || error.message,
    });
  }
}
