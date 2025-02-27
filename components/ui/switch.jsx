import React from 'react';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef(
  (
    { className, id, checked, onCheckedChange, disabled = false, ...props },
    ref
  ) => {
    // Handle keyboard interaction
    const handleKeyDown = (event) => {
      if (disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-blue-600' : 'bg-gray-200',
          className
        )}
        onClick={() => !disabled && onCheckedChange(!checked)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        ref={ref}
        {...props}
      >
        <span className="sr-only">{checked ? 'On' : 'Off'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
            'transform transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
