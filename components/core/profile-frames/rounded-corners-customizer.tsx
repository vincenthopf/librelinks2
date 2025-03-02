import React, { useState, useEffect } from 'react';
import { CornerStyle } from './frame-templates/rounded-corners-frame';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface RoundedCornersCustomizerProps {
  cornerStyle: CornerStyle;
  borderRadius: number;
  allCorners: boolean;
  topLeftRadius: number;
  topRightRadius: number;
  bottomLeftRadius: number;
  bottomRightRadius: number;
  onCornerStyleChange: (style: CornerStyle) => void;
  onBorderRadiusChange: (radius: number) => void;
  onAllCornersChange: (allCorners: boolean) => void;
  onTopLeftRadiusChange: (radius: number) => void;
  onTopRightRadiusChange: (radius: number) => void;
  onBottomLeftRadiusChange: (radius: number) => void;
  onBottomRightRadiusChange: (radius: number) => void;
  className?: string;
}

const cornerStyles: { id: CornerStyle; label: string }[] = [
  { id: 'notch', label: 'Notch' },
  { id: 'scoop', label: 'Scoop' },
  { id: 'bevel', label: 'Bevel' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'straight', label: 'Straight' },
  { id: 'round', label: 'Round' },
  { id: 'squircle', label: 'Squircle' },
  { id: 'apple', label: 'Apple' },
];

export const RoundedCornersCustomizer: React.FC<RoundedCornersCustomizerProps> = ({
  cornerStyle,
  borderRadius,
  allCorners,
  topLeftRadius,
  topRightRadius,
  bottomLeftRadius,
  bottomRightRadius,
  onCornerStyleChange,
  onBorderRadiusChange,
  onAllCornersChange,
  onTopLeftRadiusChange,
  onTopRightRadiusChange,
  onBottomLeftRadiusChange,
  onBottomRightRadiusChange,
  className,
}) => {
  // Generate CSS code preview
  const [cssCode, setCssCode] = useState('');

  useEffect(() => {
    let code = '';

    if (allCorners) {
      code = `corner-shape: ${cornerStyle}; border-radius: ${borderRadius}%;`;
    } else {
      code = `corner-shape: ${cornerStyle}; border-radius: ${topLeftRadius}% ${topRightRadius}% ${bottomRightRadius}% ${bottomLeftRadius}%;`;
    }

    setCssCode(code);
  }, [
    cornerStyle,
    borderRadius,
    allCorners,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,
  ]);

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Corner Style Selector */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {cornerStyles.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onCornerStyleChange(id)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  cornerStyle === id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* All Corners Toggle */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="all-corners" className="text-sm font-medium">
            All Corners
          </Label>
          <Switch id="all-corners" checked={allCorners} onCheckedChange={onAllCornersChange} />
        </div>

        {/* Border Radius Slider (All Corners) */}
        {allCorners && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Border Radius</span>
              <span className="text-sm font-medium">{borderRadius}</span>
            </div>
            <Slider
              value={[borderRadius]}
              min={4}
              max={50}
              step={1}
              onValueChange={values => onBorderRadiusChange(values[0])}
              className="w-full"
              ariaLabel="Border radius"
            />
          </div>
        )}
      </div>

      {/* Individual Corner Controls */}
      {!allCorners && (
        <div className="grid grid-cols-2 gap-4">
          {/* Top Left */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Top Left</span>
              <span className="text-sm font-medium">{topLeftRadius}</span>
            </div>
            <Slider
              value={[topLeftRadius]}
              min={4}
              max={50}
              step={1}
              onValueChange={values => onTopLeftRadiusChange(values[0])}
              className="w-full"
              ariaLabel="Top left radius"
            />
          </div>

          {/* Top Right */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Top Right</span>
              <span className="text-sm font-medium">{topRightRadius}</span>
            </div>
            <Slider
              value={[topRightRadius]}
              min={4}
              max={50}
              step={1}
              onValueChange={values => onTopRightRadiusChange(values[0])}
              className="w-full"
              ariaLabel="Top right radius"
            />
          </div>

          {/* Bottom Left */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bottom Left</span>
              <span className="text-sm font-medium">{bottomLeftRadius}</span>
            </div>
            <Slider
              value={[bottomLeftRadius]}
              min={4}
              max={50}
              step={1}
              onValueChange={values => onBottomLeftRadiusChange(values[0])}
              className="w-full"
              ariaLabel="Bottom left radius"
            />
          </div>

          {/* Bottom Right */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bottom Right</span>
              <span className="text-sm font-medium">{bottomRightRadius}</span>
            </div>
            <Slider
              value={[bottomRightRadius]}
              min={4}
              max={50}
              step={1}
              onValueChange={values => onBottomRightRadiusChange(values[0])}
              className="w-full"
              ariaLabel="Bottom right radius"
            />
          </div>
        </div>
      )}

      {/* CSS Code Preview */}
      <div className="space-y-2">
        <div className="p-3 bg-purple-100 rounded-md">
          <code className="text-sm text-purple-800 font-mono">{cssCode}</code>
        </div>
      </div>

      {/* Dimensions Controls */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Dimensions</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Width</span>
              <span className="text-sm font-medium">512</span>
            </div>
            <Slider
              value={[512]}
              min={100}
              max={1024}
              step={1}
              disabled
              className="w-full"
              ariaLabel="Width"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Height</span>
              <span className="text-sm font-medium">512</span>
            </div>
            <Slider
              value={[512]}
              min={100}
              max={1024}
              step={1}
              disabled
              className="w-full"
              ariaLabel="Height"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundedCornersCustomizer;
