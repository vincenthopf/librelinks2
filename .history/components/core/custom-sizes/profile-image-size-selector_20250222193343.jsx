import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';

const SIZE_PRESETS = [
  { label: 'Small', value: 50 },
  { label: 'Medium', value: 100 },
  { label: 'Large', value: 200 },
  { label: 'X-Large', value: 300 },
  { label: 'XX-Large', value: 400 },
  { label: 'Maximum', value: 500 },
];

const ProfileImageSizeSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);
  const queryClient = useQueryClient();

  const [selectedSize, setSelectedSize] = useState(fetchedUser?.profileImageSize || 100);

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
      onError: () => {
        toast.error('Failed to update image size');
      },
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('Image size updated');
      },
    }
  );

  const handleSizeChange = async (e) => {
    const newSize = parseInt(e.target.value, 10);
    setSelectedSize(newSize);
    await sizeMutation.mutateAsync(newSize);
  };

  return (
    <select
      value={selectedSize}
      onChange={handleSizeChange}
      className="w-full lg:w-[490px] h-[45px] border rounded-3xl border-[#000] outline-none 
                text-black bg-white p-2 hover:bg-gray-100 focus:border-slate-900"
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