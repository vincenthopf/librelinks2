import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

/**
 * Custom hook for fetching user-specific Plausible analytics data
 *
 * @param {string} type - Type of analytics data to fetch (dashboard, sources, pages, locations, devices)
 * @param {string} timeRange - Time range for analytics data (day, 7d, 30d, month, 6mo, 12mo)
 * @param {Object} options - Additional options for specific analytics types
 * @returns {Object} Query result with analytics data
 */
const usePlausibleUserAnalytics = (type = 'dashboard', timeRange = 'day', options = {}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Normalize time range to ensure consistency across all API endpoints
  const normalizedTimeRange = normalizeTimeRange(timeRange);

  return useQuery({
    queryKey: ['plausible-analytics', userId, type, normalizedTimeRange, options],
    queryFn: async () => {
      // Construct the API endpoint based on the type
      let endpoint;
      const params = { timeRange: normalizedTimeRange };

      switch (type) {
        case 'dashboard':
          endpoint = '/api/super-analytics/dashboard';
          break;
        case 'sources':
          endpoint = '/api/super-analytics/sources';
          // Include source property if specified
          if (options.property) {
            params.property = options.property;
          }
          break;
        case 'pages':
          endpoint = '/api/super-analytics/pages';
          // Include page type if specified (pages, entry_pages, exit_pages)
          if (options.pageType) {
            params.type = options.pageType;
          }
          break;
        case 'locations':
          endpoint = '/api/super-analytics/locations';
          // Include location type if specified (countries, regions, cities)
          if (options.locationType) {
            params.type = options.locationType;
          }
          break;
        case 'devices':
          endpoint = '/api/super-analytics/devices';
          // Include device type if specified (browser, os, size)
          if (options.deviceType) {
            params.type = options.deviceType;
          }
          break;
        case 'outbound-links':
          endpoint = '/api/super-analytics/outbound-links';
          break;
        default:
          endpoint = '/api/super-analytics/dashboard';
      }

      // Construct query string from params
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const url = `${endpoint}?${queryString}`;

      // Make the API request
      const response = await axios.get(url);

      // Log the response for debugging
      console.log(`Plausible ${type} data:`, response.data);

      return response.data;
    },
    enabled: !!userId, // Only fetch if user is authenticated
    onError: error => {
      console.error(`Error fetching Plausible ${type} analytics:`, error);
      toast.error(`Failed to load ${type} analytics data`);
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    ...options.queryOptions, // Allow overriding query options
  });
};

/**
 * Normalize time range to ensure consistency across all API endpoints
 * @param {string} timeRange - Time range from UI
 * @returns {string} Normalized time range for API
 */
function normalizeTimeRange(timeRange) {
  // Map UI time range values to API expected values
  switch (timeRange) {
    case 'day':
    case '7d':
    case '30d':
    case 'month':
    case '6mo':
    case '12mo':
      return timeRange;
    case 'week':
      return '7d';
    case 'month':
      return 'month';
    case '6month':
      return '6mo';
    case '12month':
      return '12mo';
    default:
      return 'day';
  }
}

export default usePlausibleUserAnalytics;
