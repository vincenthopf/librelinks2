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
import UserBackgroundImageUploader from './user-background-image-uploader.jsx';
import { cn } from '@/lib/utils';

// Define prop type for UserBackgroundImageUploader
interface UserBackgroundImageUploaderProps {
  onImageUploaded?: (imageUrl: string) => Promise<void>;
}

// Declare the component with its props
declare module './user-background-image-uploader.jsx' {
  export default function UserBackgroundImageUploader(
    props: UserBackgroundImageUploaderProps
  ): React.ReactElement;
}

// Query keys
const QUERY_KEYS = {
  backgroundImages: 'backgroundImages',
  currentUser: 'currentUser',
  userBackgroundImages: 'userBackgroundImages',
} as const;

// Cache time configurations
const CACHE_TIME = {
  backgroundImages: 5 * 60 * 1000, // 5 minutes
  currentUser: 2 * 60 * 1000, // 2 minutes
  userBackgroundImages: 1 * 60 * 1000, // Cache user images for 1 minute
} as const;

// Loading state component
const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <LoadingSpinner size="lg" className="mb-4" />
    <p className="text-gray-600">{message}</p>
  </div>
);

// Extend User interface to include customBackgroundImages
interface User extends BaseUser {
  backgroundImage: string | null;
}

// Props for the new User Background Image Grid
interface UserBackgroundImageGridProps {
  customImages: string[];
  selectedImage: string | null;
  isUpdating: boolean;
  onImageSelect: (imageUrl: string) => Promise<void>;
  onRemoveBackground: () => Promise<void>;
  // Optional: Add delete functionality later
  // onDelete: (imageUrl: string) => Promise<void>;
}

// Grid component for displaying User's Custom Background Images
const UserBackgroundImageGrid: React.FC<UserBackgroundImageGridProps> = ({
  customImages,
  selectedImage,
  isUpdating,
  onImageSelect,
  onRemoveBackground,
}) => {
  // No need for this check if we always show the "None" option
  // if (!customImages || customImages.length === 0) {
  //   return (
  //     <p className="text-sm text-gray-500 my-4">
  //       You haven&apos;t uploaded any custom backgrounds yet.
  //     </p>
  //   );
  // }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
      {/* None option */}
      <div
        className={cn(
          'rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 flex items-center justify-center',
          !selectedImage ? 'border-blue-500' : 'border-gray-200',
          isUpdating ? 'opacity-50 cursor-not-allowed' : ''
        )}
        onClick={!isUpdating ? onRemoveBackground : undefined}
      >
        <div className="text-center">
          <p className="font-medium">None</p>
          <p className="text-xs text-gray-500">Remove background</p>
        </div>
        {!selectedImage && (
          <span className="absolute top-2 right-2 z-10">
            <CheckMark size={16} />
          </span>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Display custom uploaded images */}
      {customImages.map((imageUrl, index) => (
        <div
          key={imageUrl}
          className={cn(
            'rounded-lg overflow-hidden cursor-pointer relative border-2 h-32',
            selectedImage === imageUrl
              ? 'border-blue-500'
              : 'border-gray-200 hover:border-gray-300',
            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
          )}
          onClick={!isUpdating ? () => onImageSelect(imageUrl) : undefined}
        >
          {/* Simple Image display */}
          <img
            src={imageUrl}
            alt={`Custom Background ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy" // Lazy load custom images
          />
          {/* Checkmark if selected */}
          {selectedImage === imageUrl && (
            <span className="absolute top-2 right-2 z-10 text-white bg-black bg-opacity-50 rounded-full p-1">
              <CheckMark size={16} />
            </span>
          )}
          {/* Optional: Add delete button later */}
          {/* {isUpdating && selectedImage === imageUrl && (...)} */}
        </div>
      ))}
    </div>
  );
};

// Separate component for the image grid to wrap in error boundary
const BackgroundImageGrid: React.FC<BackgroundImageGridProps> = ({
  backgroundImages,
  selectedImage,
  isUpdating,
  onImageSelect,
  onRemoveBackground,
}) => {
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Initialize loading state for all images when component mounts or backgroundImages changes
  useEffect(() => {
    const initialLoadingState: Record<string, boolean> = {};
    backgroundImages.forEach(image => {
      initialLoadingState[image.id] = true;
    });
    setLoadingImages(initialLoadingState);
  }, [backgroundImages]);

  const handleImageLoad = (imageId: string) => {
    setLoadingImages(prev => ({ ...prev, [imageId]: false }));
  };

  // We'll keep this function for potential future use but won't call it on hover
  const handleImageLoadStart = (imageId: string) => {
    setLoadingImages(prev => ({ ...prev, [imageId]: true }));
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
            <CheckMark size={16} />
          </span>
        )}
        {isUpdating && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Public Background image options */}
      {backgroundImages.map(image => (
        <div
          key={image.id}
          className={`rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 ${
            selectedImage === image.imageUrl ? 'border-blue-500' : 'border-gray-200'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={!isUpdating ? () => onImageSelect(image.imageUrl) : undefined}
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
            loading="eager"
            decoding="async"
            onLoad={() => handleImageLoad(image.id)}
            onError={e => {
              handleImageLoad(image.id);
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/placeholder-image.png';
              console.error(`Failed to load image: ${image.imageUrl}`);
            }}
          />
          {selectedImage === image.imageUrl && (
            <span className="absolute top-2 right-2 z-10 text-white">
              <CheckMark size={16} />
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

interface MutationContext {
  previousUser: User | undefined;
}

const BackgroundImageSelector: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useCurrentUser({ cacheTime: CACHE_TIME.currentUser });

  const {
    data: publicBackgroundImages,
    isLoading: isPublicImagesLoading,
    error: publicImagesError,
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
        throw new Error('Failed to load background images. Please try again later.');
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    cacheTime: CACHE_TIME.backgroundImages,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: customImages = [],
    isLoading: isCustomImagesLoading,
    error: customImagesError,
  } = useQuery<string[]>({
    queryKey: [QUERY_KEYS.userBackgroundImages],
    queryFn: async () => {
      try {
        const { data } = await axios.get('/api/user/background-images');
        // Basic validation: Ensure it's an array of strings
        if (!Array.isArray(data) || !data.every(item => typeof item === 'string')) {
          console.error('Invalid format received for user background images:', data);
          throw new Error('Invalid response format for user background images');
        }
        return data;
      } catch (error) {
        console.error("Error fetching user's background images:", error);
        // Provide a user-friendly error message
        throw new Error('Failed to load your custom background images. Please try again later.');
      }
    },
    cacheTime: CACHE_TIME.userBackgroundImages,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Initialize and sync local selectedImage state with persisted value
  useEffect(() => {
    console.log('[Effect] Running. Loading:', isUserLoading, 'User:', currentUser);
    // if (currentUser !== undefined) { // Original condition
    if (!isUserLoading && currentUser) {
      // More robust check
      const dbValue = currentUser.backgroundImage || null;
      console.log('[Effect] Setting selectedImage from DB value:', dbValue);
      setSelectedImage(dbValue);
    } else if (!isUserLoading && !currentUser) {
      console.log('[Effect] Loading finished, no user found. Setting selectedImage to null.');
      setSelectedImage(null);
    }
  }, [currentUser, isUserLoading]); // Keep dependencies broad for logging

  const mutateBackground = useMutation<void, Error, string>({
    mutationFn: async (imageUrl: string) => {
      setIsUpdating(true);
      try {
        if (imageUrl !== 'none' && !isValidImageUrl(imageUrl)) {
          throw new Error('Invalid image URL');
        }
        await axios.patch('/api/customize', { backgroundImage: imageUrl });
      } catch (error) {
        console.error('Error updating background:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.currentUser]);
      queryClient.invalidateQueries([QUERY_KEYS.userBackgroundImages]);
      signalIframe();
    },
    onError: error => {
      console.error('Error updating background mutation:', error);
    },
  });

  const handleImageSelect = async (imageUrl: string) => {
    if (isUpdating) return;
    console.log('[Select] Clicked:', imageUrl);
    // 1. Set local state immediately
    console.log('[Select] Setting local state to:', imageUrl);
    setSelectedImage(imageUrl);
    // 2. Call mutation
    try {
      console.log('[Select] Calling mutateAsync with:', imageUrl);
      await toast.promise(mutateBackground.mutateAsync(imageUrl), {
        loading: 'Updating background image...',
        success: 'Background image updated successfully',
        error: 'Failed to update background image',
      });
      console.log('[Select] Mutate async finished successfully for:', imageUrl);
    } catch (error) {
      console.error('[Select] Mutation failed:', error);
      // If mutation fails, useEffect syncing with invalidated currentUser should correct the state
    }
  };

  const handleRemoveBackground = async () => {
    if (isUpdating) return;
    console.log('[Remove] Clicked');
    // 1. Set local state immediately
    console.log('[Remove] Setting local state to: null');
    setSelectedImage(null);
    // 2. Call mutation
    try {
      console.log('[Remove] Calling mutateAsync with: none');
      await toast.promise(mutateBackground.mutateAsync('none'), {
        loading: 'Removing background image...',
        success: 'Background image removed successfully',
        error: 'Failed to remove background image',
      });
      console.log('[Remove] Mutate async finished successfully for: none');
    } catch (error) {
      console.error('[Remove] Mutation failed:', error);
      // If mutation fails, useEffect syncing with invalidated currentUser should correct the state
    }
  };

  const isLoading = isUserLoading || isPublicImagesLoading || isCustomImagesLoading;

  if (userError) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Failed to load user data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (publicImagesError) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <UserBackgroundImageUploader onImageUploaded={handleImageSelect} />
        <h3 className="text-xl font-semibold mt-6">Background Images</h3>
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {publicImagesError instanceof Error
              ? publicImagesError.message
              : 'An error occurred loading public backgrounds'}
          </p>
        </div>
      </div>
    );
  }

  if (customImagesError) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <UserBackgroundImageUploader onImageUploaded={handleImageSelect} />
        <h3 className="text-xl font-semibold mt-6">Your Uploaded Backgrounds</h3>
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">
            {customImagesError instanceof Error
              ? customImagesError.message
              : 'An error occurred loading your custom backgrounds'}
          </p>
        </div>
        {publicBackgroundImages && publicBackgroundImages.length > 0 ? (
          <BackgroundImageGrid
            backgroundImages={publicBackgroundImages}
            selectedImage={selectedImage}
            isUpdating={isUpdating}
            onImageSelect={handleImageSelect}
            onRemoveBackground={handleRemoveBackground}
          />
        ) : (
          <div className="my-4 p-4 text-center">
            <p className="text-gray-500">No public background images available.</p>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <LoadingState
          message={isUserLoading ? 'Loading user data...' : 'Loading background images...'}
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <p className="text-gray-600 mt-2 mb-4">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto my-6">
      <UserBackgroundImageUploader onImageUploaded={handleImageSelect} />

      <h3 className="text-xl font-semibold mt-8">Your Uploaded Backgrounds</h3>
      <ErrorBoundary
        fallbackTitle="Failed to load your backgrounds"
        fallbackMessage="There was an error displaying your uploaded backgrounds. Please try refreshing."
      >
        <UserBackgroundImageGrid
          customImages={customImages}
          selectedImage={selectedImage}
          isUpdating={isUpdating}
          onImageSelect={handleImageSelect}
          onRemoveBackground={handleRemoveBackground}
        />
      </ErrorBoundary>

      <h3 className="text-xl font-semibold mt-8">Select a Background</h3>
      <p className="text-gray-600 mt-2 mb-4">
        Select a public background image for your profile. The background image will be displayed
        behind your theme.
      </p>

      <ErrorBoundary
        fallbackTitle="Failed to load background image selector"
        fallbackMessage="There was an error loading the background image selector. Please try refreshing the page."
      >
        {publicBackgroundImages && publicBackgroundImages.length > 0 ? (
          <BackgroundImageGrid
            backgroundImages={publicBackgroundImages}
            selectedImage={selectedImage}
            isUpdating={isUpdating}
            onImageSelect={handleImageSelect}
            onRemoveBackground={handleRemoveBackground}
          />
        ) : (
          <div className="my-4 p-4 text-center">
            <p className="text-gray-500">No public background images available.</p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default BackgroundImageSelector;
