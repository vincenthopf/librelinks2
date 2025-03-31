import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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

/**
 * Simplified VisitorsGraph component showing only visits line
 */
const VisitorsGraph = ({ timeseriesData = [], isLoading = false, timeRange = 'day' }) => {
  // Debug logging
  useEffect(() => {
    console.log('VisitorsGraph data:', timeseriesData);
    console.log('VisitorsGraph timeRange:', timeRange);
  }, [timeseriesData, timeRange]);

  // Loading state
  if (isLoading) {
    return <GraphSkeleton />;
  }

  // Process the timeseries data based on time range
  const processedData = processTimeseriesData(timeseriesData, timeRange);
  console.log('Processed data for chart:', processedData);

  // Extract data for chart
  const { labels, visitCounts } = processedData;

  // Simplest possible chart configuration
  const chartConfig = {
    labels: labels,
    datasets: [
      {
        label: 'Total Visits',
        data: visitCounts,
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
          suggestedMax: Math.max(...visitCounts, 5), // At least 5 for visibility
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Visits Over Time</h2>
      <div className="h-64">
        <Line data={chartConfig} options={options} />
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
 * Process timeseries data based on time range
 * @param {Array} data - Raw timeseries data
 * @param {string} timeRange - Current time range (day, 7d, 30d, etc.)
 * @returns {Object} Processed data with labels and visitCounts
 */
function processTimeseriesData(data, timeRange) {
  // Generate mock data if no real data is available
  if (!Array.isArray(data) || data.length === 0) {
    return generateMockData(timeRange);
  }

  // Parse dates and sort chronologically
  const parsedData = data.map(item => {
    let dateObj;
    let visits = 0;

    // Parse date
    try {
      if (typeof item.date === 'string') {
        // Handle ISO string or YYYY-MM-DD format
        dateObj = new Date(item.date);
      } else if (item.date instanceof Date) {
        dateObj = item.date;
      } else {
        // Default to current date if unparseable
        console.warn('Unparseable date:', item.date);
        dateObj = new Date();
      }

      // Validate if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date after parsing:', item.date);
        dateObj = new Date(); // Use current date as fallback
      }
    } catch (e) {
      console.error('Error parsing date:', e);
      dateObj = new Date(); // Use current date as fallback
    }

    // Parse visits
    if (typeof item.visits === 'object' && item.visits !== null) {
      visits = item.visits.value || 0;
    } else {
      visits = typeof item.visits === 'number' ? item.visits : 0;
    }

    return { date: dateObj, visits };
  });

  // Sort chronologically
  parsedData.sort((a, b) => a.date - b.date);

  // For 'day' view, aggregate by hour
  if (timeRange === 'day') {
    const hourlyData = aggregateByHour(parsedData);

    // Format for display
    const labels = hourlyData.map(item => formatDateForDisplay(item.date, timeRange));

    const visitCounts = hourlyData.map(item => item.visits);

    return { labels, visitCounts };
  }
  // For multiple day views, aggregate by day
  else {
    const dailyData = aggregateByDay(parsedData);

    // Format for display
    const labels = dailyData.map(item => formatDateForDisplay(item.date, timeRange));

    const visitCounts = dailyData.map(item => item.visits);

    return { labels, visitCounts };
  }
}

/**
 * Aggregate data by hour
 * @param {Array} data - Parsed data array
 * @returns {Array} Data aggregated by hour
 */
function aggregateByHour(data) {
  const hourMap = new Map();

  // Create a full 24-hour series for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Populate each hour with 0 visits
  for (let i = 0; i < 24; i++) {
    const hourDate = new Date(today);
    hourDate.setHours(i);
    const hourKey = hourDate.toISOString().substring(0, 13); // YYYY-MM-DDTHH
    hourMap.set(hourKey, { date: new Date(hourDate), visits: 0 });
  }

  // Add actual data points
  data.forEach(item => {
    const hourDate = new Date(item.date);
    hourDate.setMinutes(0, 0, 0);
    const hourKey = hourDate.toISOString().substring(0, 13);

    if (hourMap.has(hourKey)) {
      const existing = hourMap.get(hourKey);
      hourMap.set(hourKey, {
        date: hourDate,
        visits: existing.visits + item.visits,
      });
    } else {
      hourMap.set(hourKey, { date: hourDate, visits: item.visits });
    }
  });

  // Convert map back to array and sort
  return Array.from(hourMap.values()).sort((a, b) => a.date - b.date);
}

/**
 * Aggregate data by day
 * @param {Array} data - Parsed data array
 * @param {string} timeRange - Current time range
 * @returns {Array} Data aggregated by day
 */
function aggregateByDay(data) {
  const dayMap = new Map();

  // Create a series for the past N days based on time range
  const numDays = getNumDaysFromTimeRange(data);
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  // Populate each day with 0 visits
  for (let i = 0; i < numDays; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - (numDays - 1) + i);
    date.setHours(0, 0, 0, 0);
    const dayKey = date.toISOString().substring(0, 10); // YYYY-MM-DD
    dayMap.set(dayKey, { date: new Date(date), visits: 0 });
  }

  // Add actual data points
  data.forEach(item => {
    const dayDate = new Date(item.date);
    dayDate.setHours(0, 0, 0, 0);
    const dayKey = dayDate.toISOString().substring(0, 10);

    if (dayMap.has(dayKey)) {
      const existing = dayMap.get(dayKey);
      dayMap.set(dayKey, {
        date: dayDate,
        visits: existing.visits + item.visits,
      });
    } else {
      dayMap.set(dayKey, { date: dayDate, visits: item.visits });
    }
  });

  // Convert map back to array and sort
  return Array.from(dayMap.values()).sort((a, b) => a.date - b.date);
}

/**
 * Determine number of days to display based on time range and data
 */
function getNumDaysFromTimeRange(data) {
  // If we have actual data with a date range, use that
  if (data.length > 1) {
    const minDate = new Date(Math.min(...data.map(d => d.date.getTime())));
    const maxDate = new Date(Math.max(...data.map(d => d.date.getTime())));
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1); // At least 1 day
  }

  // Otherwise use default values based on typical ranges
  return 7; // Default to 7 days if we can't determine
}

/**
 * Generate mock data when no real data is available
 * @param {string} timeRange - Current time range
 * @returns {Object} Mock data with labels and visitCounts
 */
function generateMockData(timeRange) {
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
  const labels = mockData.map(item => formatDateForDisplay(item.date, timeRange));

  const visitCounts = mockData.map(item => item.visits);

  return { labels, visitCounts };
}

/**
 * Format a date object based on the current time range
 * @param {Date} date - Date object to format
 * @param {string} timeRange - Current time range (day, 7d, 30d, etc.)
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(date, timeRange) {
  // Fallback if invalid date
  if (!date || isNaN(date.getTime())) {
    return 'Unknown';
  }

  try {
    switch (timeRange) {
      case 'day':
        // For day view, show hours (12-hour format with AM/PM)
        return date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

      case '7d':
      case '30d':
        // For week/month view, show abbreviated weekday name
        return date.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

      case 'month':
        // For monthly view, show day of month
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        });

      case '6mo':
      case '12mo':
        // For longer ranges, show month and year
        return date.toLocaleDateString([], {
          month: 'short',
          year: 'numeric',
        });

      default:
        // Default format
        return date.toLocaleDateString();
    }
  } catch (e) {
    console.error('Error formatting date:', e);
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
