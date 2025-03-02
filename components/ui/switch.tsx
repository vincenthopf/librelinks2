import React from 'react';

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, className = '' }) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
        {checked ? (
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            checked={true}
            onChange={e => onCheckedChange(e.target.checked)}
            aria-checked="true"
            role="switch"
            aria-label={`Toggle ${id}`}
          />
        ) : (
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            checked={false}
            onChange={e => onCheckedChange(e.target.checked)}
            aria-checked="false"
            role="switch"
            aria-label={`Toggle ${id}`}
          />
        )}
        <div
          className={`relative w-11 h-6 rounded-full transition-colors ${
            checked ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        >
          <div
            className={`absolute w-5 h-5 bg-white rounded-full transform transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-1'
            } top-0.5`}
          />
        </div>
      </label>
    </div>
  );
};

export default Switch;
