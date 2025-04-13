import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

interface BaseUser {
  id: string;
  name: string | null;
  email: string | null;
  handle: string | null;
  image: string | null;
  backgroundImage: string | null;
  customBackgroundImages?: string[];
}

function useCurrentUser<T extends BaseUser = BaseUser>(
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await axios.get('/api/user');
      return data;
    },
    ...options,
  });
}

export default useCurrentUser;
