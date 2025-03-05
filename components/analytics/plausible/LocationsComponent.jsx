import React, { useState } from 'react';

/**
 * LocationsComponent for displaying geographic data
 * Matches the Plausible design for locations display with tabs
 *
 * @param {Object} props - Component props
 * @param {Object} props.locationsData - Locations data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const LocationsComponent = ({ locationsData, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('countries');

  // If no data is provided or still loading, show loading state
  if (isLoading || !locationsData) {
    return <LocationsSkeleton />;
  }

  // Available tabs and their corresponding data
  const tabs = [
    { id: 'countries', label: 'Countries' },
    { id: 'regions', label: 'Regions' },
    { id: 'cities', label: 'Cities' },
  ];

  // Get the data for the active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'countries':
        return locationsData.countries || [];
      case 'regions':
        return locationsData.regions || [];
      case 'cities':
        return locationsData.cities || [];
      default:
        return [];
    }
  };

  const activeData = getActiveData();

  // Helper to get country flag emoji
  const getCountryFlag = countryCode => {
    if (!countryCode) return '';

    // Convert country code to regional indicator symbols
    const codePoints = [...countryCode.toUpperCase()].map(char => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Locations</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`py-2 px-4 mr-2 focus:outline-none ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data table */}
      {activeData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Location'}
                </th>
                <th className="pb-2 text-right">Visitors</th>
                <th className="pb-2 w-1/3">
                  <div className="w-full h-4"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2 font-medium">
                    {activeTab === 'countries' && item.country_code && (
                      <span className="mr-2" aria-hidden="true">
                        {getCountryFlag(item.country_code)}
                      </span>
                    )}
                    {item.name || 'Unknown'}
                  </td>
                  <td className="py-2 text-right">{item.visitors}</td>
                  <td className="py-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${(item.visitors / activeData[0]?.visitors) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
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
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="flex border-b mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded w-20 mr-2"></div>
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    ))}
  </div>
);

export default LocationsComponent;
