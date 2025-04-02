import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * Hook to fetch links with Iframely data for a user
 * @param {string} userId - The ID of the user whose links to fetch
 * @returns {Object} Query result containing links, loading state, and error state
 */
const useLinks = userId => {
  const fetchLinks = async () => {
    // Guard clause for invalid userId
    if (!userId) {
      return [];
    }

    try {
      const response = await axios.get(`/api/links?userId=${userId}`);
      // Ensure we always return an array even if the response is invalid
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      // More robust error handling
      console.error(`Error fetching links for user ${userId}:`, error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch links');
    }
  };

  return useQuery({
    queryKey: ['links', userId],
    queryFn: fetchLinks,
    // Only enable the query if userId is a valid string or number
    enabled: !!userId && (typeof userId === 'string' || typeof userId === 'number'),
    onError: error => {
      // Prevent showing multiple errors with the same message
      if (error.message !== 'Failed to fetch links') {
        toast.error(error instanceof Error ? error.message : 'Failed to load links');
      }
    },
    staleTime: 3000, // Consider data fresh for just 3 seconds to ensure frequent updates
    cacheTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    refetchOnMount: true, // Only refetch on mount, not on every component re-render
    keepPreviousData: true, // Keep displaying the previous data while fetching new data
    suspense: false, // Don't use React Suspense to avoid flash of loading state
    // Return empty array instead of undefined when there's no data
    placeholderData: [],
  });
};

export default useLinks;
