import React, { useState } from 'react';

/**
 * TopSources component for displaying traffic source breakdowns
 * Matches the Plausible design for sources display with tabs
 *
 * @param {Object} props - Component props
 * @param {Object} props.sourcesData - Sources data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const TopSources = ({ sourcesData, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('sources');

  // If no data is provided or still loading, show loading state
  if (isLoading || !sourcesData) {
    return <SourcesSkeleton />;
  }

  // Available tabs and their corresponding data
  const tabs = [
    { id: 'sources', label: 'Source' },
    { id: 'utm_medium', label: 'Medium' },
    { id: 'utm_source', label: 'Source' },
    { id: 'utm_campaign', label: 'Campaign' },
  ];

  // Get the data for the active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'sources':
        return sourcesData.sources || [];
      case 'utm_medium':
        return sourcesData.utm_medium || [];
      case 'utm_source':
        return sourcesData.utm_source || [];
      case 'utm_campaign':
        return sourcesData.utm_campaign || [];
      default:
        return [];
    }
  };

  const activeData = getActiveData();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Top Sources</h2>

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
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Source'}
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
                  <td className="py-2 font-medium">{item.name || 'Unknown'}</td>
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
 * Loading skeleton for sources component
 */
const SourcesSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="flex border-b mb-4">
      {[...Array(4)].map((_, i) => (
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

export default TopSources;
