import React from 'react';

/**
 * TopStats component for displaying the main metrics at the top of the dashboard
 * Matches the Plausible design for metrics display
 *
 * Note: Some metrics like bounce_rate, visit_duration, and views_per_visit have been removed
 * as they cannot be properly filtered by user ID in the Plausible API or are not needed.
 *
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Metrics data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const TopStats = ({ metrics, isLoading = false }) => {
  // Define the metrics to display
  const statsData = [
    {
      title: 'UNIQUE VISITORS',
      value: metrics?.visitors || 0,
      previousValue: metrics?.previous_visitors || 0,
      formatter: formatNumber,
      isInverted: false, // Higher is better
    },
    {
      title: 'TOTAL VISITS',
      value: metrics?.visits || 0,
      previousValue: metrics?.previous_visits || 0,
      formatter: formatNumber,
      isInverted: false, // Higher is better
    },
    {
      title: 'TOTAL PAGEVIEWS',
      value: metrics?.pageviews || 0,
      previousValue: metrics?.previous_pageviews || 0,
      formatter: formatNumber,
      isInverted: false, // Higher is better
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 my-4 mx-auto">
      {isLoading
        ? statsData.map((_, i) => <MetricSkeleton key={i} />)
        : statsData.map(metric => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              previousValue={metric.previousValue}
              formatter={metric.formatter}
              isInverted={metric.isInverted}
            />
          ))}
    </div>
  );
};

/**
 * Individual metric card component
 */
const MetricCard = ({ title, value, previousValue, formatter, isInverted }) => {
  // Calculate change percentage
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = isInverted ? change < 0 : change > 0;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h2 className="text-xs uppercase text-gray-500 font-medium mb-2">{title}</h2>
      <div className="flex items-end">
        <span className="text-2xl font-bold">{formatter(value)}</span>
        {previousValue > 0 && (
          <span className={`ml-2 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for metric cards
 */
const MetricSkeleton = () => (
  <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

// Formatter functions
const formatNumber = value => {
  return new Intl.NumberFormat().format(Math.round(value));
};

const formatDecimal = value => {
  return value.toFixed(2);
};

const formatPercentage = value => {
  return `${Math.round(value)}%`;
};

const formatDuration = seconds => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
};

export default TopStats;
