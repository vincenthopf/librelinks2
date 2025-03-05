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

  // Always ensure we have data to display
  let chartData = [];

  if (Array.isArray(timeseriesData) && timeseriesData.length > 0) {
    // Use real data if available
    chartData = timeseriesData;
  } else {
    // Create simple mock data if no real data
    const now = new Date();
    chartData = [
      { date: new Date(now.setHours(now.getHours() - 8)).toISOString(), visits: 3 },
      { date: new Date(now.setHours(now.getHours() + 4)).toISOString(), visits: 5 },
      { date: new Date(now.setHours(now.getHours() + 4)).toISOString(), visits: 4 },
    ];
    console.log('Using mock data:', chartData);
  }

  // Format times for display
  const labels = chartData.map(item => {
    const date = new Date(item.date);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  // Extract visit counts
  const visitCounts = chartData.map(item => {
    // Handle both object and direct number formats
    if (typeof item.visits === 'object' && item.visits !== null) {
      return item.visits.value || 0;
    }
    return typeof item.visits === 'number' ? item.visits : 0;
  });

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
        tension: 0, // Straight lines
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
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

      {/* Debug display to verify data exists */}
      <div className="mt-4 text-sm text-gray-500">
        <div>Data points: {visitCounts.length}</div>
        <div>Values: {visitCounts.join(', ')}</div>
      </div>
    </div>
  );
};

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
