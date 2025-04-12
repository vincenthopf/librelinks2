import React, { useState, useMemo } from 'react';
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaMobileAlt,
  FaTabletAlt,
  FaDesktop,
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaOpera,
  FaQuestionCircle,
} from 'react-icons/fa'; // Import icons from react-icons

/**
 * DevicesComponent for displaying device, browser, and OS breakdown
 * Matches the Plausible design for devices display
 *
 * @param {Object} props - Component props
 * @param {Object} props.devicesData - Devices data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const DevicesComponent = ({ devicesData, isLoading = false }) => {
  // Re-introduce tabs
  const [activeTab, setActiveTab] = useState('browsers'); // Default to browsers
  const tabs = ['browsers', 'os', 'size'];

  // Helper to capitalize
  const capitalizeFirstLetter = string => {
    if (string === 'os') return 'OS'; // Special case for OS
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Get data based on active tab and calculate total visitors for percentage
  const { activeData, totalVisitors } = useMemo(() => {
    if (!devicesData) return { activeData: [], totalVisitors: 0 };
    let data = [];
    switch (activeTab) {
      case 'os':
        data = devicesData.operating_systems || [];
        break;
      case 'size':
        data = devicesData.screen_sizes || [];
        break;
      case 'browsers':
      default:
        data = devicesData.browsers || [];
        break;
    }
    // Ensure data is sorted by visitors descending
    data.sort((a, b) => b.visitors - a.visitors);
    const total = data.reduce((sum, item) => sum + (item.visitors || 0), 0);
    return { activeData: data, totalVisitors: total };
  }, [devicesData, activeTab]);

  if (isLoading) {
    // Keep isLoading check
    return <DevicesSkeleton />;
  }

  // Device Icon helper using react-icons
  const getDeviceIcon = name => {
    if (!name) return <FaQuestionCircle title="Unknown" />; // Default icon for unknown
    const lowerName = name.toLowerCase();

    // OS Icons
    if (lowerName.includes('windows')) return <FaWindows title="Windows" />;
    if (lowerName.includes('macos') || lowerName.includes('mac os'))
      return <FaApple title="macOS" />;
    if (lowerName.includes('ios')) return <FaMobileAlt title="iOS" />; // Often implies iPhone
    if (lowerName.includes('android')) return <FaAndroid title="Android" />;
    if (lowerName.includes('linux')) return <FaLinux title="Linux" />;

    // Browser Icons
    if (lowerName.includes('chrome')) return <FaChrome title="Chrome" />;
    if (lowerName.includes('firefox')) return <FaFirefox title="Firefox" />;
    if (lowerName.includes('safari')) return <FaSafari title="Safari" />;
    if (lowerName.includes('edge')) return <FaEdge title="Edge" />;
    if (lowerName.includes('opera')) return <FaOpera title="Opera" />;

    // Device Type Icons (General Fallback)
    if (lowerName.includes('mobile')) return <FaMobileAlt title="Mobile" />;
    if (lowerName.includes('tablet')) return <FaTabletAlt title="Tablet" />;
    if (lowerName.includes('desktop')) return <FaDesktop title="Desktop" />; // Could be any desktop OS

    // Screen size might not map directly, handle if necessary or provide default
    // Example: if (activeTab === 'size' && lowerName.includes('large')) return <FaDesktop />;

    return <FaQuestionCircle title={name} />; // Default icon if no match
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Devices</h2>
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
                // Use a light green background gradient for the bar
                const barStyle = {
                  background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${percentage}%, transparent ${percentage}%)`, // Light green with 30% opacity
                };

                return (
                  <tr key={index} className="border-b last:border-0">
                    {/* Standardized Cells */}
                    <td className="py-2 pl-2 pr-4 font-medium flex items-center" style={barStyle}>
                      {/* Consistent icon spacing - using w-5 and min-w-[1.25rem] */}
                      <span
                        className="inline-block mr-2 w-5 min-w-[1.25rem] h-4 text-center text-gray-500"
                        aria-hidden="true"
                      >
                        {getDeviceIcon(item.name)}
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
 * Loading skeleton for devices component
 */
const DevicesSkeleton = () => (
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

export default DevicesComponent;
