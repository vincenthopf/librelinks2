/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const ImageSizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [imageSizes, setImageSizes] = useState({
    socialIcon: 30,
    favicon: 32
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      setImageSizes({
        socialIcon: currentUser.socialIconSize || 30,
        favicon: currentUser.faviconSize || 32
      });
    }
  }, [currentUser]);

  const mutateImageSizes = useMutation(
    async (newImageSizes) => {
      await axios.patch('/api/customize', {
        socialIconSize: newImageSizes.socialIcon,
        faviconSize: newImageSizes.favicon
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        signalIframe();
      },
    }
  );

  const handleImageSizeChange = async (type, size) => {
    const newImageSizes = { ...imageSizes, [type]: size };
    await toast.promise(mutateImageSizes.mutateAsync(newImageSizes), {
      loading: 'Updating image size',
      success: 'Image size updated successfully',
      error: 'An error occurred'
    });
    setImageSizes(newImageSizes);
  };

  const imageSizeOptions = [16, 20, 24, 28, 32, 40, 48, 56, 64];

  return (
    
      <h3 className="text-xl font-semibold">Image Sizes</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          {/* Social Icon Size */}
          <div>
            <p className="text-inherit pb-2">Social Icon Size</p>
            <select 
              value={imageSizes.socialIcon}
              onChange={(e) => handleImageSizeChange('socialIcon', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {imageSizeOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2">
              <div 
                style={{ 
                  width: `${imageSizes.socialIcon}px`, 
                  height: `${imageSizes.socialIcon}px`,
                  backgroundColor: '#F3F3F1',
                  borderRadius: '50%'
                }} 
              />
            </div>
          </div>

          {/* Favicon Size */}
          <div>
            <p className="text-inherit pb-2">Favicon Size</p>
            <select 
              value={imageSizes.favicon}
              onChange={(e) => handleImageSizeChange('favicon', parseInt(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {imageSizeOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2">
              <div 
                style={{ 
                  width: `${imageSizes.favicon}px`, 
                  height: `${imageSizes.favicon}px`,
                  backgroundColor: '#F3F3F1',
                  borderRadius: '50%'
                }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSizeSelector; 