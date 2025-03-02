import React from 'react';

interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step?: number;
  onValueChange: (values: number[]) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onValueChange,
  disabled = false,
  className = '',
  ariaLabel = 'Slider',
}) => {
  const percentage = ((value[0] - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onValueChange([newValue]);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-purple-600 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        aria-label={ariaLabel}
      />
      <div
        className="absolute w-4 h-4 bg-white border-2 border-purple-600 rounded-full -mt-1 transform -translate-y-1/2"
        style={{ left: `${percentage}%`, top: '50%' }}
      />
    </div>
  );
};

export default Slider;
