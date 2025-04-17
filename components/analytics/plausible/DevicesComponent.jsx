import React, { useState, useMemo } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
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
 * @param {boolean} props.isSubscribed - Whether the user is subscribed
 */
const DevicesComponent = ({ devicesData, isLoading = false, isSubscribed }) => {
  // Re-introduce tabs
  const [activeTab, setActiveTab] = useState('browsers'); // Default to browsers
  const tabs = ['browsers', 'os', 'size'];

  // Helper to capitalize
  const capitalizeFirstLetter = string => {
    if (string === 'os') return 'OS'; // Special case for OS
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Determine which data source to use based on tab
  const getDataSource = () => {
    switch (activeTab) {
      case 'os':
        return devicesData?.operating_systems || [];
      case 'size':
        return devicesData?.screen_sizes || [];
      case 'browsers':
      default:
        return devicesData?.browsers || [];
    }
  };

  const currentDataSource = getDataSource();
  const hasActualData = currentDataSource.length > 0;

  // Process data for display (sorting, calculating total - only if subscribed)
  const { activeData, totalVisitors } = useMemo(() => {
    const data = [...currentDataSource];
    data.sort((a, b) => b.visitors - a.visitors);
    const total = isSubscribed ? data.reduce((sum, item) => sum + (item.visitors || 0), 0) : 0;
    return { activeData: data, totalVisitors: total };
    // Depend on the original data source and tab, plus subscription status for total
  }, [currentDataSource, activeTab, isSubscribed]);

  if (isLoading) {
    // Keep isLoading check
    return <DevicesSkeleton />;
  }

  // Determine max visitors for bar calculation (only if subscribed)
  const maxVisitors = isSubscribed && activeData.length > 0 ? activeData[0].visitors : 0;

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
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 relative">
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
      {/* Check hasActualData first */}
      {hasActualData ? (
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
                  isSubscribed && totalVisitors > 0
                    ? Math.round((item.visitors / totalVisitors) * 100)
                    : 0;
                // Use a light green background gradient for the bar, only if subscribed
                const barPercentage = isSubscribed ? percentage : 0;
                const barStyle = isSubscribed
                  ? {
                      background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${barPercentage}%, transparent ${barPercentage}%)`,
                    }
                  : {}; // No bar style if not subscribed

                return (
                  <tr key={index} className="border-b last:border-0">
                    {/* Standardized Cells */}
                    <td className="py-2 pl-2 pr-4 font-medium flex items-center" style={barStyle}>
                      {' '}
                      {/* Apply conditional bar style */}
                      {/* Icon and Name always visible */}
                      <span
                        className="inline-block mr-2 w-5 min-w-[1.25rem] h-4 text-center text-gray-500"
                        aria-hidden="true"
                      >
                        {getDeviceIcon(item.name)}
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

      {/* Overlay REMOVED */}
      {/* {!isSubscribed && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
           <Lock className="h-10 w-10 text-gray-400 mb-3" />
           <p className="text-gray-600 font-medium mb-4 text-center px-4">Upgrade to Premium to view Device data</p>
           <Link href="/admin/subscription" legacyBehavior>
             <a className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-sm">
               View Plans
             </a>
           </Link>
        </div>
      )} */}
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
