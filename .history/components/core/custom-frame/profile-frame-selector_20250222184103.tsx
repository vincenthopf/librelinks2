import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import { FRAME_OPTIONS, FrameType, getFrameStyles, getFrameClassName, DEFAULT_FRAME_TYPE } from '@/utils/frame-helpers';
import { signalIframe } from '@/utils/helpers';

const ProfileFrameSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedFrame, setSelectedFrame] = useState<FrameType>(DEFAULT_FRAME_TYPE);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser?.profileFrameType) {
      setSelectedFrame(currentUser.profileFrameType as FrameType);
    }
  }, [currentUser]);

  const mutateFrame = useMutation(
    async (frameType: FrameType) => {
      await axios.patch('/api/customize', {
        profileFrameType: frameType
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        signalIframe();
      },
    }
  );

  const handleFrameChange = async (frameType: FrameType) => {
    await toast.promise(mutateFrame.mutateAsync(frameType), {
      loading: 'Updating frame type',
      success: 'Frame type updated successfully',
      error: 'An error occurred'
    });
    setSelectedFrame(frameType);
  };

  return (
    <div className="max-w-[690px] mx-auto my-4">
      <h3 className="text-xl font-semibold">Profile Frame</h3>
      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {FRAME_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleFrameChange(option.type)}
              className={`relative p-4 rounded-lg transition-all duration-300 ${
                selectedFrame === option.type
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
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