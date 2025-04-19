import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';
import { signalIframe } from '@/utils/helpers';

// Animation presets
const animationPresets = [
  { id: 'fade', name: 'Fade In', description: 'Elements fade in smoothly' },
  { id: 'slideUp', name: 'Slide Up', description: 'Elements slide up from below' },
  { id: 'slideDown', name: 'Slide Down', description: 'Elements slide down from above' },
  { id: 'slideLeft', name: 'Slide Left', description: 'Elements slide in from the left' },
  { id: 'slideRight', name: 'Slide Right', description: 'Elements slide in from the right' },
  { id: 'scale', name: 'Scale', description: 'Elements scale from smaller to larger' },
  { id: 'rotate', name: 'Rotate', description: 'Elements rotate while appearing' },
  { id: 'bounce', name: 'Bounce', description: 'Elements bounce into view' },
  { id: 'none', name: 'None', description: 'No animation' },
];

const ContentAnimationSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [selectedAnimation, setSelectedAnimation] = useState('none');
  const [animationDuration, setAnimationDuration] = useState(0.5);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [staggered, setStaggered] = useState(false);
  const [staggerAmount, setStaggerAmount] = useState(0.1);

  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize from user preferences if available
    if (currentUser?.contentAnimation) {
      setSelectedAnimation(currentUser.contentAnimation.type || 'none');
      setAnimationDuration(currentUser.contentAnimation.duration || 0.5);
      setAnimationDelay(currentUser.contentAnimation.delay || 0);
      setStaggered(currentUser.contentAnimation.staggered || false);
      setStaggerAmount(currentUser.contentAnimation.staggerAmount || 0.1);
    }
  }, [currentUser]);

  const mutateAnimation = useMutation(
    async animationData => {
      try {
        const response = await axios.patch('/api/animations', animationData);
        return response;
      } catch (error) {
        console.error('API ERROR:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        // queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      },
      onError: error => {
        // Optional: Add better error handling/toast message here
        toast.error('Failed to save animation setting.');
      },
    }
  );

  const handleAnimationSelect = async animationId => {
    setSelectedAnimation(animationId);

    const animationData = {
      type: animationId,
      duration: animationDuration,
      delay: animationDelay,
      staggered: staggered,
      staggerAmount: staggerAmount,
    };

    await toast.promise(mutateAnimation.mutateAsync(animationData), {
      loading: 'Updating animation',
      success: 'Animation updated',
      error: 'Failed to update animation',
    });
  };

  const handleDurationChange = async duration => {
    setAnimationDuration(duration);

    if (selectedAnimation !== 'none') {
      const animationData = {
        type: selectedAnimation,
        duration: duration,
        delay: animationDelay,
        staggered: staggered,
        staggerAmount: staggerAmount,
      };

      await mutateAnimation.mutateAsync(animationData);
    }
  };

  const handleDelayChange = async delay => {
    setAnimationDelay(delay);

    if (selectedAnimation !== 'none') {
      const animationData = {
        type: selectedAnimation,
        duration: animationDuration,
        delay: delay,
        staggered: staggered,
        staggerAmount: staggerAmount,
      };

      await mutateAnimation.mutateAsync(animationData);
    }
  };

  const handleStaggeredChange = async isStaggered => {
    setStaggered(isStaggered);

    if (selectedAnimation !== 'none') {
      const animationData = {
        type: selectedAnimation,
        duration: animationDuration,
        delay: animationDelay,
        staggered: isStaggered,
        staggerAmount: staggerAmount,
      };

      await mutateAnimation.mutateAsync(animationData);
    }
  };

  const handleStaggerAmountChange = async amount => {
    setStaggerAmount(amount);

    if (selectedAnimation !== 'none' && staggered) {
      const animationData = {
        type: selectedAnimation,
        duration: animationDuration,
        delay: animationDelay,
        staggered: staggered,
        staggerAmount: amount,
      };

      await mutateAnimation.mutateAsync(animationData);
    }
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

    return (
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 bg-blue-500 rounded-lg mb-2 ${animate ? (animationId !== 'none' ? 'animate-' + animationId : '') : 'invisible'}`}
          style={{
            animationDuration: `${animationDuration}s`,
            animationDelay: `${animationDelay}s`,
          }}
        />
        <button onClick={resetAnimation} className="text-xs text-blue-600 hover:underline">
          Play again
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        {/* <h2 className="text-lg font-semibold mb-4">Select Animation Style</h2> */}
        <p className="text-sm text-gray-600 mb-4">
          Choose how your embedded content and links appear when your page loads.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {animationPresets.map(animation => (
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

      {selectedAnimation !== 'none' && (
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold">Animation Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration: {animationDuration}s
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={animationDuration}
              onChange={e => handleDurationChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay: {animationDelay}s
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={animationDelay}
              onChange={e => handleDelayChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="staggered"
              checked={staggered}
              onChange={e => handleStaggeredChange(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="staggered" className="text-sm font-medium text-gray-700">
              Staggered animation (elements appear one after another)
            </label>
          </div>

          {staggered && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stagger amount: {staggerAmount}s
              </label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={staggerAmount}
                onChange={e => handleStaggerAmountChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentAnimationSelector;
