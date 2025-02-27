import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckMark } from '@/components/utils/checkmark';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';

const BackgroundImageSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedImage, setSelectedImage] = useState(null);
  const queryClient = useQueryClient();

  // Fetch background images
  const { data: backgroundImages, isLoading } = useQuery({
    queryKey: ['backgroundImages'],
    queryFn: async () => {
      const { data } = await axios.get('/api/background-images');
      return data;
    },
  });

  useEffect(() => {
    if (currentUser?.backgroundImage) {
      setSelectedImage(currentUser.backgroundImage);
    }
  }, [currentUser]);

  const mutateBackground = useMutation(
    async (imageUrl) => {
      await axios.patch('/api/customize', {
        backgroundImage: imageUrl,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['currentUser']);
        signalIframe();
      },
    }
  );

  const handleImageSelect = async (imageUrl) => {
    await toast.promise(mutateBackground.mutateAsync(imageUrl), {
      loading: 'Updating background image',
      success: 'Background image updated',
      error: 'An error occurred',
    });
    setSelectedImage(imageUrl);
  };

  const handleRemoveBackground = async () => {
    await toast.promise(mutateBackground.mutateAsync('none'), {
      loading: 'Removing background image',
      success: 'Background image removed',
      error: 'An error occurred',
    });
    setSelectedImage(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-[640px] mx-auto my-6">
        <h3 className="text-xl font-semibold">Background Images</h3>
        <div className="my-4 p-4 text-center">
          <p>Loading background images...</p>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
        {/* None option */}
        <div
          className={`rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 flex items-center justify-center ${
            !selectedImage ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={handleRemoveBackground}
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
        </div>

        {/* Background image options */}
        {backgroundImages.map((image) => (
          <div
            key={image.id}
            className={`rounded-lg overflow-hidden cursor-pointer relative border-2 h-32 ${
              selectedImage === image.imageUrl
                ? 'border-blue-500'
                : 'border-gray-200'
            }`}
            onClick={() => handleImageSelect(image.imageUrl)}
          >
            <img
              src={image.imageUrl}
              alt={image.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
              <p className="text-xs truncate">{image.name}</p>
            </div>
            {selectedImage === image.imageUrl && (
              <span className="absolute top-2 right-2 z-10 text-white">
                <CheckMark />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundImageSelector;
