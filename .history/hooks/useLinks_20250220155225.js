import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * Hook to fetch links with Iframely data for a user
 * @param {string} userId - The ID of the user whose links to fetch
 * @returns {Object} Query result containing links, loading state, and error state
 */
const useLinks = (userId) => {
  const fetchLinks = async () => {
    try {
      const response = await axios.get(`/api/links?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching links:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch links'
      );
    }
  };

  return useQuery({
    queryKey: ['links', userId],
    queryFn: fetchLinks,
    enabled: !!userId,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load links'
      );
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });
};

export default useLinks;
