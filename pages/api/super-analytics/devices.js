import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { queryPlausibleV2, formatTimeRangeV2, processDimensionResults } from '@/lib/plausibleV2Api';

/**
 * API endpoint for fetching Plausible device data for a specific user.
 * Fetches browser, OS, and screen size data in one go.
 */
export default async function handler(req, res) {
  console.log('Devices API called with query:', req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let prisma; // Define prisma client variable

  try {
    const { timeRange = 'day', timezone = 'UTC' } = req.query;
    const userId = session.user.id;

    console.log(
      `Fetching ALL device data for user ID: ${userId}, time range: ${timeRange}, timezone: ${timezone}`
    );

    prisma = new PrismaClient(); // Initialize Prisma client

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true },
    });

    if (!user || !user.handle) {
      return res.status(404).json({ error: 'User not found or no handle set' });
    }

    const pathToFilter = `/${user.handle}`;
    const date_range = formatTimeRangeV2(timeRange, timezone);

    // Helper function to fetch and process data for a specific dimension
    const fetchDeviceData = async dimension => {
      try {
        const response = await queryPlausibleV2({
          site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          metrics: ['visitors'],
          date_range,
          dimensions: [dimension],
          filters: [['contains', 'event:page', [pathToFilter]]],
        });

        // Process results, ensuring visitors is a number
        return processDimensionResults(response.results, ['visitors'], [dimension]).map(item => ({
          name: item[dimension] || 'Unknown',
          visitors: Number(item.visitors) || 0,
        }));
      } catch (fetchError) {
        console.error(
          `Error fetching Plausible dimension ${dimension}:`,
          fetchError.response?.data || fetchError.message
        );
        return []; // Return empty array on fetch failure for this dimension
      }
    };

    // Fetch all device dimensions in parallel
    const [browsersData, osData, sizesData] = await Promise.all([
      fetchDeviceData('visit:browser'),
      fetchDeviceData('visit:os'),
      fetchDeviceData('visit:device'), // 'visit:device' for screen size (Desktop, Mobile, Tablet)
    ]);

    console.log(
      `Fetched ${browsersData.length} browsers, ${osData.length} OS, ${sizesData.length} sizes.`
    );

    const responseData = {
      browsers: browsersData.sort((a, b) => b.visitors - a.visitors),
      operating_systems: osData.sort((a, b) => b.visitors - a.visitors),
      screen_sizes: sizesData.sort((a, b) => b.visitors - a.visitors),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching Plausible device data:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Error details:', error.message);
    }

    // Return empty arrays on any main error
    return res.status(500).json({
      error: 'Failed to fetch device data',
      details: typeof error.message === 'string' ? error.message : 'Internal server error',
      browsers: [],
      operating_systems: [],
      screen_sizes: [],
    });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
