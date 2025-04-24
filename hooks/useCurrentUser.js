import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to get current user data
 * Updated to properly handle the viewMode field (replacing stackView)
 */
const useCurrentUser = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/current');
      const userData = response.data;

      // Handle backwards compatibility with stackView
      // This ensures existing code using stackView will still work
      if (userData && userData.viewMode !== undefined) {
        // If viewMode exists, use it to derive stackView boolean
        userData.stackView = userData.viewMode === 'stacked';
      } else if (userData && userData.stackView !== undefined) {
        // If only stackView exists (old data), derive viewMode
        userData.viewMode = userData.stackView ? 'stacked' : 'normal';
      }

      return userData;
    },
    onError: err => {
      console.error(err.message);
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
};

export default useCurrentUser;
