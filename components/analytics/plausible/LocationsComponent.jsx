import React, { useState, useMemo } from 'react';

/**
 * LocationsComponent for displaying geographic data
 * Matches the Plausible design for locations display
 *
 * @param {Object} props - Component props
 * @param {Object} props.locationsData - Locations data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const LocationsComponent = ({ locationsData, isLoading = false }) => {
  // Re-introduce tabs
  const [activeTab, setActiveTab] = useState('countries'); // Default to countries
  const tabs = ['countries', 'regions', 'cities'];

  // Helper to capitalize
  const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

  // Get data based on active tab and calculate total visitors for percentage
  const { activeData, totalVisitors } = useMemo(() => {
    if (!locationsData) return { activeData: [], totalVisitors: 0 };
    let data = [];
    switch (activeTab) {
      case 'regions':
        data = locationsData.regions || [];
        break;
      case 'cities':
        data = locationsData.cities || [];
        break;
      case 'countries':
      default:
        data = locationsData.countries || [];
        break;
    }
    // Ensure data is sorted by visitors descending for correct percentage calculation
    data.sort((a, b) => b.visitors - a.visitors);
    const total = data.reduce((sum, item) => sum + (item.visitors || 0), 0);
    return { activeData: data, totalVisitors: total };
  }, [locationsData, activeTab]);

  if (isLoading) {
    return <LocationsSkeleton />;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
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
      {activeData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                {/* Standardized Headers with explicit widths */}
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
                  totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0;
                const barStyle = {
                  background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${percentage}%, transparent ${percentage}%)`,
                };

                return (
                  <tr key={index} className="border-b last:border-0">
                    {/* Standardized Cells */}
                    <td className="py-2 pl-2 pr-4 font-medium flex items-center" style={barStyle}>
                      {/* Consistent icon/flag spacing - using w-5 and min-w-[1.25rem] */}
                      <span
                        className={`inline-block mr-2 w-5 min-w-[1.25rem] h-4 text-center ${activeTab === 'countries' && item.country_code ? '' : 'opacity-0'}`}
                      >
                        {' '}
                        {/* Use opacity-0 to reserve space even if no flag */}
                        {activeTab === 'countries' && item.country_code && (
                          <span className={`fi fi-${item.country_code.toLowerCase()}`} />
                        )}
                      </span>
                      {item.name || 'Unknown'}
                    </td>
                    <td className="py-2 px-4 text-right font-medium">{item.visitors}</td>
                    <td className="py-2 pl-4 pr-2 text-right text-gray-600">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
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
