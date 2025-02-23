import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import { FRAME_OPTIONS, FrameType, getFrameStyles, getFrameClassName, DEFAULT_FRAME_TYPE } from '@/utils/frame-helpers';
import { signalIframe } from '@/utils/helpers';
import { CustomizationResponse, ProfileFrameSelectorProps } from '@/types/components';

const ProfileFrameSelector: React.FC<ProfileFrameSelectorProps> = ({
  defaultType = DEFAULT_FRAME_TYPE,
  onTypeChange
}) => {
  const { data: currentUser } = useCurrentUser();
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(defaultType);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser?.profileFrameType) {
      setSelectedFrame(currentUser.profileFrameType as FrameType);
    }
  }, [currentUser]);

  const mutateFrame = useMutation<
    CustomizationResponse,
    AxiosError<CustomizationResponse>,
    FrameType
  >({
    mutationFn: async (frameType: FrameType) => {
      const { data } = await axios.patch<CustomizationResponse>('/api/customize', {
        profileFrameType: frameType
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      signalIframe();
      onTypeChange?.(data.data?.profileFrameType || DEFAULT_FRAME_TYPE);
    },
    onError: (error) => {
      console.error('Frame update error:', error);
      const message = error.response?.data?.error?.message || 'An error occurred while updating the frame';
      toast.error(message);
    }
  });

  const handleFrameChange = async (frameType: FrameType) => {
    setIsLoading(true);
    try {
      await toast.promise(mutateFrame.mutateAsync(frameType), {
        loading: 'Updating frame type',
        success: 'Frame type updated successfully',
        error: (err) => err.response?.data?.error?.message || 'An error occurred'
      });
      setSelectedFrame(frameType);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[690px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Profile Frame</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {FRAME_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => !isLoading && handleFrameChange(option.type)}
              disabled={isLoading}
              className={`relative p-4 rounded-lg transition-all duration-300 ${
                selectedFrame === option.type
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-16 h-16 bg-gray-300 ${getFrameClassName(option.type)}`}
                  style={{
                    ...getFrameStyles(option.type),
                    border: option.type === 'none' ? 'none' : '2px solid #3B82F6'
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileFrameSelector; 