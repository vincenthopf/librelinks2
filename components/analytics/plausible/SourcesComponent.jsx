import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

/**
 * SourcesComponent for displaying traffic source and channel breakdowns
 * Matches the Plausible design with tabs for Channels and Sources.
 *
 * @param {Object} props - Component props
 * @param {Object} props.sourcesData - Combined sources and channels data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 * @param {boolean} props.isSubscribed - Whether the user is subscribed
 */
const SourcesComponent = ({ sourcesData, isLoading = false, isSubscribed }) => {
  const [activeTab, setActiveTab] = useState('channels'); // Default to Channels

  // If no data is provided or still loading, show loading state
  if (isLoading || !sourcesData) {
    return <SourcesSkeleton />;
  }

  // Extract channels and sources, provide empty arrays as fallback
  const channels = sourcesData.channels || [];
  const sources = sourcesData.sources || [];

  // Determine which *potential* data to display based on the active tab
  const potentialData = activeTab === 'channels' ? channels : sources;
  // Check if there is actual data to display, regardless of subscription status
  const hasActualData = potentialData.length > 0;

  // Available tabs
  const tabs = [
    { id: 'channels', label: 'Channels' },
    { id: 'sources', label: 'Sources' },
  ];

  // Determine which data to display based on the active tab
  // This is now just for getting the list structure if hasActualData is true
  const activeData = potentialData;

  // Calculate total visitors for percentage calculation (only if subscribed)
  const totalVisitors = isSubscribed ? activeData.reduce((sum, item) => sum + item.visitors, 0) : 0;

  // Determine max visitors for bar calculation (only if subscribed)
  const maxVisitors = isSubscribed && activeData.length > 0 ? activeData[0].visitors : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 relative">
      {/* Title and Tabs */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Top Sources</h2>
        <div className="flex space-x-1 border border-gray-200 rounded-md p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-800 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      {/* Check hasActualData first */}
      {hasActualData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2 pl-2 pr-4 font-medium text-left" style={{ width: '60%' }}>
                  {activeTab === 'channels' ? 'Channel' : 'Source'}
                </th>
                <th className="pb-2 px-4 font-medium text-right" style={{ width: '20%' }}>
                  Unique Visitors
                </th>
                <th className="pb-2 pl-4 pr-2 font-medium text-right" style={{ width: '20%' }}>
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((item, index) => {
                const percentageValue =
                  isSubscribed && totalVisitors > 0
                    ? Math.round((item.visitors / totalVisitors) * 100)
                    : 0;
                const barPercentage =
                  isSubscribed && maxVisitors > 0
                    ? Math.round((item.visitors / maxVisitors) * 100)
                    : 0;
                const barStyle = isSubscribed
                  ? {
                      background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${barPercentage}%, transparent ${barPercentage}%)`,
                    }
                  : {}; // No bar style if not subscribed

                return (
                  <tr key={index} className="border-b last:border-0">
                    <td
                      className="py-2 pl-2 pr-4 font-medium truncate"
                      style={barStyle} // Apply conditional bar style
                      title={item.name}
                    >
                      {item.name} {/* Always show name */}
                    </td>
                    {/* Conditionally render blurred data */}
                    {isSubscribed ? (
                      <td className="py-2 px-4 text-right font-medium">{item.visitors}</td>
                    ) : (
                      <td className="py-2 px-4 text-right font-medium text-gray-400 select-none opacity-75">
                        --
                      </td>
                    )}
                    {isSubscribed ? (
                      <td className="py-2 pl-4 pr-2 text-right text-gray-600">
                        {percentageValue}%
                      </td>
                    ) : (
                      <td className="py-2 pl-4 pr-2 text-right text-gray-400 select-none opacity-75">
                        --%
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Show "No data" message only if hasActualData is false
        <div className="text-center py-8 text-gray-500">
          No source data available for this period.
        </div>
      )}
    </div>
  );
};

/**
 * Loading skeleton for the sources component
 */
const SourcesSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-8 bg-gray-200 rounded w-32"></div>
      <div className="flex space-x-1">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div> {/* Header row */}
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
        <div className="h-4 bg-gray-200 rounded w-3/5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        <div className="h-4 bg-gray-200 rounded w-1/5"></div>
      </div>
    ))}
  </div>
);

export default SourcesComponent;
