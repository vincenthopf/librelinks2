import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckMark } from '@/components/utils/checkmark';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';
import ErrorBoundary from '@/components/core/error-boundary';
import LoadingSpinner from '@/components/ui/loading-spinner';
import {
  BackgroundImage,
  BackgroundImageGridProps,
  LoadingStateProps,
  isValidBackgroundImage,
  isValidImageUrl,
} from './types';

// Query keys
const QUERY_KEYS = {
  backgroundImages: 'backgroundImages',
  currentUser: 'currentUser',
} as const;

// Cache time configurations
const CACHE_TIME = {
  backgroundImages: 5 * 60 * 1000, // 5 minutes
  currentUser: 2 * 60 * 1000, // 2 minutes
} as const;

// Loading state component
const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <LoadingSpinner size="lg" className="mb-4" />
    <p className="text-gray-600">{message}</p>
  </div>
);

// Separate component for the image grid to wrap in error boundary
const BackgroundImageGrid: React.FC<BackgroundImageGridProps> = ({
  backgroundImages,
  selectedImage,
  isUpdating,
  onImageSelect,
  onRemoveBackground,
}) => {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );

  const handleImageLoad = (imageId: string) => {
    setLoadingImages((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId: string) => {
    setLoadingImages((prev) => ({ ...prev, [imageId]: true }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
      {/* None option */}
      <div
        className={`rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 flex items-center justify-center ${
          !selectedImage ? 'border-blue-500' : 'border-gray-200'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!isUpdating ? onRemoveBackground : undefined}
      >
        <div className="text-center">
          <p className="font-medium">None</p>
          <p className="text-xs text-gray-500">Remove background</p>
        </div>
        {!selectedImage && (
          <span className="absolute top-2 right-2 z-10">
            <CheckMark />
          </span>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Background image options */}
      {backgroundImages.map((image) => (
        <div
          key={image.id}
          className={`rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 ${
            selectedImage === image.imageUrl
              ? 'border-blue-500'
              : 'border-gray-200'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={
            !isUpdating ? () => onImageSelect(image.imageUrl) : undefined
          }
          onMouseEnter={() => handleImageLoadStart(image.id)}
        >
          {loadingImages[image.id] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <LoadingSpinner size="sm" />
            </div>
          )}
          <img
            src={image.imageUrl}
            alt={image.name}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(image.id)}
            onError={(e) => {
              handleImageLoad(image.id);
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder-image.png';
              console.error(`Failed to load image: ${image.imageUrl}`);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
            <p className="text-xs truncate">{image.name}</p>
          </div>
          {selectedImage === image.imageUrl && (
            <span className="absolute top-2 right-2 z-10 text-white">
              <CheckMark />
            </span>
          )}
          {isUpdating && selectedImage === image.imageUrl && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface BaseUser {
  // Add any necessary properties for the base user interface
}

interface User extends BaseUser {
  backgroundImage: string | null;
}

interface MutationContext {
  previousUser: User | undefined;
}

const BackgroundImageSelector: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user data with optimized caching
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useCurrentUser({
    cacheTime: CACHE_TIME.currentUser,
    staleTime: CACHE_TIME.currentUser / 2,
  });

  // Fetch background images with optimized caching and error handling
  const {
    data: backgroundImages,
    isLoading: isImagesLoading,
    error: imagesError,
  } = useQuery<BackgroundImage[]>({
    queryKey: [QUERY_KEYS.backgroundImages],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/background-images');

        // Validate response data
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }

        // Validate each background image
        const validImages = data.filter(isValidBackgroundImage);
        if (validImages.length !== data.length) {
          console.warn('Some background images failed validation');
        }

        return validImages;
      } catch (error) {
        console.error('Error fetching background images:', error);
        throw new Error(
          'Failed to load background images. Please try again later.'
        );
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    cacheTime: CACHE_TIME.backgroundImages,
    staleTime: CACHE_TIME.backgroundImages / 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Initialize and sync selected image with user data
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      try {
        const imageUrl = currentUser.backgroundImage;
        if (imageUrl && isValidImageUrl(imageUrl)) {
          setSelectedImage(imageUrl);
        } else {
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Error syncing background image state:', error);
        toast.error('Failed to sync background image selection');
      }
    }
  }, [currentUser, isUserLoading]);

  const mutateBackground = useMutation<void, Error, string, MutationContext>({
    mutationFn: async (imageUrl: string) => {
      setIsUpdating(true);
      try {
        if (imageUrl !== 'none' && !isValidImageUrl(imageUrl)) {
          throw new Error('Invalid image URL');
        }
        await axios.patch('/api/customize', {
          backgroundImage: imageUrl,
        });
      } catch (error) {
        console.error('Error updating background:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      // Invalidate both queries to ensure fresh data
      queryClient.invalidateQueries([QUERY_KEYS.currentUser]);
      queryClient.invalidateQueries([QUERY_KEYS.backgroundImages]);
      signalIframe();
    },
    onError: (error) => {
      console.error('Error updating background:', error);
      toast.error('Failed to update background image. Please try again.');
      setSelectedImage(currentUser?.backgroundImage || null);
    },
    // Optimistic update
    onMutate: async (newImageUrl) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries([QUERY_KEYS.currentUser]);

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>([
        QUERY_KEYS.currentUser,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<User>([QUERY_KEYS.currentUser], (old) => ({
        ...old!,
        backgroundImage: newImageUrl === 'none' ? null : newImageUrl,
      }));

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onSettled: (data, error, variables, context) => {
      if (error && context) {
        queryClient.setQueryData(
          [QUERY_KEYS.currentUser],
          context.previousUser
        );
      }
      // Always refetch after error or success to make sure our optimistic update is correct
      queryClient.invalidateQueries([QUERY_KEYS.currentUser]);
    },
  });

  const handleImageSelect = async (imageUrl: string) => {
    if (isUpdating) return;

    await toast.promise(mutateBackground.mutateAsync(imageUrl), {
      loading: 'Updating background image...',
      success: 'Background image updated successfully',
      error: 'Failed to update background image',
    });
    setSelectedImage(imageUrl);
  };

  const handleRemoveBackground = async () => {
    if (isUpdating) return;

    await toast.promise(mutateBackground.mutateAsync('none'), {
      loading: 'Removing background image...',
      success: 'Background image removed successfully',
      error: 'Failed to remove background image',
    });
    setSelectedImage(null);
  };

  // Error states
  if (userError) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            Failed to load user data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (imagesError) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {imagesError instanceof Error
              ? imagesError.message
              : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isUserLoading || isImagesLoading) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <LoadingState
          message={
            isUserLoading
              ? 'Loading user data...'
              : 'Loading background images...'
          }
        />
      </div>
    );
  }

  // Error state for missing background images
  if (!backgroundImages || backgroundImages.length === 0) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <div className="my-4 p-4 text-center">
          <p>No background images available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto my-6">
      <h3 className="text-xl font-semibold">Background Images</h3>
      <p className="text-gray-600 mt-2 mb-4">
        Select a background image for your profile. The background image will be
        displayed behind your theme.
      </p>

      <ErrorBoundary
        fallbackTitle="Failed to load background image selector"
        fallbackMessage="There was an error loading the background image selector. Please try refreshing the page."
      >
        <BackgroundImageGrid
          backgroundImages={backgroundImages}
          selectedImage={selectedImage}
          isUpdating={isUpdating}
          onImageSelect={handleImageSelect}
          onRemoveBackground={handleRemoveBackground}
        />
      </ErrorBoundary>
    </div>
  );
};

export default BackgroundImageSelector;
