/* eslint-disable react-hooks/exhaustive-deps */
import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const ImageSizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  // Generate size options from 20 to 500 in steps of 20
  const sizeOptions = Array.from({ length: 25 }, (_, i) => (i + 1) * 20);

  const [selectedSize, setSelectedSize] = useState(currentUser?.profileImageSize || 70);

  useEffect(() => {
    if (currentUser?.profileImageSize) {
      setSelectedSize(currentUser.profileImageSize);
    }
  }, [currentUser?.profileImageSize]);

  const { mutate: updateImageSize } = useMutation({
    mutationFn: async (size) => {
      const response = await axios.patch('/api/users/edit', {
        profileImageSize: size,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users', currentUser?.handle]);
      signalIframe();
      toast.success('Profile picture size updated');
    },
    onError: (error) => {
      console.error('Failed to update profile picture size:', error);
      toast.error('Failed to update profile picture size');
    },
  });

  const handleSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setSelectedSize(newSize);
    updateImageSize(newSize);
  };

  return (
    <div className="max-w-[640px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Image Sizes</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          <div>
            <p className="text-inherit pb-2">Profile Picture Size</p>
            <select 
              value={selectedSize}
              onChange={handleSizeChange}
              className="w-full p-2 border rounded-md"
            >
              {sizeOptions.map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
            <div className="mt-2">
              <div 
                style={{ 
                  width: `${selectedSize}px`, 
                  height: `${selectedSize}px`,
                  backgroundColor: '#F3F3F1',
                  borderRadius: '50%'
                }} 
                className="border-2 border-blue-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSizeSelector; 