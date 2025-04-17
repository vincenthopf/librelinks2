import React from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';

/**
 * OutboundLinks component for displaying outbound link click data
 * Matches the Plausible design for outbound links display
 *
 * @param {Object} props - Component props
 * @param {Object} props.outboundLinksData - Outbound links data from the API
 * @param {boolean} props.isLoading - Whether the data is still loading
 * @param {boolean} props.isSubscribed - Whether the user is subscribed
 */
const OutboundLinks = ({ outboundLinksData, isLoading = false, isSubscribed }) => {
  // If no data is provided or still loading, show loading state
  if (isLoading || !outboundLinksData) {
    return <OutboundLinksSkeleton />;
  }

  // Check if the original data exists
  const links = outboundLinksData.outboundLinks || [];
  const hasActualData = links.length > 0;

  // Calculate only if subscribed and data exists
  const sortedLinks = hasActualData ? [...links].sort((a, b) => b.events - a.events) : [];
  const maxClicks = isSubscribed && sortedLinks.length > 0 ? sortedLinks[0].events : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8 relative">
      <h2 className="text-lg font-medium mb-4">Outbound Links</h2>

      {/* Data table */}
      {hasActualData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b">
                <th className="pb-2 pr-1 sm:pr-2">Link</th>
                <th className="pb-2 px-1 sm:px-2 text-right whitespace-nowrap">
                  <span className="hidden sm:inline">Unique Visitors</span>
                  <span className="sm:hidden">Visitors</span>
                </th>
                <th className="pb-2 pl-1 sm:pl-2 text-right">
                  <span>Clicks</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.map((link, index) => {
                const percentage =
                  isSubscribed && maxClicks > 0 ? Math.round((link.events / maxClicks) * 100) : 0;
                const barStyle = isSubscribed
                  ? {
                      background: `linear-gradient(to right, rgba(134, 239, 172, 0.3) ${percentage}%, transparent ${percentage}%)`,
                    }
                  : {}; // No bar style if not subscribed

                return (
                  <tr key={index} className="border-b last:border-0">
                    <td
                      className="py-2 pr-1 sm:pr-2 font-medium truncate max-w-[150px] sm:max-w-xs"
                      style={barStyle} // Apply conditional bar style
                    >
                      {/* Link remains clickable, title always visible */}
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
                    {/* Conditionally render blurred data */}
                    {isSubscribed ? (
                      <td className="py-2 px-1 sm:px-2 text-right">{link.visitors}</td>
                    ) : (
                      <td className="py-2 px-1 sm:px-2 text-right text-gray-400 select-none opacity-75">
                        --
                      </td>
                    )}
                    {isSubscribed ? (
                      <td className="py-2 pl-1 sm:pl-2 text-right">{link.events}</td>
                    ) : (
                      <td className="py-2 pl-1 sm:pl-2 text-right text-gray-400 select-none opacity-75">
                        --
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
        <div className="text-center py-8 text-gray-500">
          No links have been clicked yet in this period. Once links are clicked, the data will be
          displayed here.
        </div>
      )}

      {/* Overlay REMOVED */}
      {/* {!isSubscribed && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
          <Lock className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium mb-4 text-center px-4">Upgrade to Premium to view Outbound Links</p>
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
