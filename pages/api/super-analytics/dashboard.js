import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import {
  queryPlausibleV2,
  formatTimeRangeV2,
  processMetricsResults,
  processDimensionResults,
} from '@/lib/plausibleV2Api';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
dayjs.extend(timezone);
dayjs.extend(utc);

// Define metrics for main query (excluding events)
const mainMetricNames = ['visitors', 'visits', 'pageviews', 'time_on_page', 'scroll_depth'];
// Define metrics for events query
const eventMetricName = ['events']; // Just events

/**
 * API endpoint for fetching Plausible dashboard metrics for a specific user
 *
 * This fetches the main dashboard metrics (unique visitors, total visits, etc.)
 * filtered by the URL path of the user's page.
 *
 * Updated to use Plausible v2 API which uses a single POST endpoint instead of multiple GET endpoints.
 */
export default async function handler(req, res) {
  // console.log('Dashboard API called with query:', req.query); // Commented out

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession({ req });

  // Require authentication
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { timeRange = 'day', timezone = 'UTC' } = req.query;
    const userId = session.user.id;

    // console.log(`Fetching metrics for user ID: ${userId}, time range: ${timeRange}`); // Commented out

    // Initialize Prisma client
    const prisma = new PrismaClient();

    // Get the user's unique path/slug from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { handle: true },
    });

    if (!user || !user.handle) {
      await prisma.$disconnect();
      return res.status(404).json({ error: 'User not found or no handle set' });
    }

    // Construct the path to filter by (e.g., "/q6nr393H91")
    const pathToFilter = `/${user.handle}`;
    // console.log(`Filtering Plausible data by path: ${pathToFilter}`); // Commented out

    // Format date range for v2 API, passing timezone
    const date_range = formatTimeRangeV2(timeRange, timezone);

    // Define the page filter
    const pageFilter = ['contains', 'event:page', [pathToFilter]];
    // Define the specific goal filter for clicks
    const clickGoalFilter = ['is', 'event:goal', ['Outbound Link: Click']];

    // --- Fetch Aggregate Metrics ---
    // Fetch main aggregate metrics (filtered by page)
    const aggregateMainResponse = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: mainMetricNames,
      date_range,
      filters: [pageFilter],
    });

    // Fetch aggregate events metric (filtered by page AND goal)
    const aggregateEventsResponse = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: eventMetricName,
      date_range,
      filters: [pageFilter, clickGoalFilter], // Apply both filters
    });

    // Process and combine aggregate metrics
    let metrics = {};
    if (aggregateMainResponse.results && aggregateMainResponse.results.length > 0) {
      metrics = processMetricsResults(aggregateMainResponse.results, mainMetricNames);
    } else {
      // Initialize main metrics with zeros/nulls if no results
      metrics = mainMetricNames.reduce((acc, name) => {
        acc[name] = name === 'time_on_page' || name === 'scroll_depth' ? null : 0;
        return acc;
      }, {});
    }

    // Add the events metric from its separate query
    metrics.events =
      aggregateEventsResponse.results && aggregateEventsResponse.results.length > 0
        ? processMetricsResults(aggregateEventsResponse.results, eventMetricName).events || 0
        : 0;

    console.log('[dashboard.js] Processed Combined Aggregate Metrics:', metrics);

    // --- Fetch Timeseries Data ---
    let timeDimension;
    if (timeRange === 'day') {
      timeDimension = 'time:hour';
    } else if (timeRange === '6mo' || timeRange === '12mo') {
      timeDimension = 'time:month';
    } else {
      timeDimension = 'time:day';
    }
    console.log(`[dashboard.js] Fetching timeseries with dimension: ${timeDimension}`);

    // Fetch main timeseries metrics (filtered by page)
    const timeSeriesMainResponse = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: mainMetricNames,
      date_range,
      dimensions: [timeDimension],
      filters: [pageFilter],
    });

    // Fetch events timeseries metric (filtered by page AND goal)
    const timeSeriesEventsResponse = await queryPlausibleV2({
      site_id: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      metrics: eventMetricName,
      date_range,
      dimensions: [timeDimension],
      filters: [pageFilter, clickGoalFilter], // Apply both filters
    });

    // Process and combine timeseries data
    let timeseriesData = [];
    const mainTimeseriesProcessed =
      timeSeriesMainResponse.results && timeSeriesMainResponse.results.length > 0
        ? processDimensionResults(timeSeriesMainResponse.results, mainMetricNames, [timeDimension])
        : [];

    const eventsTimeseriesProcessed =
      timeSeriesEventsResponse.results && timeSeriesEventsResponse.results.length > 0
        ? processDimensionResults(timeSeriesEventsResponse.results, eventMetricName, [
            timeDimension,
          ])
        : [];

    // Create a map of events data by date for easy merging
    const eventsMap = new Map();
    eventsTimeseriesProcessed.forEach(item => {
      eventsMap.set(item[timeDimension], item.events || 0);
    });

    // Merge main data with events data
    timeseriesData = mainTimeseriesProcessed.map(item => {
      let dateString = item[timeDimension];
      // Date formatting logic (same as before)
      if (timeDimension === 'time:hour' && dateString && !dateString.includes('T')) {
        dateString = dateString.replace(' ', 'T');
      } else if (
        timeDimension === 'time:month' &&
        dateString &&
        dateString.match(/^\d{4}-\d{2}$/)
      ) {
        dateString = `${dateString}-01`;
      }

      const mergedMetrics = mainMetricNames.reduce((acc, metricName) => {
        const rawValue = item[metricName];
        let processedValue =
          metricName === 'time_on_page' || metricName === 'scroll_depth' ? null : 0;
        if (rawValue !== undefined && rawValue !== null) {
          const num = Number(rawValue);
          processedValue = isNaN(num)
            ? metricName === 'time_on_page' || metricName === 'scroll_depth'
              ? null
              : 0
            : num;
        }
        if (metricName === 'scroll_depth') {
          processedValue = processedValue !== null ? Math.round(processedValue) : null;
        }
        acc[metricName] = processedValue;
        return acc;
      }, {});

      // Add the events count from the separate query using the map
      mergedMetrics.events = eventsMap.get(item[timeDimension]) || 0;

      return {
        date: dateString,
        ...mergedMetrics,
      };
    });

    // If main timeseries was empty but events timeseries wasn't, create baseline
    if (mainTimeseriesProcessed.length === 0 && eventsTimeseriesProcessed.length > 0) {
      timeseriesData = eventsTimeseriesProcessed.map(item => {
        let dateString = item[timeDimension];
        // Date formatting logic
        if (timeDimension === 'time:hour' && dateString && !dateString.includes('T')) {
          dateString = dateString.replace(' ', 'T');
        } else if (
          timeDimension === 'time:month' &&
          dateString &&
          dateString.match(/^\d{4}-\d{2}$/)
        ) {
          dateString = `${dateString}-01`;
        }

        const baseMetrics = mainMetricNames.reduce((acc, name) => {
          acc[name] = name === 'time_on_page' || name === 'scroll_depth' ? null : 0;
          return acc;
        }, {});

        return {
          date: dateString,
          ...baseMetrics,
          events: item.events || 0,
        };
      });
    }

    // If NO timeseries data resulted from EITHER query, generate fallback (mostly zeros)
    if (timeseriesData.length === 0) {
      console.log(
        '[dashboard.js] No Plausible timeseries data found, generating zero-value points'
      );
      // Simplified zero-value generation for brevity, assuming day range if unknown
      const today = new Date();
      timeseriesData = [];
      const points = timeRange === 'day' ? 24 : getNumDaysFromTimeRange(timeRange) || 7;
      const intervalUnit = timeRange === 'day' ? 'hour' : 'day';

      const start = dayjs().tz(timezone).startOf(intervalUnit);
      for (let i = 0; i < points; i++) {
        const pointDate = start.add(i, intervalUnit);
        const zeroMetrics = [...mainMetricNames, ...eventMetricName].reduce((acc, name) => {
          acc[name] = name === 'time_on_page' || name === 'scroll_depth' ? null : 0;
          return acc;
        }, {});
        timeseriesData.push({
          date: pointDate.toISOString(),
          ...zeroMetrics,
        });
      }
    }

    // Remove DB fallback logic as it's complex and potentially misleading for this specific setup
    // Ensure final metrics are numbers, default to 0 if null/undefined was set earlier
    const finalMetrics = Object.entries(metrics).reduce((acc, [key, value]) => {
      acc[key] = Number(value) || 0;
      return acc;
    }, {});

    // Combine results
    const result = {
      metrics: finalMetrics,
      timeseries: timeseriesData,
    };

    await prisma.$disconnect(); // Ensure prisma disconnects
    return res.status(200).json(result);
  } catch (error) {
    // Simplified error handling
    console.error(
      'Error fetching Plausible dashboard data:',
      error.response?.data || error.message
    );

    // Ensure prisma disconnects on error too
    try {
      await prisma.$disconnect();
    } catch (e) {
      /* ignore disconnect error */
    }

    // Return empty/zeroed data on error
    const zeroMetrics = [...mainMetricNames, ...eventMetricName].reduce((acc, name) => {
      acc[name] = 0;
      return acc;
    }, {});

    return res.status(500).json({
      metrics: zeroMetrics,
      timeseries: [],
      error: 'Failed to fetch dashboard data',
      details: error.response?.data?.error || error.message,
    });
  }
}

/**
 * Format time range for Plausible API
 * @param {string} timeRange - Time range parameter from query
 * @returns {Object} Formatted period and date for Plausible API
 */
function formatTimeRange(timeRange) {
  const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

  switch (timeRange) {
    case 'day':
      return { period: 'day', date: today };
    case '7d':
      return { period: '7d', date: today };
    case '30d':
      return { period: '30d', date: today };
    case 'month':
      return { period: 'month', date: today };
    case '6mo':
      return { period: '6mo', date: today };
    case '12mo':
      return { period: '12mo', date: today };
    default:
      return { period: 'day', date: today };
  }
}

// Helper function for fallback timeseries generation (if needed later)
function getNumDaysFromTimeRange(timeRange) {
  switch (timeRange) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case 'month':
      return dayjs().daysInMonth();
    case '6mo':
      return 180; // Approx
    case '12mo':
      return 365; // Approx
    default:
      return 7;
  }
}
