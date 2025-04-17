import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs'; // Import dayjs
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import timezonePlugin from 'dayjs/plugin/timezone'; // Import timezone plugin
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Check } from 'lucide-react'; // Added Check
import Link from 'next/link'; // Added Link

dayjs.extend(utc); // Extend dayjs with UTC plugin
dayjs.extend(timezonePlugin); // Extend with timezone plugin

// Register the chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Basic chart style overrides to ensure visibility
ChartJS.defaults.datasets.line.borderWidth = 5; // Extremely thick line
ChartJS.defaults.elements.point.radius = 6; // Large points
ChartJS.defaults.elements.point.borderWidth = 2;

// Helper function to get label based on metric
const getLabelForMetric = metric => {
  switch (metric) {
    case 'visitors':
      return 'Unique Visitors';
    case 'visits':
      return 'Total Visits';
    case 'events':
      return 'Total Clicks';
    case 'pageviews':
      return 'Total Pageviews';
    case 'time_on_page':
      return 'Time on Page (Avg Sec)';
    case 'scroll_depth':
      return 'Scroll Depth (%)';
    default:
      return 'Total Visits';
  }
};

/**
 * Simplified VisitorsGraph component showing only visits line
 */
const VisitorsGraph = ({
  timeseriesData = [],
  isLoading = false,
  timeRange = 'day',
  timezone = 'UTC',
  metricToPlot = 'visits',
  isSubscribed, // Added isSubscribed prop
}) => {
  // Debug logging
  useEffect(() => {
    console.log('VisitorsGraph data:', timeseriesData);
    console.log('VisitorsGraph timeRange:', timeRange);
    console.log('VisitorsGraph timezone:', timezone);
    console.log('VisitorsGraph metricToPlot:', metricToPlot);
  }, [timeseriesData, timeRange, timezone, metricToPlot]);

  // Define chart title early so it's available for the placeholder
  const chartLabel = getLabelForMetric(metricToPlot);
  const chartTitle = `${chartLabel} Over Time`;

  // Loading state
  if (isLoading) {
    return <GraphSkeleton />;
  }

  // Process the timeseries data based on time range and timezone
  const processedData = processTimeseriesData(timeseriesData, timeRange, timezone);
  console.log('Processed data for chart:', processedData);

  // Extract data for chart based on metricToPlot
  const { labels, dataArrays } = processedData; // Expect dataArrays object now
  const dataToPlot = dataArrays[metricToPlot] || dataArrays['visits'] || []; // Fallback to visits

  // Simplest possible chart configuration
  const chartConfig = {
    labels: labels,
    datasets: [
      {
        label: chartLabel, // Use dynamic label
        data: dataToPlot, // Use selected data array
        fill: false,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 5,
        tension: 0.4, // Slight curve for better visualization
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointBorderWidth: 2,
      },
    ],
  };

  // Minimal chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: context => {
            // Show formatted date in tooltip
            if (context[0]) {
              return context[0].label;
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45, // Allow rotation for better readability
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
          // Ensure at least some y-axis range to make small values visible
          suggestedMin: 0,
          suggestedMax: Math.max(...dataToPlot, 5), // Use dataToPlot for suggestedMax
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">{chartTitle}</h2>
      <div className="h-64">
        <div className={`h-full ${!isSubscribed ? 'filter blur-lg opacity-50' : ''}`}>
          {!isLoading && <Line data={chartConfig} options={options} />}
        </div>
        {isLoading && <GraphSkeleton />}
      </div>

      {/* Debug display to verify data exists 
      <div className="mt-4 text-sm text-gray-500">
        <div>Data points: {visitCounts.length}</div>
        <div>Values: {visitCounts.join(', ')}</div>
      </div>
      */}
    </div>
  );
};

/**
 * Process timeseries data based on time range using dayjs
 * @param {Array} data - Raw timeseries data
 * @param {string} timeRange - Current time range (day, 7d, 30d, etc.)
 * @param {string} timezone - The target timezone for display
 * @returns {Object} Processed data with labels and visitCounts
 */
function processTimeseriesData(data, timeRange, timezone) {
  if (!Array.isArray(data) || data.length === 0) {
    // Adjust mock data generation if needed to include other metrics
    return generateMockData(timeRange, timezone);
  }

  const parsedData = data
    .map(item => {
      let dateObj = null;
      // Initialize all potential metrics
      let metrics = {
        visitors: 0,
        visits: 0,
        pageviews: 0,
        time_on_page: 0,
        scroll_depth: 0,
        events: 0,
      };

      try {
        if (typeof item.date === 'string') {
          // Use dayjs.utc() to parse, assuming YYYY-MM-DD or ISO format
          dateObj = dayjs.utc(item.date);
        } else if (item.date instanceof Date && !isNaN(item.date.getTime())) {
          // Convert existing Date objects to dayjs UTC objects
          dateObj = dayjs.utc(item.date);
        } else {
          console.warn('Unparseable or invalid date:', item.date);
        }

        // Validate if dateObj is valid after parsing
        if (!dateObj || !dateObj.isValid()) {
          console.warn('Invalid date after parsing with dayjs:', item.date);
          dateObj = null; // Mark as invalid
        }
      } catch (e) {
        console.error('Error parsing date with dayjs:', e);
        dateObj = null;
      }

      // If date is invalid, skip this item
      if (!dateObj) {
        return null;
      }

      // Parse all available metrics safely
      metrics.visitors =
        typeof item.visitors === 'number' ? item.visitors : (item.visitors?.value ?? 0);
      metrics.visits = typeof item.visits === 'number' ? item.visits : (item.visits?.value ?? 0);
      metrics.pageviews =
        typeof item.pageviews === 'number' ? item.pageviews : (item.pageviews?.value ?? 0);
      metrics.time_on_page =
        typeof item.time_on_page === 'number' ? item.time_on_page : (item.time_on_page?.value ?? 0);
      metrics.scroll_depth =
        typeof item.scroll_depth === 'number' ? item.scroll_depth : (item.scroll_depth?.value ?? 0);
      metrics.events = typeof item.events === 'number' ? item.events : (item.events?.value ?? 0);

      return { date: dateObj, metrics }; // Store metrics object
    })
    .filter(item => item !== null); // Filter out items with invalid dates

  // Sort chronologically using dayjs objects
  parsedData.sort((a, b) => a.date.valueOf() - b.date.valueOf());

  let aggregationFunction;
  let aggregationTimeframe;

  if (timeRange === 'day') {
    aggregationFunction = aggregateByHour;
    aggregationTimeframe = 'hour';
  } else if (timeRange === '6mo' || timeRange === '12mo') {
    aggregationFunction = aggregateByMonth;
    aggregationTimeframe = 'month';
  } else {
    aggregationFunction = aggregateByDay;
    aggregationTimeframe = 'day';
  }

  // Aggregate the data (function now needs to handle the metrics object)
  const aggregatedData = aggregationFunction(parsedData, timeRange, timezone);

  // Format for display
  const labels = aggregatedData.map(item => formatDateForDisplay(item.date, timeRange, timezone));

  // Extract separate arrays for each metric
  const dataArrays = {
    visitors: aggregatedData.map(item => item.metrics.visitors),
    visits: aggregatedData.map(item => item.metrics.visits),
    pageviews: aggregatedData.map(item => item.metrics.pageviews),
    time_on_page: aggregatedData.map(item => item.metrics.time_on_page),
    scroll_depth: aggregatedData.map(item => item.metrics.scroll_depth),
    events: aggregatedData.map(item => item.metrics.events),
  };

  // Return labels and the object containing all metric arrays
  return { labels, dataArrays };
}

/**
 * Aggregate data by hour (NOW accepts timezone AND metrics object)
 * @param {Array<{date: dayjs.Dayjs, metrics: object}>} data - Parsed data array with dayjs UTC objects and metrics
 * @param {string} timeRange - The selected time range string (only 'day' uses this)
 * @param {string} timezone - The target timezone
 * @returns {Array<{date: dayjs.Dayjs, metrics: object}>} Data aggregated by hour
 */
function aggregateByHour(data, timeRange, timezone) {
  const hourMap = new Map();
  const nowInTz = dayjs().tz(timezone);
  const startOfTodayInTz = nowInTz.startOf('day');

  // Initialize map with zero metrics for each hour
  for (let i = 0; i < 24; i++) {
    const hourDateInTz = startOfTodayInTz.add(i, 'hour');
    const hourKey = hourDateInTz.utc().format('YYYY-MM-DDTHH');
    hourMap.set(hourKey, {
      date: hourDateInTz, // Store dayjs object in target TZ
      metrics: {
        visitors: 0,
        visits: 0,
        pageviews: 0,
        time_on_page: 0,
        scroll_depth: 0,
        events: 0,
        count: 0,
      },
    });
  }

  // Add actual data points
  data.forEach(item => {
    const hourKey = item.date.utc().format('YYYY-MM-DDTHH');
    if (hourMap.has(hourKey)) {
      const existing = hourMap.get(hourKey);
      existing.metrics.visitors += item.metrics.visitors;
      existing.metrics.visits += item.metrics.visits;
      existing.metrics.pageviews += item.metrics.pageviews;
      existing.metrics.events += item.metrics.events;
      existing.metrics.time_on_page += item.metrics.time_on_page;
      existing.metrics.scroll_depth += item.metrics.scroll_depth;
      existing.metrics.count += 1;
    }
  });

  // Convert map back to array, calculate averages, and sort
  return Array.from(hourMap.values())
    .map(item => {
      // Calculate averages where count > 0
      if (item.metrics.count > 0) {
        item.metrics.time_on_page = item.metrics.time_on_page / item.metrics.count;
        item.metrics.scroll_depth = item.metrics.scroll_depth / item.metrics.count;
      }
      delete item.metrics.count; // Remove helper count property
      return item;
    })
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

/**
 * Aggregate data by day (NOW accepts timezone AND metrics object)
 * @param {Array<{date: dayjs.Dayjs, metrics: object}>} data - Parsed data array with dayjs UTC objects and metrics
 * @param {string} timeRange - The selected time range string
 * @param {string} timezone - The target timezone
 * @returns {Array<{date: dayjs.Dayjs, metrics: object}>} Data aggregated by day
 */
function aggregateByDay(data, timeRange, timezone) {
  const dayMap = new Map();

  // Calculate date range specifically for 'month' or use existing logic
  let startDate, endDate, numDays;
  const nowInTz = dayjs().tz(timezone);

  if (timeRange === 'month') {
    startDate = nowInTz.startOf('month');
    endDate = nowInTz.startOf('day'); // Use start of today as the end date
    numDays = endDate.diff(startDate, 'day') + 1; // Number of days from start of month until today
    console.log(
      `[aggregateByDay] Month Range: Start=${startDate.format()}, End=${endDate.format()}, Days=${numDays}`
    );
  } else {
    // Existing logic for 7d, 30d, etc.
    numDays = getNumDaysFromTimeRange(timeRange);
    endDate = nowInTz.startOf('day');
    startDate = endDate.subtract(numDays - 1, 'day');
    console.log(
      `[aggregateByDay] Other Range (${timeRange}): Start=${startDate.format()}, End=${endDate.format()}, Days=${numDays}`
    );
  }

  // Initialize map for the calculated range
  for (let i = 0; i < numDays; i++) {
    const currentDay = startDate.add(i, 'day');
    const dayKey = currentDay.utc().format('YYYY-MM-DD');
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: currentDay,
        metrics: {
          visitors: 0,
          visits: 0,
          pageviews: 0,
          time_on_page: 0,
          scroll_depth: 0,
          events: 0,
          count: 0,
        },
      });
    }
  }

  // Add actual data points
  data.forEach(item => {
    const dayKey = item.date.utc().format('YYYY-MM-DD'); // Use UTC key
    if (dayMap.has(dayKey)) {
      const existing = dayMap.get(dayKey);
      existing.metrics.visitors += item.metrics.visitors;
      existing.metrics.visits += item.metrics.visits;
      existing.metrics.pageviews += item.metrics.pageviews;
      existing.metrics.events += item.metrics.events;
      existing.metrics.time_on_page += item.metrics.time_on_page;
      existing.metrics.scroll_depth += item.metrics.scroll_depth;
      existing.metrics.count += 1;
    }
  });

  // Calculate averages and sort
  return Array.from(dayMap.values())
    .map(item => {
      if (item.metrics.count > 0) {
        item.metrics.time_on_page = item.metrics.time_on_page / item.metrics.count;
        item.metrics.scroll_depth = item.metrics.scroll_depth / item.metrics.count;
      }
      delete item.metrics.count;
      return item;
    })
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

/**
 * Aggregate data by month (NOW accepts timezone AND metrics object)
 * @param {Array<{date: dayjs.Dayjs, metrics: object}>} data - Parsed data array with dayjs UTC objects and metrics
 * @param {string} timeRange - The selected time range string
 * @param {string} timezone - The target timezone
 * @returns {Array<{date: dayjs.Dayjs, metrics: object}>} Data aggregated by month
 */
function aggregateByMonth(data, timeRange, timezone) {
  const monthMap = new Map();
  const numMonths = timeRange === '6mo' ? 6 : 12;
  const nowInTz = dayjs().tz(timezone);
  const endMonth = nowInTz.startOf('month');
  const startMonth = endMonth.subtract(numMonths - 1, 'month');

  // Initialize map
  for (let i = 0; i < numMonths; i++) {
    const currentMonth = startMonth.add(i, 'month');
    const monthKey = currentMonth.utc().format('YYYY-MM');
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        date: currentMonth,
        metrics: {
          visitors: 0,
          visits: 0,
          pageviews: 0,
          time_on_page: 0,
          scroll_depth: 0,
          events: 0,
          count: 0,
        },
      });
    }
  }

  // Add actual data points
  data.forEach(item => {
    const monthKey = item.date.utc().format('YYYY-MM'); // Use UTC key
    if (monthMap.has(monthKey)) {
      const existing = monthMap.get(monthKey);
      existing.metrics.visitors += item.metrics.visitors;
      existing.metrics.visits += item.metrics.visits;
      existing.metrics.pageviews += item.metrics.pageviews;
      existing.metrics.events += item.metrics.events;
      existing.metrics.time_on_page += item.metrics.time_on_page;
      existing.metrics.scroll_depth += item.metrics.scroll_depth;
      existing.metrics.count += 1;
    }
  });

  // Calculate averages and sort
  return Array.from(monthMap.values())
    .map(item => {
      if (item.metrics.count > 0) {
        item.metrics.time_on_page = item.metrics.time_on_page / item.metrics.count;
        item.metrics.scroll_depth = item.metrics.scroll_depth / item.metrics.count;
      }
      delete item.metrics.count;
      return item;
    })
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

/**
 * Determine number of days to display based on the time range string
 * @param {string} timeRange - The time range string (e.g., '7d', '30d')
 */
function getNumDaysFromTimeRange(timeRange) {
  switch (timeRange) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case 'month':
      // Get days in the current month
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    case '6mo':
      // Approximate 6 months - could be more precise if needed
      return 180;
    case '12mo':
      // Approximate 12 months - could be more precise if needed
      return 365;
    case 'day': // Should not be called for 'day', but handle defensively
      return 1;
    default:
      // Fallback if timeRange is unrecognized or data is missing
      console.warn(
        `Unrecognized timeRange "${timeRange}" in getNumDaysFromTimeRange, defaulting to 7.`
      );
      return 7;
  }
}

/**
 * Generate mock data when no real data is available
 * @param {string} timeRange - Current time range
 * @param {string} timezone - The target timezone for display
 * @returns {Object} Mock data with labels and visitCounts
 */
function generateMockData(timeRange, timezone) {
  const now = new Date();
  let mockData = [];

  if (timeRange === 'day') {
    // Generate hourly data for today
    for (let i = 0; i < 24; i++) {
      const hourDate = new Date(now);
      hourDate.setHours(i, 0, 0, 0);

      // Only include past hours and current hour
      if (hourDate <= now) {
        mockData.push({
          date: hourDate,
          visits: Math.floor(Math.random() * 5) + 1, // 1-5 visits
        });
      }
    }
  } else {
    // Generate daily data for past N days
    const numDays =
      timeRange === '7d'
        ? 7
        : timeRange === '30d'
          ? 30
          : timeRange === 'month'
            ? 30
            : timeRange === '6mo'
              ? 180
              : timeRange === '12mo'
                ? 365
                : 7; // Default to 7

    for (let i = 0; i < numDays; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (numDays - 1) + i);
      date.setHours(0, 0, 0, 0);

      mockData.push({
        date: date,
        visits: Math.floor(Math.random() * 10) + 1, // 1-10 visits
      });
    }
  }

  // Sort chronologically
  mockData.sort((a, b) => a.date - b.date);

  // Format for display
  const labels = mockData.map(item => formatDateForDisplay(item.date, timeRange, timezone));

  const visitCounts = mockData.map(item => item.visits);

  return { labels, visitCounts };
}

/**
 * Format a dayjs object based on the current time range and timezone
 * @param {dayjs.Dayjs} date - dayjs object to format (representing start of day in target timezone)
 * @param {string} timeRange - Current time range (day, 7d, 30d, etc.)
 * @param {string} timezone - The target timezone for display formatting
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(date, timeRange, timezone) {
  // Fallback if invalid date (date here is a dayjs object representing start of period in target TZ)
  if (!date || !date.isValid()) {
    return 'Unknown';
  }

  try {
    // Format the date according to the target timezone
    switch (timeRange) {
      case 'day':
        // Format time in the target timezone
        // Using dayjs format for better consistency across browsers
        return date.tz(timezone).format('h A'); // e.g., 3 PM

      case '7d':
      case '30d':
        // Format as 'MMM D' in the target timezone (Removed day of week 'ddd, ')
        return date.tz(timezone).format('MMM D');

      case 'month':
        // Format as 'MMM D' in the target timezone
        return date.tz(timezone).format('MMM D');

      case '6mo':
      case '12mo':
        // Format as 'MMM YYYY' in the target timezone
        return date.tz(timezone).format('MMM YYYY');

      default:
        // Default format YYYY-MM-DD in the target timezone
        return date.tz(timezone).format('YYYY-MM-DD');
    }
  } catch (e) {
    console.error('Error formatting dayjs date:', e);
    return 'Unknown';
  }
}

/**
 * Loading skeleton
 */
const GraphSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

export default VisitorsGraph;
