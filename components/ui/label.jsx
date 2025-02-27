import React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef(
  ({ className, htmlFor, children, required, disabled, ...props }, ref) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          'text-sm font-medium text-gray-700 block mb-1.5',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
