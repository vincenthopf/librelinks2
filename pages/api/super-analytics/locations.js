import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { queryPlausibleV2, formatTimeRangeV2, processDimensionResults } from '@/lib/plausibleV2Api';
import countries from 'iso-3166-1'; // Import the lookup library

/**
 * API endpoint for fetching Plausible location data for a specific user.
 * Fetches countries, regions, and cities data in one go.
 */
export default async function handler(req, res) {
  console.log('Locations API called with query:', req.query);

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
      `Fetching ALL location data for user ID: ${userId}, time range: ${timeRange}, timezone: ${timezone}`
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
    const fetchLocationData = async dimension => {
      try {
        const response = await queryPlausibleV2({
          site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
          metrics: ['visitors'],
          date_range,
          dimensions: [dimension],
          filters: [['contains', 'event:page', [pathToFilter]]],
        });

        // Process results, ensuring visitors is a number
        return processDimensionResults(response.results, ['visitors'], [dimension]).map(item => {
          const primaryValue = item[dimension] || 'Unknown';
          let name = 'Unknown';
          let countryCode = undefined;

          if (dimension === 'visit:country') {
            countryCode = primaryValue; // The code IS the primary value
            // Look up the full name using the code
            const countryInfo = countries.whereAlpha2(countryCode);
            name = countryInfo ? countryInfo.country : primaryValue; // Use full name or code as fallback
          } else {
            // For region/city, the primary value is the name
            name = primaryValue;
          }

          return {
            name: name,
            country_code: countryCode,
            visitors: Number(item.visitors) || 0,
          };
        });
      } catch (fetchError) {
        console.error(
          `Error fetching Plausible dimension ${dimension}:`,
          fetchError.response?.data || fetchError.message
        );
        return []; // Return empty array on fetch failure for this dimension
      }
    };

    // Fetch all location dimensions in parallel - USE visit:country now
    const [countriesData, regionsData, citiesData] = await Promise.all([
      fetchLocationData('visit:country'), // Keep using visit:country
      fetchLocationData('visit:region_name'),
      fetchLocationData('visit:city_name'),
    ]);

    console.log(
      `Fetched ${countriesData.length} countries, ${regionsData.length} regions, ${citiesData.length} cities.`
    );

    const responseData = {
      countries: countriesData.sort((a, b) => b.visitors - a.visitors), // Sort results
      regions: regionsData.sort((a, b) => b.visitors - a.visitors),
      cities: citiesData.sort((a, b) => b.visitors - a.visitors),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    // Log the main error (e.g., session, prisma connection)
    console.error('Error fetching Plausible location data:', error.response?.data || error.message);
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
      error: 'Failed to fetch location data',
      details: typeof error.message === 'string' ? error.message : 'Internal server error',
      countries: [],
      regions: [],
      cities: [],
    });
  } finally {
    // Ensure Prisma client is disconnected
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
