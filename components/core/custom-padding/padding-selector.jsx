import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';

const PaddingSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [paddingValues, setPaddingValues] = useState({
    headToPicture: 40,
    pictureToName: 16,
    betweenCards: 16,
    cardHeight: 16,
    nameToBio: 10,
    bioToFirstCard: 16,
    horizontalMargin: 8,
  });
  const debounceTimerRef = useRef(null);
  const pendingUpdatesRef = useRef({});
  const toastIdRef = useRef(null);
  const isMountedRef = useRef(true);
  // Flag to prevent local state updates when API data is loading
  const isUpdatingFromAPIRef = useRef(false);
  // Flag to prevent multiple API calls during initial load
  const isInitialLoadRef = useRef(true);

  const queryClient = useQueryClient();

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Clear any pending timeouts on unmount
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Clear any active toasts
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only update from API data if we're not in the middle of a user operation
    if (currentUser) {
      isUpdatingFromAPIRef.current = true;
      // Update all padding values
      const newValues = {
        headToPicture: currentUser.headToPicturePadding ?? 40,
        pictureToName: currentUser.pictureToNamePadding ?? 16,
        betweenCards: currentUser.betweenCardsPadding ?? 16,
        cardHeight: currentUser.linkCardHeight ?? 16,
        nameToBio: currentUser.nameToBioPadding ?? 10,
        bioToFirstCard: currentUser.bioToFirstCardPadding ?? 16,
        horizontalMargin: currentUser.pageHorizontalMargin ?? 8,
      };

      // Compare values individually to prevent unnecessary updates
      const hasChanges = Object.entries(newValues).some(([key, value]) => {
        return paddingValues[key] !== value;
      });

      if (hasChanges) {
        setPaddingValues(newValues);
        // Reset flag immediately after updating state
        requestAnimationFrame(() => {
          isUpdatingFromAPIRef.current = false;
        });
      }
    }
  }, [currentUser]);

  const mutatePadding = useMutation(
    async newPaddingValues => {
      await axios.patch('/api/customize', {
        headToPicturePadding: newPaddingValues.headToPicture,
        pictureToNamePadding: newPaddingValues.pictureToName,
        betweenCardsPadding: newPaddingValues.betweenCards,
        linkCardHeight: newPaddingValues.cardHeight,
        nameToBioPadding: newPaddingValues.nameToBio,
        bioToFirstCardPadding: newPaddingValues.bioToFirstCard,
        horizontalMargin: newPaddingValues.horizontalMargin,
      });
    },
    {
      // Optimistically update the UI immediately
      onMutate: () => {
        // Optimistically update the UI to avoid waiting for API response
        if (isMountedRef.current) {
          signalIframe('refresh');
        }
      },
      onSuccess: () => {
        if (!isMountedRef.current) return;

        // Invalidate immediately instead of delaying
        queryClient.invalidateQueries('users');

        // Signal iframe to refresh after invalidation
        signalIframe('refresh');
      },
      onError: error => {
        console.error('API error:', error);
        if (isMountedRef.current) {
          toast.error('Failed to update padding');
        }
      },
    }
  );

  // Speed up the debounced API update
  const debouncedApiUpdate = useCallback(
    updateValues => {
      // Merge values into the pendingUpdates ref
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updateValues };

      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set a new debounce timer
      debounceTimerRef.current = setTimeout(async () => {
        const pendingUpdates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = {}; // Clear pending updates

        if (Object.keys(pendingUpdates).length === 0) return;

        // Show loading toast
        if (toastIdRef.current) {
          toast.dismiss(toastIdRef.current);
        }
        toastIdRef.current = toast.loading('Saving padding preferences...');

        try {
          // Convert the local state keys to the API field names
          const newPaddingValues = {
            headToPicturePadding: pendingUpdates.headToPicture,
            pictureToNamePadding: pendingUpdates.pictureToName,
            betweenCardsPadding: pendingUpdates.betweenCards,
            linkCardHeight: pendingUpdates.cardHeight,
            nameToBioPadding: pendingUpdates.nameToBio,
            bioToFirstCardPadding: pendingUpdates.bioToFirstCard,
            pageHorizontalMargin: pendingUpdates.horizontalMargin,
          };

          // Filter out undefined values
          Object.keys(newPaddingValues).forEach(key => {
            if (newPaddingValues[key] === undefined) {
              delete newPaddingValues[key];
            }
          });

          // Send to the API
          await axios.patch('/api/users/update', newPaddingValues);

          // Update toast on success
          toast.success('Padding saved successfully!', { id: toastIdRef.current });
          toastIdRef.current = null;

          // Invalidate the queries to refetch the data
          queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          if (currentUser?.handle) {
            queryClient.invalidateQueries({ queryKey: ['users', currentUser.handle] });
          }

          // Signal iframe to reflect changes immediately
          signalIframe('update_user');
        } catch (error) {
          console.error('Error updating padding values:', error);
          toast.error('Error saving padding preferences', { id: toastIdRef.current });
          toastIdRef.current = null;
        }
      }, 500); // 500ms debounce time
    },
    [queryClient, currentUser]
  );

  // Define the valid horizontal margin values based on Tailwind config
  const validHorizontalMargins = [0, 1, 2, 3, 4, 6, 8, 10, 16];

  // Update handlePaddingChange to clamp against the valid options array if needed (optional but safer)
  const handlePaddingChange = useCallback(
    async (type, value) => {
      if (isUpdatingFromAPIRef.current) return;

      let clampedValue = value; // Initialize clampedValue

      if (type === 'horizontalMargin') {
        // Ensure the value is one of the valid ones, default to 8 if not
        clampedValue = validHorizontalMargins.includes(value) ? value : 8;
      } else {
        // For other padding types
        const roundedValue = Math.round(value / 5) * 5;
        clampedValue = Math.max(-500, Math.min(500, roundedValue));
      }

      // Update local state immediately
      setPaddingValues(prev => ({ ...prev, [type]: clampedValue }));

      // Signal iframe to provide immediate visual feedback
      signalIframe('refresh');

      // Queue the API update
      debouncedApiUpdate({ [type]: clampedValue });
    },
    [debouncedApiUpdate, validHorizontalMargins] // Add validHorizontalMargins to dependency array
  );

  // Generate padding options from -500 to 500 in steps of 5
  const paddingOptions = Array.from({ length: 201 }, (_, i) => -500 + i * 5);

  // Generate card height options from 40 to 200 in steps of 5
  const cardHeightOptions = Array.from({ length: 33 }, (_, i) => (i + 8) * 5);

  // Reset to defaults handler
  const handleResetToDefaults = useCallback(() => {
    const defaultValues = {
      headToPicture: 40,
      pictureToName: 16,
      betweenCards: 16,
      cardHeight: 16,
      nameToBio: 10,
      bioToFirstCard: 16,
      horizontalMargin: 8,
    };

    // Update local state immediately
    setPaddingValues(defaultValues);

    // Queue API update
    debouncedApiUpdate(defaultValues);
  }, [debouncedApiUpdate]);

  // Component to visualize negative spacers
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
        }}
      >
        Overlap: {value}px
      </div>
    );
  };

  return (
    <div className="max-w-[690px] mx-auto my-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Adjust Spacing</h3>
        <button
          onClick={handleResetToDefaults}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
        <p className="font-semibold">Negative Padding Enabled</p>
        <p>
          Use negative values (down to -500px) to create overlapping elements. Negative spacers are
          highlighted in red.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto">
        <div className="space-y-6">
          {/* Head to Profile Picture */}
          <div>
            <p className="text-inherit pb-2">
              Head to Profile Picture{' '}
              <span className="text-xs text-blue-500">(negative values = overlap)</span>
            </p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.headToPicture}
                onChange={e => handlePaddingChange('headToPicture', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {paddingOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">-500px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={paddingValues.headToPicture}
                      onChange={e => handlePaddingChange('headToPicture', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">500px</span>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-gray-100 rounded relative">
              <div style={{ height: `${Math.max(0, paddingValues.headToPicture)}px` }}></div>
              {paddingValues.headToPicture < 0 && (
                <div
                  className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                  style={{ height: `${Math.abs(paddingValues.headToPicture)}px` }}
                >
                  Overlap: {paddingValues.headToPicture}px
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture to Profile Name */}
          <div>
            <p className="text-inherit pb-2">
              Profile Picture to Profile Name{' '}
              <span className="text-xs text-blue-500">(negative values = overlap)</span>
            </p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.pictureToName}
                onChange={e => handlePaddingChange('pictureToName', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {paddingOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">-500px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={paddingValues.pictureToName}
                      onChange={e => handlePaddingChange('pictureToName', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">500px</span>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-gray-200 rounded relative">
              <div style={{ height: `${Math.max(0, paddingValues.pictureToName)}px` }}></div>
              {paddingValues.pictureToName < 0 && (
                <div
                  className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                  style={{ height: `${Math.abs(paddingValues.pictureToName)}px` }}
                >
                  Overlap: {paddingValues.pictureToName}px
                </div>
              )}
            </div>
          </div>

          {/* Profile Name to Bio - New padding control */}
          <div>
            <p className="text-inherit pb-2">
              Profile Name to Bio{' '}
              <span className="text-xs text-blue-500">(negative values = overlap)</span>
            </p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.nameToBio}
                onChange={e => handlePaddingChange('nameToBio', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {paddingOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">-500px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={paddingValues.nameToBio}
                      onChange={e => handlePaddingChange('nameToBio', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">500px</span>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-gray-200 rounded relative">
              <div style={{ height: `${Math.max(0, paddingValues.nameToBio)}px` }}></div>
              {paddingValues.nameToBio < 0 && (
                <div
                  className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                  style={{ height: `${Math.abs(paddingValues.nameToBio)}px` }}
                >
                  Overlap: {paddingValues.nameToBio}px
                </div>
              )}
            </div>
          </div>

          {/* Bio to First Link Card - New padding control */}
          <div>
            <p className="text-inherit pb-2">
              Bio to First Link Card{' '}
              <span className="text-xs text-blue-500">(negative values = overlap)</span>
            </p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.bioToFirstCard}
                onChange={e => handlePaddingChange('bioToFirstCard', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {paddingOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">-500px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={paddingValues.bioToFirstCard}
                      onChange={e =>
                        handlePaddingChange('bioToFirstCard', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">500px</span>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-gray-200 rounded relative">
              <div style={{ height: `${Math.max(0, paddingValues.bioToFirstCard)}px` }}></div>
              {paddingValues.bioToFirstCard < 0 && (
                <div
                  className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                  style={{ height: `${Math.abs(paddingValues.bioToFirstCard)}px` }}
                >
                  Overlap: {paddingValues.bioToFirstCard}px
                </div>
              )}
            </div>
          </div>

          {/* Between Link Cards */}
          <div>
            <p className="text-inherit pb-2">
              Between Link Cards{' '}
              <span className="text-xs text-blue-500">(negative values = overlap)</span>
            </p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.betweenCards}
                onChange={e => handlePaddingChange('betweenCards', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {paddingOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">-500px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="5"
                      value={paddingValues.betweenCards}
                      onChange={e => handlePaddingChange('betweenCards', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">500px</span>
                </div>
              </div>
            </div>
            <div className="mt-2 bg-gray-100 rounded relative">
              <div style={{ height: `${Math.max(0, paddingValues.betweenCards)}px` }}></div>
              {paddingValues.betweenCards < 0 && (
                <div
                  className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                  style={{ height: `${Math.abs(paddingValues.betweenCards)}px` }}
                >
                  Overlap: {paddingValues.betweenCards}px
                </div>
              )}
            </div>
          </div>

          {/* Link Card Height */}
          <div>
            <p className="text-inherit pb-2">Link Card Height</p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.cardHeight}
                onChange={e => handlePaddingChange('cardHeight', parseInt(e.target.value))}
                className="w-1/3 p-2 border rounded-md"
              >
                {cardHeightOptions.map(size => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <div className="w-2/3">
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">40px</span>
                  <div className="w-full px-1">
                    <input
                      type="range"
                      min="40"
                      max="200"
                      step="5"
                      value={paddingValues.cardHeight}
                      onChange={e => handlePaddingChange('cardHeight', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">200px</span>
                </div>
              </div>
            </div>
            <div
              className="mt-2 bg-gray-200 rounded"
              style={{ height: `${paddingValues.cardHeight}px` }}
            />
          </div>

          {/* Horizontal Margin */}
          <div>
            <p className="text-inherit pb-2">Horizontal Margin</p>
            <div className="flex space-x-4">
              <select
                value={paddingValues.horizontalMargin}
                onChange={e => handlePaddingChange('horizontalMargin', parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                {validHorizontalMargins.map(size => (
                  <option key={size} value={size}>
                    px-{size}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 bg-gray-200 rounded flex items-center justify-center">
              <div
                className="bg-gray-300 h-10 flex items-center justify-center"
                style={{ width: `calc(100% - ${paddingValues.horizontalMargin * 2}px)` }}
              >
                <span className="text-xs text-gray-500">px-{paddingValues.horizontalMargin}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type='range'] {
          height: 22px;
          -webkit-appearance: none;
          margin: 10px 0;
        }
        input[type='range']:focus {
          outline: none;
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          cursor: pointer;
          background: #e2e8f0;
          border-radius: 4px;
        }
        input[type='range']::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
          border-radius: 8px;
          background: #3b82f6;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -4px;
        }
        input[type='range']:focus::-webkit-slider-runnable-track {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default PaddingSelector;
