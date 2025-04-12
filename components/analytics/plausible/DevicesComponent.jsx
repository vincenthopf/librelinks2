import React from 'react';

/**
 * DevicesComponent for displaying device, browser, and OS breakdown
 * Matches the Plausible design for devices display
 *
 * @param {Object} props - Component props
 * @param {Object} props.devicesData - Devices data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const DevicesComponent = ({ devicesData, isLoading = false }) => {
  // Active tab is now fixed to browsers
  const activeTab = 'browsers';

  // If no data is provided or still loading, show loading state
  if (isLoading || !devicesData) {
    return <DevicesSkeleton />;
  }

  // Get the browsers data directly
  const activeData = devicesData.browsers || [];

  // Helper to get device icon based on name
  const getDeviceIcon = name => {
    if (!name) return '🔍';
    name = name.toLowerCase();

    if (name.includes('chrome')) return '🌐';
    if (name.includes('firefox')) return '🦊';
    if (name.includes('safari')) return '🧭';
    if (name.includes('edge')) return '🪟';
    if (name.includes('opera')) return '🔴';
    return '🌐';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Devices</h2>

      {/* Removed tabs section */}

      {/* Data table */}
      {activeData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2">BROWSER</th>
                <th className="pb-2 text-right">VISITORS</th>
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
                      {getDeviceIcon(item.name)}
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
    {/* Removed tabs skeleton */}
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
