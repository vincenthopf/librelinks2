import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';
import { Label } from '@/components/ui/label';
import ViewModeToggle from '@/components/ui/view-mode-toggle';
import { BentoSpanEditor } from '@/components/settings/bento-span-editor';
import BentoLayoutSelector from '@/components/settings/bento-layout-selector';
import useBentoItems from '@/hooks/useBentoItems';

// Define the valid horizontal margin values (0 to 40)
const VALID_HORIZONTAL_MARGINS = Array.from({ length: 41 }, (_, i) => i);
const DEFAULT_HORIZONTAL_MARGIN = 20;

const PaddingSelector = () => {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const [paddingValues, setPaddingValues] = useState({
    headToPicture: 40, // Default from schema
    pictureToName: 16, // Default from schema
    betweenCards: 16, // Default from schema
    cardHeight: 40, // Default from schema
    nameToBio: 10, // Default from schema
    bioToSocial: 16, // Default from schema
    horizontalMargin: DEFAULT_HORIZONTAL_MARGIN, // Use new default
  });
  const [viewMode, setViewMode] = useState('normal');
  const debounceTimerRef = useRef(null);
  const pendingUpdatesRef = useRef({});
  const toastIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Use the bento items hook
  const { bentoItems, updateItemSpan, updateItemsOrder } = useBentoItems(
    currentUser?.id,
    currentUser?.bentoItems
  );

  // Memoized theme
  const theme = useMemo(
    () => ({
      primary: currentUser?.themePalette?.palette?.[0] || '#ffffff',
      secondary: currentUser?.themePalette?.palette?.[1] || '#f8f8f8',
      accent: currentUser?.themePalette?.palette?.[2] || '#000000',
      neutral: currentUser?.themePalette?.palette?.[3] || '#888888',
    }),
    [currentUser?.themePalette]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newValues = {
        headToPicture: currentUser.headToPicturePadding ?? 40,
        pictureToName: currentUser.pictureToNamePadding ?? 16,
        betweenCards: currentUser.betweenCardsPadding ?? 16,
        cardHeight: currentUser.linkCardHeight ?? 40,
        nameToBio: currentUser.nameToBioPadding ?? 10,
        bioToSocial: currentUser.bioToSocialPadding ?? 16,
        horizontalMargin: currentUser.pageHorizontalMargin ?? DEFAULT_HORIZONTAL_MARGIN,
      };
      setPaddingValues(newValues);
      setViewMode(currentUser.viewMode || 'normal');
    }
  }, [currentUser]);

  // Mutation for updating padding values
  const mutatePadding = useMutation(
    async updates => {
      await axios.patch('/api/users/update', updates);
    },
    {
      onMutate: () => {
        if (isMountedRef.current) {
          signalIframe('refresh');
        }
      },
      onSuccess: () => {
        if (!isMountedRef.current) return;
        queryClient.invalidateQueries({ queryKey: ['users'] });
        signalIframe('update_user');
        signalIframe('refresh');
      },
      onError: error => {
        console.error('API error updating padding:', error);
        if (isMountedRef.current) {
          toast.error('Failed to update padding');
        }
      },
    }
  );

  // Mutation for updating view mode
  const mutateViewMode = useMutation(
    async newViewMode => {
      await axios.post('/api/users/update-view-mode', { viewMode: newViewMode });
    },
    {
      onMutate: async newViewMode => {
        // Update local state immediately
        setViewMode(newViewMode);

        // Optimistically update the cache
        await queryClient.cancelQueries({ queryKey: ['users'] });
        const previousUserData = queryClient.getQueryData(['users']);
        queryClient.setQueryData(['users'], old => ({
          ...old,
          viewMode: newViewMode,
        }));
        signalIframe('update_user'); // Signal preview update
        return { previousUserData };
      },
      onError: (err, newViewMode, context) => {
        // Revert optimistic update on error
        queryClient.setQueryData(['users'], context.previousUserData);
        toast.error('Failed to change view mode');
        setViewMode(context.previousUserData?.viewMode || 'normal'); // Revert local state
        signalIframe('update_user'); // Signal preview update
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        signalIframe('refresh'); // Ensure final refresh
      },
    }
  );

  // Mutation for updating bento spans
  const mutateBentoSpans = useMutation(
    async updatedBentoItems => {
      await axios.post('/api/users/update-bento-spans', { bentoItems: updatedBentoItems });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Bento layout updated!');
        signalIframe('update_user');
        signalIframe('refresh');
      },
      onError: error => {
        console.error('API error updating bento spans:', error);
        toast.error('Failed to update Bento layout');
      },
    }
  );

  const debouncedApiUpdate = useCallback(
    updates => {
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading('Saving settings...');
      }

      debounceTimerRef.current = setTimeout(async () => {
        const currentUpdates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = {};

        try {
          if (Object.keys(currentUpdates).length > 0) {
            await mutatePadding.mutateAsync(currentUpdates);
            toast.success('Padding saved successfully!', { id: toastIdRef.current });
          } else {
            toast.dismiss(toastIdRef.current);
          }
        } catch (error) {
          console.error('Error updating padding values:', error);
          toast.error('Error saving padding preferences', { id: toastIdRef.current });
        } finally {
          toastIdRef.current = null;
        }
      }, 500);
    },
    [mutatePadding]
  );

  const handlePaddingChange = useCallback(
    async (type, value) => {
      let clampedValue = parseInt(value, 10);

      if (isNaN(clampedValue)) {
        clampedValue = type === 'horizontalMargin' ? DEFAULT_HORIZONTAL_MARGIN : 0;
      }

      if (type === 'horizontalMargin') {
        clampedValue = Math.max(0, Math.min(40, clampedValue));
      } else if (type === 'betweenCards') {
        const roundedValue = Math.round(clampedValue / 5) * 5;
        clampedValue = Math.max(0, Math.min(500, roundedValue));
      } else if (type === 'cardHeight') {
        const roundedValue = Math.round(clampedValue / 5) * 5;
        clampedValue = Math.max(0, Math.min(200, roundedValue));
      } else if (type === 'bioToSocial') {
        const roundedValue = Math.round(clampedValue / 5) * 5;
        clampedValue = Math.max(-500, Math.min(500, roundedValue));
      } else {
        const roundedValue = Math.round(clampedValue / 5) * 5;
        clampedValue = Math.max(-500, Math.min(500, roundedValue));
      }

      setPaddingValues(prev => ({ ...prev, [type]: clampedValue }));
      debouncedApiUpdate({
        [type.replace(/([A-Z])/g, 'Padding$1').replace(/^./, c => c.toLowerCase())]: clampedValue,
      });
    },
    [debouncedApiUpdate]
  );

  const handleViewModeChange = useCallback(
    newMode => {
      if (currentUser && newMode !== currentUser.viewMode) {
        mutateViewMode.mutate(newMode);
      }
    },
    [currentUser, mutateViewMode]
  );

  const handleBentoSpanUpdate = useCallback(
    updatedBentoItems => {
      mutateBentoSpans.mutate(updatedBentoItems);
    },
    [mutateBentoSpans]
  );

  const paddingOptions = Array.from({ length: 201 }, (_, i) => -500 + i * 5);
  const positivePaddingOptions = Array.from({ length: 101 }, (_, i) => i * 5);
  const cardHeightOptions = Array.from({ length: 41 }, (_, i) => i * 5);

  const getOptionsWithCurrentValue = (options, currentValue) => {
    if (options.includes(currentValue)) {
      return options;
    }
    return [...options, currentValue].sort((a, b) => a - b);
  };

  const handleResetToDefaults = useCallback(() => {
    const defaultValues = {
      headToPicturePadding: 40,
      pictureToNamePadding: 16,
      betweenCardsPadding: 16,
      linkCardHeight: 40,
      nameToBioPadding: 10,
      bioToSocialPadding: 16,
      pageHorizontalMargin: DEFAULT_HORIZONTAL_MARGIN,
    };
    setPaddingValues({
      headToPicture: 40,
      pictureToName: 16,
      betweenCards: 16,
      cardHeight: 40,
      nameToBio: 10,
      bioToSocial: 16,
      horizontalMargin: DEFAULT_HORIZONTAL_MARGIN,
    });
    debouncedApiUpdate(defaultValues);
  }, [debouncedApiUpdate]);

  // Structure for padding controls
  const paddingControls = [
    { id: 'headToPicture', label: 'Page Top to Avatar' },
    { id: 'pictureToName', label: 'Avatar to Name' },
    { id: 'nameToBio', label: 'Name to Bio' },
    { id: 'bioToSocial', label: 'Bio to Social Icons' },
    { id: 'betweenCards', label: 'Between Links/Cards' },
    { id: 'cardHeight', label: 'Link Card Height' },
    { id: 'horizontalMargin', label: 'Page Horizontal Margin' },
  ];

  return (
    <div className="space-y-8">
      {/* View mode toggle section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Display Mode</h3>
        <div className="flex flex-col space-y-4">
          <ViewModeToggle value={viewMode} onChange={handleViewModeChange} theme={theme} />

          {/* Render BentoLayoutSelector only when in bento mode */}
          {viewMode === 'bento' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <BentoLayoutSelector theme={theme} />
            </div>
          )}
        </div>
      </div>

      {/* Padding Controls Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label className="text-lg font-semibold">Spacing & Padding</Label>
          <button onClick={handleResetToDefaults} className="text-sm text-blue-600 hover:underline">
            Reset to Defaults
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {paddingControls.map(({ id, label }) => (
            <div key={id}>
              <Label htmlFor={id} className="block text-sm font-medium mb-1">
                {label}
              </Label>
              <select
                id={id}
                value={paddingValues[id]}
                onChange={e => handlePaddingChange(id, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {id === 'betweenCards' || id === 'cardHeight' || id === 'horizontalMargin'
                  ? getOptionsWithCurrentValue(positivePaddingOptions, paddingValues[id]).map(
                      option => (
                        <option key={option} value={option}>
                          {option}px
                        </option>
                      )
                    )
                  : getOptionsWithCurrentValue(paddingOptions, paddingValues[id]).map(option => (
                      <option key={option} value={option}>
                        {option}px
                      </option>
                    ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaddingSelector;

const VisualSpacer = ({ height, label, isFirst, isLast }) => {
  if (height <= 0) return null;

  return (
    <div
      className={`relative w-full bg-blue-100 border-x border-blue-300 ${isFirst ? 'border-t' : ''} ${isLast ? 'border-b' : ''}`}
      style={{ height: `${height}px` }}
    >
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-blue-600">
        {label} ({height}px)
      </span>
    </div>
  );
};

const NegativeSpacer = ({ value, type }) => {
  if (value >= 0) return null;

  return (
    <div
      className="absolute left-0 right-0 bg-red-200 opacity-40 flex items-center justify-center text-red-600 text-xs font-bold"
      style={{
        height: `${Math.abs(value)}px`,
        bottom: type === 'headToPicture' ? 0 : 'auto',
        top: type !== 'headToPicture' ? 0 : 'auto',
        zIndex: 5,
        border: '1px dashed red',
        mixBlendMode: 'multiply',
      }}
    >
      Overlap: {Math.abs(value)}px
    </div>
  );
};
