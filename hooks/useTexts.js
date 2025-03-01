import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useTexts(userId) {
  const fetchTexts = async () => {
    try {
      const { data } = await axios.get(`/api/texts?userId=${userId}`);
      return data;
    } catch (error) {
      console.error('Error fetching texts:', error);
      return [];
    }
  };

  const { data, isLoading, error } = useQuery(['texts', userId], fetchTexts, {
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    data,
    isLoading,
    error,
  };
}
