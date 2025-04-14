import React, { useState, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import debounce from 'lodash/debounce';

interface ColorSpectrumSelectorProps {
  initialColor: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorSpectrumSelector: React.FC<ColorSpectrumSelectorProps> = ({
  initialColor,
  onChange,
  label,
}) => {
  const [localColor, setLocalColor] = useState(initialColor);
  const [previousColor, setPreviousColor] = useState(
    initialColor !== 'transparent' ? initialColor : '#000000'
  );
  const isTransparent = localColor === 'transparent';

  // Debounce the onChange callback to prevent too many updates
  const debouncedOnChange = useCallback(
    debounce((color: string) => {
      onChange(color);
    }, 100),
    [onChange]
  );

  useEffect(() => {
    // Always log the change for debugging
    console.log(
      `ColorSpectrumSelector (${label}) - initialColor changed to: ${initialColor}, current localColor: ${localColor}`
    );

    // For Embed Background, always update when initialColor changes
    if (label?.includes('Embed Background')) {
      console.log(`📢 Embed Background update: ${initialColor}`);

      // Special handling for embed background
      setLocalColor(initialColor);

      // Remember non-transparent colors for "Switch to Color" functionality
      if (initialColor !== 'transparent') {
        setPreviousColor(initialColor);
      }
      return;
    }

    // For other color pickers, maintain the existing logic
    if (localColor !== 'transparent') {
      // Not transparent, so update from props
      setLocalColor(initialColor);

      // Remember the non-transparent color
      if (initialColor !== 'transparent') {
        setPreviousColor(initialColor);
      }
    } else if (initialColor === 'transparent') {
      // Both are transparent, maintain transparency
      setLocalColor('transparent');
    }
    // If local is transparent and initialColor is not, we keep the transparent setting
  }, [initialColor, label]); // Remove localColor from dependencies to prevent circular updates

  const handleColorChange = (color: string) => {
    // If currently transparent, setting a color makes it non-transparent
    setLocalColor(color);

    // Remember this color for when we switch back from transparent
    setPreviousColor(color);

    debouncedOnChange(color);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Don't allow editing if transparent
    if (isTransparent) return;

    // Allow '#' or hex code
    if (value === '#' || /^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setLocalColor(value);
      if (value.length === 7) {
        // Store as previous color if it's a complete hex
        setPreviousColor(value);
        debouncedOnChange(value);
      }
    } else if (value.toLowerCase() === 'transparent') {
      // Allow typing 'transparent' only if not already transparent
      if (!isTransparent) {
        handleSetTransparent();
      }
    }
  };

  // Function to handle setting the color to transparent
  const handleSetTransparent = () => {
    // No need to update previousColor here since we're switching to transparent
    setLocalColor('transparent');
    // Call onChange immediately, bypassing debounce for transparency
    onChange('transparent');
    // Cancel any pending debounced calls to avoid conflicts
    debouncedOnChange.cancel();
  };

  // Function to switch back from transparent to a color
  const handleClearTransparent = () => {
    // Use the previously selected color instead of always white
    setLocalColor(previousColor);
    onChange(previousColor);
    debouncedOnChange.cancel();
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      </div>
      <div className="flex items-start gap-4">
        <HexColorPicker
          color={isTransparent ? '#ffffff' : localColor} // Show white in picker if transparent
          onChange={handleColorChange}
          className={`!w-[200px] ${isTransparent ? 'opacity-50 cursor-not-allowed' : ''}`} // Dim picker if transparent
          style={{ pointerEvents: isTransparent ? 'none' : 'auto' }} // Disable picker interaction if transparent
        />
        <div className="flex flex-col gap-2">
          <div
            className="w-12 h-12 rounded-lg border shadow-sm relative overflow-hidden" // Added relative/overflow
            style={{
              backgroundColor: isTransparent ? 'white' : localColor, // Show white bg if transparent
            }}
            title="Current color"
          >
            {/* Add checkerboard pattern for transparency */}
            {isTransparent && (
              <div
                className="absolute inset-0 bg-repeat"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '10px 10px',
                  backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                }}
              />
            )}
          </div>
          <input
            type="text"
            value={localColor} // Show 'transparent' or hex
            onChange={handleHexInputChange}
            className={`w-20 text-sm border rounded px-2 py-1 ${isTransparent ? 'text-gray-500 italic' : ''}`}
            placeholder={isTransparent ? 'transparent' : '#000000'}
            title="Color hex value or click below to set transparent"
            readOnly={isTransparent} // Make input read-only when transparent
          />
          {/* Transparency toggle buttons */}
          {!isTransparent ? (
            <button
              onClick={handleSetTransparent}
              className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded mt-1 flex items-center justify-center"
              title="Set color to transparent"
            >
              Switch to Transparent
            </button>
          ) : (
            <button
              onClick={handleClearTransparent}
              className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded mt-1 flex items-center justify-center"
              title="Switch back to color mode"
            >
              Switch to Color
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorSpectrumSelector;
