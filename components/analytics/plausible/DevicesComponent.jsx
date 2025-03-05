import React, { useState } from 'react';

/**
 * DevicesComponent for displaying device, browser, and OS breakdown
 * Matches the Plausible design for devices display with tabs
 *
 * @param {Object} props - Component props
 * @param {Object} props.devicesData - Devices data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const DevicesComponent = ({ devicesData, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('browsers');

  // If no data is provided or still loading, show loading state
  if (isLoading || !devicesData) {
    return <DevicesSkeleton />;
  }

  // Available tabs and their corresponding data
  const tabs = [
    { id: 'browsers', label: 'Browsers' },
    { id: 'operating_systems', label: 'Operating Systems' },
    { id: 'screen_sizes', label: 'Screen Sizes' },
  ];

  // Get the data for the active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'browsers':
        return devicesData.browsers || [];
      case 'operating_systems':
        return devicesData.operating_systems || [];
      case 'screen_sizes':
        return devicesData.screen_sizes || [];
      default:
        return [];
    }
  };

  const activeData = getActiveData();

  // Helper to get device icon based on name
  const getDeviceIcon = (name, type) => {
    if (!name) return '🔍';
    name = name.toLowerCase();

    if (type === 'browsers') {
      if (name.includes('chrome')) return '🌐';
      if (name.includes('firefox')) return '🦊';
      if (name.includes('safari')) return '🧭';
      if (name.includes('edge')) return '🪟';
      if (name.includes('opera')) return '🔴';
      return '🌐';
    }

    if (type === 'operating_systems') {
      if (name.includes('windows')) return '🪟';
      if (name.includes('mac')) return '🍎';
      if (name.includes('ios')) return '📱';
      if (name.includes('android')) return '🤖';
      if (name.includes('linux')) return '🐧';
      return '💻';
    }

    if (type === 'screen_sizes') {
      if (name.includes('mobile')) return '📱';
      if (name.includes('tablet')) return '📋';
      if (name.includes('laptop')) return '💻';
      if (name.includes('desktop')) return '🖥️';
      return '📊';
    }

    return '🔍';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Devices</h2>

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
                  {activeTab === 'browsers'
                    ? 'Browser'
                    : activeTab === 'operating_systems'
                      ? 'OS'
                      : 'Screen Size'}
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
                    <span className="mr-2" aria-hidden="true">
                      {getDeviceIcon(item.name, activeTab)}
                    </span>
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
 * Loading skeleton for devices component
 */
const DevicesSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="flex border-b mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded w-32 mr-2"></div>
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

export default DevicesComponent;
