import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { signalIframe } from '@/utils/helpers';

const SIZE_PRESETS = [
  { label: 'Small', value: 50 },
  { label: 'Medium', value: 100 },
  { label: 'M-Large', value: 150 },
  { label: 'Large', value: 200 },
  { label: 'X-Large', value: 250 },
  { label: 'XX-Large', value: 300 },
  { label: 'XXX-Large', value: 400 },
  { label: 'Maximum', value: 500 },
];

const ProfileImageSizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);
  const queryClient = useQueryClient();

  const [selectedSize, setSelectedSize] = useState(fetchedUser?.profileImageSize || 100);

  // Update local state when user data changes
  useEffect(() => {
    if (fetchedUser?.profileImageSize) {
      setSelectedSize(fetchedUser.profileImageSize);
    }
  }, [fetchedUser?.profileImageSize]);

  // Mutation for updating profile image size
  const sizeMutation = useMutation(
    async (size) => {
      await axios.patch('/api/edit', {
        profileImageSize: size,
        // Preserve existing values
        name: fetchedUser?.name,
        bio: fetchedUser?.bio,
        image: fetchedUser?.image,
        handle: fetchedUser?.handle,
      });
    },
    {
      onError: (error) => {
        toast.error('Failed to update image size');
        // Revert to previous size on error
        setSelectedSize(fetchedUser?.profileImageSize || 100);
        console.error('Error updating image size:', error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Image size updated');
        // Signal iframe to update preview
        try {
          signalIframe();
        } catch (error) {
          console.error('Error signaling iframe:', error);
        }
      },
    }
  );

  const handleSizeChange = async (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (isNaN(newSize) || newSize < 50 || newSize > 500) {
      toast.error('Invalid size selected');
      return;
    }
    
    setSelectedSize(newSize);
    try {
      await sizeMutation.mutateAsync(newSize);
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error in handleSizeChange:', error);
    }
  };
  
  return (
    <select
      value={selectedSize}
      onChange={handleSizeChange}
      className="w-full lg:w-[490px] h-[45px] border rounded-3xl border-[#000] outline-none 
                text-black bg-white p-2 hover:bg-gray-100 focus:border-slate-900"
      aria-label="Select profile image size"
    >
      {SIZE_PRESETS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label} ({value}px)
        </option>
      ))}
    </select>
  );
};

export default ProfileImageSizeSelector; 