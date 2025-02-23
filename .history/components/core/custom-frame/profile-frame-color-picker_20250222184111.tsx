import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import { isValidHexColor, DEFAULT_FRAME_COLOR } from '@/utils/frame-helpers';
import { signalIframe } from '@/utils/helpers';

const COLOR_PRESETS = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#000000', // black
  '#6B7280', // gray-500
];

const ProfileFrameColorPicker = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedColor, setSelectedColor] = useState(DEFAULT_FRAME_COLOR);
  const [customColor, setCustomColor] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser?.profileFrameColor) {
      setSelectedColor(currentUser.profileFrameColor);
      setCustomColor(currentUser.profileFrameColor);
    }
  }, [currentUser]);

  const mutateColor = useMutation(
    async (color: string) => {
      await axios.patch('/api/customize', {
        profileFrameColor: color
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        signalIframe();
      },
    }
  );

  const handleColorChange = async (color: string) => {
    if (!isValidHexColor(color)) {
      toast.error('Invalid color format. Please use hex color (e.g., #FF0000)');
      return;
    }

    await toast.promise(mutateColor.mutateAsync(color), {
      loading: 'Updating frame color',
      success: 'Frame color updated successfully',
      error: 'An error occurred'
    });
    setSelectedColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    
    // Only update if it's a valid hex color
    if (isValidHexColor(color)) {
      handleColorChange(color);
    }
  };

  return (
    <div className="max-w-[690px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Frame Color</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-4">
          {/* Color presets */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`w-10 h-10 rounded-full transition-all duration-300 ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-blue-500'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="custom-color" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Color (Hex)
              </label>
              <input
                type="text"
                id="custom-color"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#000000"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div 
              className="w-10 h-10 rounded-full border-2"
              style={{ 
                backgroundColor: isValidHexColor(customColor) ? customColor : '#FFFFFF',
                borderColor: isValidHexColor(customColor) ? customColor : '#000000'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFrameColorPicker; 