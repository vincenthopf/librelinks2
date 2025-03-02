import React, { useState, useCallback, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { TransformControls } from './frame-transformations';
import { FrameTemplate, FrameSelector } from './frame-selector';
import { FrameAnimation, FRAME_ANIMATION_PRESETS, FrameAnimationType } from './frame-animations';
import { RoundedCornersCustomizer } from './rounded-corners-customizer';
import { CornerStyle } from './frame-templates/rounded-corners-frame';
import debounce from 'lodash/debounce';

interface FrameCustomizerProps {
  template: FrameTemplate;
  color: string;
  thickness: number;
  rotation: number;
  pictureRotation: number;
  syncRotation: boolean;
  animation: FrameAnimation;
  name: string;
  cornerStyle?: CornerStyle;
  borderRadius?: number;
  allCorners?: boolean;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  width?: number;
  height?: number;
  onTemplateChange: (template: FrameTemplate) => void;
  onColorChange: (color: string) => void;
  onThicknessChange: (thickness: number) => void;
  onRotationChange: (rotation: number) => void;
  onPictureRotationChange: (rotation: number) => void;
  onSyncRotationChange: (sync: boolean) => void;
  onAnimationChange: (animation: FrameAnimation) => void;
  onCornerStyleChange?: (style: CornerStyle) => void;
  onBorderRadiusChange?: (radius: number) => void;
  onAllCornersChange?: (allCorners: boolean) => void;
  onTopLeftRadiusChange?: (radius: number) => void;
  onTopRightRadiusChange?: (radius: number) => void;
  onBottomLeftRadiusChange?: (radius: number) => void;
  onBottomRightRadiusChange?: (radius: number) => void;
  onWidthChange?: (width: number) => void;
  onHeightChange?: (height: number) => void;
  className?: string;
}

const THICKNESS_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export const FrameCustomizer: React.FC<FrameCustomizerProps> = ({
  template,
  color,
  thickness,
  rotation,
  pictureRotation,
  syncRotation,
  animation,
  name,
  cornerStyle = 'squircle',
  borderRadius = 20,
  allCorners = true,
  topLeftRadius = 20,
  topRightRadius = 20,
  bottomLeftRadius = 20,
  bottomRightRadius = 20,
  width = 512,
  height = 512,
  onTemplateChange,
  onColorChange,
  onThicknessChange,
  onRotationChange,
  onPictureRotationChange,
  onSyncRotationChange,
  onAnimationChange,
  onCornerStyleChange,
  onBorderRadiusChange,
  onAllCornersChange,
  onTopLeftRadiusChange,
  onTopRightRadiusChange,
  onBottomLeftRadiusChange,
  onBottomRightRadiusChange,
  onWidthChange,
  onHeightChange,
  className,
}) => {
  const [isUpdatingSync, setIsUpdatingSync] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const [localFrameRotation, setLocalFrameRotation] = useState(rotation);
  const [localPictureRotation, setLocalPictureRotation] = useState(pictureRotation);

  // Update local state when props change
  useEffect(() => {
    setLocalFrameRotation(rotation);
    setLocalPictureRotation(pictureRotation);
  }, [rotation, pictureRotation]);

  // Create memoized debounced functions
  const debouncedColorChange = useCallback(
    (newColor: string) => {
      debounce((value: string) => {
        onColorChange(value);
      }, 300)(newColor);
    },
    [onColorChange]
  );

  const debouncedFrameRotationChange = useCallback(
    (newRotation: number) => {
      debounce((value: number) => {
        onRotationChange(value);
      }, 300)(newRotation);
    },
    [onRotationChange]
  );

  const debouncedPictureRotationChange = useCallback(
    (newRotation: number) => {
      debounce((value: number) => {
        onPictureRotationChange(value);
      }, 300)(newRotation);
    },
    [onPictureRotationChange]
  );

  // Local update handlers
  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    debouncedColorChange(newColor);
  };

  const handleFrameTransformChange = (transformations: { rotation: number }) => {
    const newRotation = transformations.rotation;
    setLocalFrameRotation(newRotation);
    onRotationChange(newRotation); // Remove debounce for immediate update

    // If sync is enabled, update picture rotation immediately
    if (syncRotation) {
      setLocalPictureRotation(newRotation);
      onPictureRotationChange(newRotation);
    }
  };

  const handlePictureTransformChange = (transformations: { rotation: number }) => {
    const newRotation = transformations.rotation;
    setLocalPictureRotation(newRotation);
    onPictureRotationChange(newRotation); // Remove debounce for immediate update
  };

  const handleSyncChange = async () => {
    setIsUpdatingSync(true);
    try {
      const newSyncState = !syncRotation;
      await onSyncRotationChange(newSyncState);

      // If enabling sync, update picture rotation to match frame immediately
      if (newSyncState) {
        const newRotation = localFrameRotation;
        setLocalPictureRotation(newRotation);
        onPictureRotationChange(newRotation);
      }
    } finally {
      setIsUpdatingSync(false);
    }
  };

  const handleAnimationSelect = (type: FrameAnimationType) => {
    onAnimationChange(FRAME_ANIMATION_PRESETS[type]);
  };

  // Add this section to render the rounded corners customizer
  const renderFrameSpecificControls = () => {
    if (
      template === 'rounded-corners' &&
      onCornerStyleChange &&
      onBorderRadiusChange &&
      onAllCornersChange &&
      onTopLeftRadiusChange &&
      onTopRightRadiusChange &&
      onBottomLeftRadiusChange &&
      onBottomRightRadiusChange &&
      onWidthChange &&
      onHeightChange
    ) {
      return (
        <RoundedCornersCustomizer
          cornerStyle={cornerStyle}
          borderRadius={borderRadius}
          allCorners={allCorners}
          topLeftRadius={topLeftRadius}
          topRightRadius={topRightRadius}
          bottomLeftRadius={bottomLeftRadius}
          bottomRightRadius={bottomRightRadius}
          width={width}
          height={height}
          onCornerStyleChange={onCornerStyleChange}
          onBorderRadiusChange={onBorderRadiusChange}
          onAllCornersChange={onAllCornersChange}
          onTopLeftRadiusChange={onTopLeftRadiusChange}
          onTopRightRadiusChange={onTopRightRadiusChange}
          onBottomLeftRadiusChange={onBottomLeftRadiusChange}
          onBottomRightRadiusChange={onBottomRightRadiusChange}
          onWidthChange={onWidthChange}
          onHeightChange={onHeightChange}
          className="mt-6"
        />
      );
    }
    return null;
  };

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Frame Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Style</h3>
        <FrameSelector
          selectedTemplate={template}
          color={color}
          thickness={thickness}
          name={name}
          onSelect={onTemplateChange}
        />
      </div>

      {/* Frame-specific controls - MOVED HERE */}
      {template === 'rounded-corners' && renderFrameSpecificControls()}

      {/* Color and Thickness Controls */}
      {template !== 'none' && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Color Picker */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Color</h3>
            <div className="flex items-start gap-4">
              <HexColorPicker
                color={localColor}
                onChange={handleColorChange}
                className="!w-[200px]"
              />
              <div className="flex flex-col gap-2">
                <div
                  className="w-12 h-12 rounded-lg border shadow-sm"
                  style={{ backgroundColor: localColor }}
                  title="Current color"
                />
                <input
                  type="text"
                  value={localColor}
                  onChange={e => handleColorChange(e.target.value)}
                  className="w-20 text-sm border rounded px-2 py-1"
                  title="Color hex value"
                />
              </div>
            </div>
          </div>

          {/* Frame Thickness */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Thickness</h3>
            <div className="flex items-start">
              <select
                value={thickness}
                onChange={e => {
                  const value = parseInt(e.target.value, 10);
                  onThicknessChange(value);
                }}
                className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                title="Select frame thickness"
              >
                {THICKNESS_OPTIONS.map(value => (
                  <option key={value} value={value}>
                    {value}px
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Controls */}
      {template !== 'none' && (
        <>
          {/* Sync Rotation Toggle */}
          <div className="flex items-center justify-between py-4 border-b">
            <span className="text-sm font-medium text-gray-700">
              Sync Frame and Picture Rotation
            </span>
            <button
              onClick={handleSyncChange}
              disabled={isUpdatingSync}
              title={syncRotation ? 'Disable rotation sync' : 'Enable rotation sync'}
              aria-label={syncRotation ? 'Disable rotation sync' : 'Enable rotation sync'}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none
                ${isUpdatingSync ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{ backgroundColor: syncRotation ? '#2563eb' : '#d1d5db' }}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                  ring-0 transition duration-200 ease-in-out
                  ${isUpdatingSync ? 'animate-pulse' : ''}
                `}
                style={{
                  transform: `translateX(${syncRotation ? '20px' : '0px'})`,
                }}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Frame Rotation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Rotation</h3>
            <TransformControls
              transformations={{ rotation: localFrameRotation }}
              onChange={handleFrameTransformChange}
            />
          </div>

          {/* Picture Rotation (only shown when not synced) */}
          {!syncRotation && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Picture Rotation</h3>
              <TransformControls
                transformations={{ rotation: localPictureRotation }}
                onChange={handlePictureTransformChange}
              />
            </div>
          )}
        </>
      )}

      {/* Animation Selection */}
      {template !== 'none' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frame Animation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(FRAME_ANIMATION_PRESETS) as FrameAnimationType[]).map(type => (
              <button
                key={type}
                onClick={() => handleAnimationSelect(type)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                  ${
                    animation.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
