import { Link } from '@prisma/client';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { useOptimistic } from 'react';

import { updateLinkOrder } from '@/actions/links';
import { useToast } from '@/components/ui/use-toast';
import { useThemeState } from '@/store/theme'; // Ensure this import is correct if theme comes from here
import { cn } from '@/lib/utils';

import { LinkItem } from './LinkItem';
import { AddLinkButton } from './AddLinkButton';

interface LinksProps {
  linksData: Link[];
}

export function Links({ linksData }: LinksProps) {
  const { toast } = useToast();
  const { theme } = useThemeState(); // Assuming theme state holds linkSpacing
  const [optimisticLinks, setOptimisticLinks] = useOptimistic(
    linksData,
    (state, newLinks: Link[]) => newLinks
  );

  const links = optimisticLinks.sort((a, b) => a.order - b.order);
  const linkSpacing = theme.linkSpacing ?? 0; // Default to 0 if undefined

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(link => link.id === active.id);
      const newIndex = links.findIndex(link => link.id === over.id);
      const newOrder = arrayMove(links, oldIndex, newIndex);

      // Update optimistic state
      setOptimisticLinks(newOrder);

      // Update the server
      const updatePromises = newOrder.map((link, index) => updateLinkOrder(link.id, index));

      try {
        await Promise.all(updatePromises);
        toast({
          title: 'Success',
          description: 'Link order updated successfully.',
        });
      } catch (error) {
        console.error('Failed to update link order:', error);
        toast({
          title: 'Error',
          description: 'Failed to update link order.',
          variant: 'destructive',
        });
        // Optionally revert optimistic update here if needed
      }
    }
  }

  return (
    <div className="space-y-4">
      <AddLinkButton />
      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor),
          useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
        )}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
          {/* Apply dynamic spacing using margin-bottom, except for the last item */}
          {/* Note: Tailwind doesn't directly support space-y-[0px]. We handle spacing via margins. */}
          <div className="flex flex-col">
            {links.map((link, index) => (
              <div
                key={link.id}
                // Apply margin-bottom based on linkSpacing, skip for the last item
                className={cn({
                  [`mb-[${linkSpacing}px]`]: index < links.length - 1 && linkSpacing > 0,
                })}
              >
                <LinkItem link={link} index={index} linkSpacing={linkSpacing} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// Dummy imports for DnD kit sensors and coordinates if not already imported
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Make sure useThemeState and theme structure are correct based on your actual implementation
// Example structure (replace with your actual store/context)
// interface ThemeState {
//   theme: {
//     linkSpacing?: number;
//     // ... other theme properties
//   };
//   // ... other state methods
// }
// const useThemeState = (): ThemeState => ({ theme: { linkSpacing: 4 } }); // Replace with actual hook
