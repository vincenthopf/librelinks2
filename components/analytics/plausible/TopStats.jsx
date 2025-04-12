import React from 'react';

/**
 * Helper function to format time in seconds to MM:SS or HH:MM:SS
 */
const formatTime = seconds => {
  if (seconds === null || seconds === undefined || seconds < 0) {
    return '-'; // Return dash for invalid input
  }
  if (seconds === 0) {
    return '0s';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let timeString = '';
  if (hours > 0) {
    timeString += `${hours}h `;
  }
  if (minutes > 0 || hours > 0) {
    // Pad minutes only if hours are present or minutes > 0
    const paddedMinutes = hours > 0 && minutes < 10 ? `0${minutes}` : minutes;
    timeString += `${paddedMinutes}m `;
  }
  // Always show seconds if total duration < 1 hour, or if there are remaining seconds
  if (hours === 0) {
    const paddedSeconds =
      minutes > 0 && remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    timeString += `${paddedSeconds}s`;
  }

  return timeString.trim(); // Trim trailing space if only H and M shown
};

/**
 * Displays the top statistics like visitors, visits, pageviews etc.
 * @param {Object} metrics - The metrics object from the API
 * @param {boolean} isLoading - Loading state
 * @param {string} selectedMetric - The currently selected metric
 * @param {function} onMetricSelect - Callback function to select a metric
 */
const TopStats = ({ metrics, isLoading, selectedMetric, onMetricSelect }) => {
  // Define stats with keys for selection
  const stats = [
    { key: 'visitors', label: 'Unique Visitors', value: metrics?.visitors ?? 0 },
    { key: 'visits', label: 'Total Visits', value: metrics?.visits ?? 0 },
    { key: 'events', label: 'Total Clicks', value: metrics?.events ?? 0 },
    { key: 'pageviews', label: 'Total Pageviews', value: metrics?.pageviews ?? 0 },
    {
      key: 'time_on_page',
      label: 'Time on Page',
      value: formatTime(metrics?.time_on_page),
      isTime: true,
    },
    {
      key: 'scroll_depth',
      label: 'Scroll Depth',
      value: metrics?.scroll_depth ? `${metrics.scroll_depth}%` : '-',
      isPercentage: true,
    },
    // Add Bounce Rate later if needed { label: 'Bounce Rate', value: 'TBD' },
  ];

  // Metrics that can be plotted on the main chart
  const plottableMetrics = [
    'visitors',
    'visits',
    'events',
    'pageviews',
    'time_on_page',
    'scroll_depth',
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Generate 6 skeletons */}
        {[...Array(6)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {stats.map(stat => (
        <StatCard
          key={stat.key || stat.label} // Use key if available
          label={stat.label}
          value={stat.value}
          metricKey={stat.key}
          isPlottable={plottableMetrics.includes(stat.key)}
          isSelected={selectedMetric === stat.key}
          onSelect={onMetricSelect}
        />
      ))}
    </div>
  );
};

// Update StatCard to handle selection and highlighting
const StatCard = ({ label, value, metricKey, isPlottable, isSelected, onSelect }) => {
  const cardClasses = `bg-white p-4 rounded-lg shadow-sm text-center transition-all duration-150 ease-in-out ${
    isPlottable ? 'cursor-pointer hover:shadow-md' : ''
  } ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''}`;

  const handleClick = () => {
    if (isPlottable && onSelect && metricKey) {
      onSelect(metricKey);
    }
  };

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-l font-bold">{value}</div>
    </div>
  );
};

// StatCardSkeleton remains the same
const StatCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
  </div>
);

export default TopStats;
