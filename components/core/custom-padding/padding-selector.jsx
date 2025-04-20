import useCurrentUser from '@/hooks/useCurrentUser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Define the valid horizontal margin values (0 to 40)
const VALID_HORIZONTAL_MARGINS = Array.from({ length: 41 }, (_, i) => i);
const DEFAULT_HORIZONTAL_MARGIN = 20;

const PaddingSelector = () => {
  const { data: currentUser } = useCurrentUser();
  const [paddingValues, setPaddingValues] = useState({
    headToPicture: 40, // Default from schema
    pictureToName: 16, // Default from schema
    betweenCards: 16, // Default from schema
    cardHeight: 40, // Default from schema
    nameToBio: 10, // Default from schema
    bioToSocial: 16, // Default from schema
    horizontalMargin: DEFAULT_HORIZONTAL_MARGIN, // Use new default
  });
  const debounceTimerRef = useRef(null);
  const pendingUpdatesRef = useRef({});
  const toastIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  const queryClient = useQueryClient();

  // Memoized valid horizontal margins
  const validHorizontalMargins = useMemo(() => VALID_HORIZONTAL_MARGINS, []);

  // Add state for stack view toggle
  const [stackView, setStackView] = useState(false);

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
        horizontalMargin: currentUser.pageHorizontalMargin ?? DEFAULT_HORIZONTAL_MARGIN, // Use new default
      };
      setPaddingValues(newValues);

      // Initialize stackView from user preferences
      setStackView(currentUser.stackView || false);
    }
  }, [currentUser]); // Only depend on currentUser

  const mutatePadding = useMutation(
    async newPaddingValues => {
      await axios.patch('/api/customize', {
        headToPicturePadding: newPaddingValues.headToPicture,
        pictureToNamePadding: newPaddingValues.pictureToName,
        betweenCardsPadding: newPaddingValues.betweenCards,
        linkCardHeight: newPaddingValues.cardHeight,
        nameToBioPadding: newPaddingValues.nameToBio,
        bioToSocialPadding: newPaddingValues.bioToSocial,
        horizontalMargin: newPaddingValues.horizontalMargin,
      });
    },
    {
      onMutate: () => {
        if (isMountedRef.current) {
          signalIframe('refresh');
        }
      },
      onSuccess: () => {
        if (!isMountedRef.current) return;
        queryClient.invalidateQueries('users');
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

  const debouncedApiUpdate = useCallback(
    updates => {
      // Merge updates with pending updates
      pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Show loading toast if not already active
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading('Saving padding...');
      }

      // Set a new timer
      debounceTimerRef.current = setTimeout(async () => {
        const pendingUpdates = pendingUpdatesRef.current;
        pendingUpdatesRef.current = {}; // Clear pending updates

        try {
          const newPaddingValues = {
            headToPicturePadding: pendingUpdates.headToPicture,
            pictureToNamePadding: pendingUpdates.pictureToName,
            betweenCardsPadding: pendingUpdates.betweenCards,
            linkCardHeight: pendingUpdates.cardHeight,
            nameToBioPadding: pendingUpdates.nameToBio,
            bioToSocialPadding: pendingUpdates.bioToSocial,
            pageHorizontalMargin: pendingUpdates.horizontalMargin,
          };

          Object.keys(newPaddingValues).forEach(key => {
            if (newPaddingValues[key] === undefined) {
              delete newPaddingValues[key];
            }
          });

          if (Object.keys(newPaddingValues).length > 0) {
            await axios.patch('/api/users/update', newPaddingValues);
            toast.success('Padding saved successfully!', { id: toastIdRef.current });
            toastIdRef.current = null;

            // Invalidate and wait for refetch of both queries
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ['currentUser'] }),
              queryClient.invalidateQueries({ queryKey: ['users'] }),
              currentUser?.handle &&
                queryClient.invalidateQueries({ queryKey: ['users', currentUser.handle] }),
            ]);

            // Force refetch to ensure we have latest data
            await Promise.all([
              queryClient.refetchQueries({ queryKey: ['currentUser'] }),
              queryClient.refetchQueries({ queryKey: ['users'] }),
              currentUser?.handle &&
                queryClient.refetchQueries({ queryKey: ['users', currentUser.handle] }),
            ]);

            // Signal refresh after queries are refetched
            signalIframe('update_user');
            signalIframe('refresh');
          } else {
            // If no actual values changed, dismiss the loading toast
            if (toastIdRef.current) {
              toast.dismiss(toastIdRef.current);
              toastIdRef.current = null;
            }
          }
        } catch (error) {
          console.error('Error updating padding values:', error);
          if (toastIdRef.current) {
            toast.error('Error saving padding preferences', { id: toastIdRef.current });
            toastIdRef.current = null;
          }
        }
      }, 500);
    },
    [queryClient, currentUser]
  );

  const handlePaddingChange = useCallback(
    async (type, value) => {
      let clampedValue = parseInt(value, 10); // Ensure integer

      if (isNaN(clampedValue)) {
        // Handle cases where parsing might fail, maybe default or return
        clampedValue = type === 'horizontalMargin' ? DEFAULT_HORIZONTAL_MARGIN : 0;
      }

      if (type === 'horizontalMargin') {
        // Clamp between 0 and 40
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
      // Remove signalIframe here since it will be handled after the API update
      debouncedApiUpdate({ [type]: clampedValue });
    },
    [debouncedApiUpdate]
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
      headToPicture: 40,
      pictureToName: 16,
      betweenCards: 16,
      cardHeight: 40,
      nameToBio: 10,
      bioToSocial: 16,
      horizontalMargin: DEFAULT_HORIZONTAL_MARGIN, // Use new default
    };
    setPaddingValues(defaultValues);
    debouncedApiUpdate(defaultValues);
  }, [debouncedApiUpdate]);

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

  // Add handler for stackView toggle
  const handleStackViewChange = async checked => {
    setStackView(checked);
    // Signal both user update and a general refresh
    signalIframe('update_user');
    signalIframe('refresh');

    try {
      const toastId = toast.loading('Updating stack view preference...');
      await axios.patch('/api/users/update', {
        stackView: checked,
      });
      // Invalidate user queries AFTER successful update
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', currentUser?.handle] });
      queryClient.refetchQueries({ queryKey: ['users'] });
      toast.success('Stack view updated', { id: toastId });
    } catch (error) {
      console.error('Error updating stack view:', error);
      toast.error('Failed to update stack view setting');
      // Revert UI state if API call fails
      setStackView(!checked);
      // Optionally signal refresh again on error to reset preview
      signalIframe('refresh');
    }
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

      <div className="mt-4 rounded-2xl border bg-white p-4 w-full h-auto space-y-6">
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
              {getOptionsWithCurrentValue(paddingOptions, paddingValues.headToPicture).map(size => (
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
              {getOptionsWithCurrentValue(paddingOptions, paddingValues.pictureToName).map(size => (
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
              {getOptionsWithCurrentValue(paddingOptions, paddingValues.nameToBio).map(size => (
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

        <div>
          <p className="text-inherit pb-2">
            Bio to Social Icon{' '}
            <span className="text-xs text-blue-500">(negative values = overlap)</span>
          </p>
          <div className="flex space-x-4">
            <select
              value={paddingValues.bioToSocial}
              onChange={e => handlePaddingChange('bioToSocial', parseInt(e.target.value))}
              className="w-1/3 p-2 border rounded-md"
            >
              {getOptionsWithCurrentValue(paddingOptions, paddingValues.bioToSocial).map(size => (
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
                    value={paddingValues.bioToSocial}
                    onChange={e => handlePaddingChange('bioToSocial', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-gray-500 ml-2">500px</span>
              </div>
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded relative">
            <div style={{ height: `${Math.max(0, paddingValues.bioToSocial)}px` }}></div>
            {paddingValues.bioToSocial < 0 && (
              <div
                className="bg-red-200 opacity-40 w-full flex items-center justify-center text-red-600 text-xs font-bold"
                style={{ height: `${Math.abs(paddingValues.bioToSocial)}px` }}
              >
                Overlap: {paddingValues.bioToSocial}px
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-inherit pb-2">Between Link Cards</p>
          <div className="flex space-x-4">
            <select
              value={paddingValues.betweenCards}
              onChange={e => handlePaddingChange('betweenCards', parseInt(e.target.value))}
              className="w-1/3 p-2 border rounded-md"
            >
              {getOptionsWithCurrentValue(
                positivePaddingOptions,
                paddingValues.betweenCards >= 0 ? paddingValues.betweenCards : 0
              ).map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="w-2/3">
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">0px</span>
                <div className="w-full px-1">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="5"
                    value={paddingValues.betweenCards >= 0 ? paddingValues.betweenCards : 0}
                    onChange={e => handlePaddingChange('betweenCards', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-gray-500 ml-2">500px</span>
              </div>
            </div>
          </div>
          <div className="mt-2 bg-gray-100 rounded relative">
            <div
              style={{
                height: `${paddingValues.betweenCards >= 0 ? paddingValues.betweenCards : 0}px`,
              }}
            ></div>
          </div>
        </div>

        <div>
          <p className="text-inherit pb-2">Link Card Height</p>
          <div className="flex space-x-4">
            <select
              value={paddingValues.cardHeight}
              onChange={e => handlePaddingChange('cardHeight', parseInt(e.target.value))}
              className="w-1/3 p-2 border rounded-md"
            >
              {getOptionsWithCurrentValue(cardHeightOptions, paddingValues.cardHeight).map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="w-2/3">
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-2">0px</span>
                <div className="w-full px-1">
                  <input
                    type="range"
                    min="0"
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

        <div>
          <p className="text-inherit pb-2">Page Horizontal Margin</p>
          <div className="flex space-x-4">
            <select
              value={paddingValues.horizontalMargin}
              onChange={e => handlePaddingChange('horizontalMargin', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {validHorizontalMargins.map(size => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 bg-gray-200 rounded flex items-center justify-center h-12">
            <div
              className="bg-blue-300 h-full flex items-center justify-center"
              style={{
                marginLeft: `${paddingValues.horizontalMargin}px`,
                marginRight: `${paddingValues.horizontalMargin}px`,
                width: '100%',
              }}
            >
              <span className="text-xs text-blue-800">
                {paddingValues.horizontalMargin}px each side
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-medium mb-4">Card Layout</h4>
          <div className="flex items-center space-x-2 mb-8">
            <Switch id="stack-view" checked={stackView} onCheckedChange={handleStackViewChange} />
            <Label htmlFor="stack-view" className="font-medium text-gray-800">
              Stack View
            </Label>
            <p className="text-sm text-gray-500 ml-2">
              Display links and content cards in a stacked card view
            </p>
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
