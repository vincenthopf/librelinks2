import React, { useState } from 'react';

/**
 * PagesComponent for displaying top pages, entry pages, and exit pages
 * Matches the Plausible design for pages display with tabs
 *
 * @param {Object} props - Component props
 * @param {Object} props.pagesData - Pages data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const PagesComponent = ({ pagesData, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('top_pages');

  // If no data is provided or still loading, show loading state
  if (isLoading || !pagesData) {
    return <PagesSkeleton />;
  }

  // Available tabs and their corresponding data
  const tabs = [
    { id: 'top_pages', label: 'Top Pages' },
    { id: 'entry_pages', label: 'Entry Pages' },
    { id: 'exit_pages', label: 'Exit Pages' },
  ];

  // Get the data for the active tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'top_pages':
        return pagesData.top_pages || [];
      case 'entry_pages':
        return pagesData.entry_pages || [];
      case 'exit_pages':
        return pagesData.exit_pages || [];
      default:
        return [];
    }
  };

  // Get the appropriate value field based on the active tab
  const getValueField = () => {
    switch (activeTab) {
      case 'top_pages':
        return 'visitors';
      case 'entry_pages':
        return 'entries';
      case 'exit_pages':
        return 'exits';
      default:
        return 'visitors';
    }
  };

  const activeData = getActiveData();
  const valueField = getValueField();

  // Format URL to show only path
  const formatPagePath = url => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || url;
    } catch (e) {
      // If URL parsing fails, just return the original
      return url;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Pages</h2>

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
                <th className="pb-2">Page</th>
                <th className="pb-2 text-right">
                  {activeTab === 'top_pages'
                    ? 'Visitors'
                    : activeTab === 'entry_pages'
                      ? 'Entries'
                      : 'Exits'}
                </th>
                <th className="pb-2 w-1/3">
                  <div className="w-full h-4"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {activeData.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2 font-medium truncate max-w-xs">
                    {formatPagePath(item.page || '')}
                  </td>
                  <td className="py-2 text-right">{item[valueField] || 0}</td>
                  <td className="py-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${(item[valueField] / (activeData[0]?.[valueField] || 1)) * 100}%`,
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
 * Loading skeleton for pages component
 */
const PagesSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    <div className="flex border-b mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 rounded w-20 mr-2"></div>
      ))}
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
        <div className="h-4 bg-gray-200 rounded w-40"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    ))}
  </div>
);

export default PagesComponent;
