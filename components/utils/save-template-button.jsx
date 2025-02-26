import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SaveTemplateButton = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn(
        'flex items-center gap-1 text-gray-700 hover:text-gray-900',
        className
      )}
      {...props}
    >
      <Save size={16} />
      <span className="hidden sm:inline">Save as Template</span>
    </Button>
  );
});

SaveTemplateButton.displayName = 'SaveTemplateButton';

export default SaveTemplateButton;
