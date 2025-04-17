import React, { useState, useMemo } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

/**
 * LocationsComponent for displaying geographic data
 * Matches the Plausible design for locations display
 *
 * @param {Object} props - Component props
 * @param {Object} props.locationsData - Locations data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 * @param {boolean} props.isSubscribed - Whether the user is subscribed
 */
const LocationsComponent = ({ locationsData, isLoading = false, isSubscribed }) => {
  // Re-introduce tabs
  const [activeTab, setActiveTab] = useState('countries'); // Default to countries
  const tabs = ['countries', 'regions', 'cities'];

  // Helper to capitalize
  const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

  // Determine which data source to use based on tab
  const getDataSource = () => {
    switch (activeTab) {
      case 'regions':
        return locationsData?.regions || [];
      case 'cities':
        return locationsData?.cities || [];
      case 'countries':
      default:
        return locationsData?.countries || [];
    }
  };

  const currentDataSource = getDataSource();
  const hasActualData = currentDataSource.length > 0;

  // Process data for display (sorting, calculating total - only if subscribed)
  const { activeData, totalVisitors } = useMemo(() => {
    // Use the actual data source determined above
    const data = [...currentDataSource];
    data.sort((a, b) => b.visitors - a.visitors);

    // Calculate total only if subscribed
    const total = isSubscribed ? data.reduce((sum, item) => sum + (item.visitors || 0), 0) : 0;

    return { activeData: data, totalVisitors: total };
    // Depend on the original data source and tab, plus subscription status for total
  }, [currentDataSource, activeTab, isSubscribed]);

  if (isLoading) {
    return <LocationsSkeleton />;
  }

  // Determine max visitors for bar calculation (only if subscribed)
  const maxVisitors = isSubscribed && activeData.length > 0 ? activeData[0].visitors : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Locations</h2>
        {/* Tabs */}
        <div className="flex space-x-1 border border-gray-200 rounded p-0.5 text-sm">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-0.5 rounded ${activeTab === tab ? 'bg-gray-100 text-gray-800 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {capitalizeFirstLetter(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      {hasActualData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2 pl-2 pr-4 font-medium text-left" style={{ width: '60%' }}>
                  {capitalizeFirstLetter(activeTab)}
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
                const percentage =
                  isSubscribed && totalVisitors > 0
                    ? Math.round((item.visitors / totalVisitors) * 100)
                    : 0;
                // Use percentage for bar width, but only if subscribed
                const barPercentage = isSubscribed ? percentage : 0;
                const barStyle = isSubscribed
                  ? {
                      background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${barPercentage}%, transparent ${barPercentage}%)`,
                    }
                  : {}; // No bar style if not subscribed

                return (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 pl-2 pr-4 font-medium flex items-center" style={barStyle}>
                      {' '}
                      {/* Apply conditional bar style */}
                      <span
                        className={`inline-block mr-2 w-5 min-w-[1.25rem] h-4 text-center ${activeTab === 'countries' && item.country_code ? '' : 'opacity-0'}`}
                      >
                        {' '}
                        {activeTab === 'countries' && item.country_code && (
                          <span className={`fi fi-${item.country_code.toLowerCase()}`} />
                        )}
                      </span>
                      {item.name || 'Unknown'}
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
                      <td className="py-2 pl-4 pr-2 text-right text-gray-600">{percentage}%</td>
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
        <div className="text-center py-8 text-gray-500">No data available for this time period</div>
      )}
    </div>
  );
};

/**
 * Loading skeleton for locations component
 */
const LocationsSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 bg-gray-200 rounded w-24"></div> {/* Title */}
      <div className="flex space-x-1">
        {' '}
        {/* Tabs Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    {/* Table Skeleton */}
    <div className="space-y-2 mt-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center py-1">
          <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  </div>
);

export default LocationsComponent;
