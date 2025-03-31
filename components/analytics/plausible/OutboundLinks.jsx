import React from 'react';

/**
 * OutboundLinks component for displaying outbound link click data
 * Matches the Plausible design for outbound links display
 *
 * @param {Object} props - Component props
 * @param {Object} props.outboundLinksData - Outbound links data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 */
const OutboundLinks = ({ outboundLinksData, isLoading = false }) => {
  // If no data is provided or still loading, show loading state
  if (isLoading || !outboundLinksData) {
    return <OutboundLinksSkeleton />;
  }

  const links = outboundLinksData.outboundLinks || [];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Outbound Links</h2>

      {/* Data table */}
      {links.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2">Link</th>
                <th className="pb-2 text-right">Visitors</th>
                <th className="pb-2 text-right">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2 font-medium truncate max-w-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      title={link.url}
                    >
                      {link.title || formatUrl(link.url)}
                    </a>
                    {link.title && (
                      <div className="text-xs text-gray-500 truncate">{formatUrl(link.url)}</div>
                    )}
                  </td>
                  <td className="py-2 text-right">{link.visitors}</td>
                  <td className="py-2 text-right">{link.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No links have been clicked yet in this period. Once links are clicked, the data will be
          displayed here.
        </div>
      )}
    </div>
  );
};

/**
 * Format URL for display by truncating if too long
 * @param {string} url - The URL to format
 * @returns {string} Formatted URL
 */
const formatUrl = url => {
  try {
    // Remove protocol
    let formatted = url.replace(/^https?:\/\//, '');

    // Truncate if too long
    if (formatted.length > 50) {
      formatted = formatted.substring(0, 47) + '...';
    }

    return formatted;
  } catch (e) {
    return url;
  }
};

/**
 * Loading skeleton for outbound links component
 */
const OutboundLinksSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
        <div className="h-4 bg-gray-200 rounded w-64"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
    ))}
  </div>
);

export default OutboundLinks;
