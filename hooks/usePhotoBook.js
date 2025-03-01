import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useCurrentUser from './useCurrentUser';

const usePhotoBook = () => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  // Fetch all photo book images
  const {
    data: photos,
    isLoading: isLoadingPhotos,
    error: photosError,
  } = useQuery(
    ['photobook', currentUser?.id],
    async () => {
      if (!currentUser?.id) return [];

      try {
        const { data } = await axios.get('/api/photobook/photos');
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        return [];
      }
    },
    {
      enabled: !!currentUser?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Upload a new photo
  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, description }) => {
      const { data } = await axios.post('/api/photobook/upload', {
        file,
        title,
        description,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['photobook', currentUser?.id]);
      toast.success('Photo uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    },
  });

  // Update photo metadata
  const updateMutation = useMutation({
    mutationFn: async ({ id, title, description, order }) => {
      const { data } = await axios.patch(`/api/photobook/photos/${id}`, {
        title,
        description,
        order,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['photobook', currentUser?.id]);
      toast.success('Photo updated successfully');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update photo');
    },
  });

  // Delete a photo
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`/api/photobook/photos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['photobook', currentUser?.id]);
      toast.success('Photo deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete photo');
    },
  });

  // Update layout style
  const updateLayoutMutation = useMutation({
    mutationFn: async (layout) => {
      const { data } = await axios.patch('/api/users/update', {
        photoBookLayout: layout,
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate both users and handle queries to ensure all components update
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['users', currentUser?.handle]);
      // Force a refetch of current user data
      queryClient.refetchQueries(['users']);
      toast.success('Layout updated successfully');
    },
    onError: (error) => {
      console.error('Layout update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update layout');
    },
  });

  // Helper function to read file as data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    photos: Array.isArray(photos) ? photos : [],
    isLoadingPhotos,
    photosError,
    uploadPhoto: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isLoading,
    updatePhoto: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading,
    deletePhoto: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading,
    updateLayout: updateLayoutMutation.mutateAsync,
    isUpdatingLayout: updateLayoutMutation.isLoading,
    readFileAsDataURL,
    photoBookLayout: currentUser?.photoBookLayout || 'grid',
  };
};

export default usePhotoBook;
