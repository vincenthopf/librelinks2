import { Link } from '@prisma/client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { updateLinkActive } from '@/actions/links'; // Assuming this action updates the active state
import { cn } from '@/lib/utils';

import { LinkMenu } from './LinkMenu';

interface LinkItemProps {
  link: Link;
  index: number;
  linkSpacing: number;
}

export function LinkItem({ link, index, linkSpacing }: LinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSwitchChange = async (checked: boolean) => {
    // Optimistically update UI or wait for server confirmation
    try {
      await updateLinkActive(link.id, checked);
      // Optionally show toast or update local state if not handled optimistically
    } catch (error) {
      console.error('Failed to update link active state:', error);
      // Optionally revert UI changes or show error toast
    }
  };

  // Determine border classes based on linkSpacing and index
  const hasZeroSpacing = linkSpacing === 0;
  const isFirstItem = index === 0;

  const borderClass = cn(
    'border-border', // Always apply base border color
    {
      'border-t border-b': !hasZeroSpacing || isFirstItem, // Top and bottom border if spacing > 0 OR it's the first item
      'border-b': hasZeroSpacing && !isFirstItem, // Only bottom border if spacing is 0 and it's not the first item
      'border-t-0': hasZeroSpacing && !isFirstItem, // Explicitly remove top border for subsequent items when spacing is 0 to ensure no overlap
    }
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center justify-between bg-card p-4 rounded-lg shadow', borderClass)}
    >
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5" />
        </Button>
        <div>
          <p className="font-medium">{link.title}</p>
          <p className="text-sm text-muted-foreground">{link.url}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Switch checked={link.active} onCheckedChange={handleSwitchChange} />
        <LinkMenu linkId={link.id} />
      </div>
    </div>
  );
}
