import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';

// Frame Animation presets
const frameAnimationPresets = [
  { id: 'rotate', name: 'Rotate', description: 'Frame rotates continuously' },
  { id: 'pulse', name: 'Pulse', description: 'Frame pulses in and out' },
  { id: 'glow', name: 'Glow', description: 'Frame glows with varying intensity' },
  { id: 'bounce', name: 'Bounce', description: 'Frame bounces up and down' },
  { id: 'shimmer', name: 'Shimmer', description: 'Frame shimmers with light effect' },
  { id: 'breathe', name: 'Breathe', description: 'Frame slowly expands and contracts' },
  { id: 'shake', name: 'Shake', description: 'Frame shakes from side to side' },
  { id: 'spin-pulse', name: 'Spin-pulse', description: 'Frame spins and pulses' },
  { id: 'none', name: 'None', description: 'No animation' },
];

const FrameAnimationSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize from user preferences if available
    if (currentUser?.frameAnimation) {
      setSelectedAnimation(currentUser.frameAnimation.type || 'none');
    }
  }, [currentUser]);

  const mutateFrameAnimation = useMutation(
    async animationData => {
      try {
        const response = await axios.patch('/api/frame-animations', animationData);
        return response;
      } catch (error) {
        console.error('API ERROR:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['currentUser']);
        // Use 'refresh' signal for better iframe refresh, and add a slight delay
        signalIframe('refresh');
        // Add a secondary signal after a short delay to ensure the refresh is complete
        setTimeout(() => {
          signalIframe('refresh');
        }, 300);
      },
    }
  );

  const handleAnimationSelect = async animationId => {
    setSelectedAnimation(animationId);

    const animationData = {
      type: animationId,
      enabled: animationId !== 'none',
      config: {},
    };

    await toast.promise(mutateFrameAnimation.mutateAsync(animationData), {
      loading: 'Updating frame animation',
      success: 'Frame animation updated',
      error: 'Failed to update frame animation',
    });
  };

  // Demo element to show the animation
  const AnimationDemo = ({ animationId }) => {
    const [animate, setAnimate] = useState(false);

    const resetAnimation = () => {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 100);
    };

    useEffect(() => {
      // Auto-play the animation when it's first loaded
      resetAnimation();
    }, []);

    // For frame animations, show a square with the animation effect
    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-md border-2 border-blue-500 ${
            animate && animationId !== 'none' ? 'animate-frame-' + animationId : ''
          }`}
        />
        <button onClick={resetAnimation} className="text-xs text-blue-600 hover:underline mt-1">
          Play again
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Frame Animation</h2>
        <p className="text-sm text-gray-600 mb-4">
          Select an animation for your profile picture frame.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frameAnimationPresets.map(animation => (
            <div
              key={animation.id}
              onClick={() => handleAnimationSelect(animation.id)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedAnimation === animation.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{animation.name}</h3>
                <AnimationDemo animationId={animation.id} />
              </div>
              <p className="text-sm text-gray-500">{animation.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FrameAnimationSelector;
