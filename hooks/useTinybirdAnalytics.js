import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Hook to fetch analytics data from Tinybird
 * @param {string} handle - The user handle
 * @param {string} timeRange - Time range for analytics (e.g., 'last_hour', 'last_24_hours', 'last_7_days', 'last_30_days')
 * @param {string} type - Type of analytics ('pageviews', 'devices', 'locations', 'links')
 * @returns {Object} Query result with analytics data
 */
const useTinybirdAnalytics = (handle, timeRange = 'last_24_hours', type = 'pageviews') => {
  return useQuery({
    queryKey: ['tinybird-analytics', handle, timeRange, type],
    queryFn: async () => {
      // Different endpoints based on the type of analytics
      let endpoint;
      switch (type) {
        case 'pageviews':
          endpoint = `/api/tinybird/pageviews?handle=${handle}&timeRange=${timeRange}`;
          break;
        case 'devices':
          endpoint = `/api/tinybird/devices?handle=${handle}`;
          break;
        case 'locations':
          endpoint = `/api/tinybird/locations?handle=${handle}`;
          break;
        case 'links':
          endpoint = `/api/tinybird/links?handle=${handle}`;
          break;
        default:
          endpoint = `/api/tinybird/pageviews?handle=${handle}&timeRange=${timeRange}`;
      }

      const response = await axios.get(endpoint);

      // Log the response data for debugging
      console.log(`Analytics data for ${type}:`, response.data);

      return response.data;
    },
    enabled: !!handle,
    onError: error => {
      console.error(`Error fetching Tinybird ${type} analytics:`, error);
      toast.error('Failed to load analytics data');
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export default useTinybirdAnalytics;
