import { Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import AddLinkModal from '../../shared/modals/add-new-link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from './link';
import PhotoBookItem from './photo-book-item';
import useCurrentUser from '@/hooks/useCurrentUser';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import useLinks from '@/hooks/useLinks';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signalIframe } from '@/utils/helpers';
import toast from 'react-hot-toast';
import LinkSkeleton from './link-skeleton';
import usePhotoBook from '@/hooks/usePhotoBook';

// Special ID for the photo book item
const PHOTO_BOOK_ID = 'photo-book-item';

const LinksEditor = () => {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ? currentUser.id : null;
  const photoBookOrder = currentUser?.photoBookOrder || 9999;
  const { photos } = usePhotoBook();
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const { data: userLinks, isLoading } = useLinks(userId);
  const queryClient = useQueryClient();

  // Combined items array that includes links and the photo book item
  const [sortableItems, setSortableItems] = useState([]);

  // Update sortable items when links or photo book order changes
  useEffect(() => {
    if (!userLinks) return;

    // Create a combined array of link IDs and the photo book ID
    // Position the photo book based on the photoBookOrder
    const allItems = [...userLinks];

    // Only include photo book if the user has photos
    if (hasPhotos) {
      // Sort links by order to ensure correct positioning
      const sortedLinks = [...allItems].sort((a, b) => a.order - b.order);

      // Find the correct position for the photo book
      const photoBookPosition = Math.min(photoBookOrder, sortedLinks.length);

      // Split the array and insert the photo book at the correct position
      const itemsBeforePhotoBook = sortedLinks.slice(0, photoBookPosition);
      const itemsAfterPhotoBook = sortedLinks.slice(photoBookPosition);

      // Reconstruct the array with the photo book at the correct position
      setSortableItems([
        ...itemsBeforePhotoBook,
        { id: PHOTO_BOOK_ID, isPhotoBook: true },
        ...itemsAfterPhotoBook,
      ]);
    } else {
      // If no photos, just use the links
      setSortableItems(allItems);
    }
  }, [userLinks, photoBookOrder, hasPhotos]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // If nothing changed, do nothing
    if (!active || !over || active.id === over.id) return;

    // Create a copy of current items
    const oldItems = [...sortableItems];

    // Find indices
    const activeIndex = oldItems.findIndex((item) => item.id === active.id);
    const overIndex = oldItems.findIndex((item) => item.id === over.id);

    // Move the dragged item in the array
    const newItems = arrayMove(oldItems, activeIndex, overIndex);

    // Update UI immediately
    setSortableItems(newItems);

    // Handle reordering based on what was dragged
    if (active.id === PHOTO_BOOK_ID) {
      // Photo book was moved, update its order in the user profile
      const newPhotoBookOrder = overIndex;

      try {
        await toast.promise(
          axios.patch('/api/users/update', {
            photoBookOrder: newPhotoBookOrder,
          }),
          {
            loading: 'Updating photo book position...',
            success: 'Photo book position updated',
            error: 'Failed to update photo book position',
          }
        );

        // Update client-side data
        queryClient.setQueryData(['users'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            photoBookOrder: newPhotoBookOrder,
          };
        });

        // Signal iframe to refresh
        signalIframe();
      } catch (error) {
        console.error('Error updating photo book position:', error);
        // Revert to original state on error
        setSortableItems(oldItems);
      }
    } else if (over.id === PHOTO_BOOK_ID) {
      // A link was moved to the position of the photo book
      // Extract only the links for updating
      const newLinks = newItems
        .filter((item) => !item.isPhotoBook)
        .map((link, index) => ({
          ...link,
          order: index,
        }));

      // Find the new photo book order (its index in the new items array)
      const newPhotoBookOrder = newItems.findIndex(
        (item) => item.id === PHOTO_BOOK_ID
      );

      // Update both link order and photo book order
      try {
        // Update links order
        await updateLinksOrderMutation.mutateAsync(newLinks);

        // Update photo book order
        await axios.patch('/api/users/update', {
          photoBookOrder: newPhotoBookOrder,
        });

        // Update photo book order in client cache
        queryClient.setQueryData(['users'], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            photoBookOrder: newPhotoBookOrder,
          };
        });

        // Signal iframe to refresh
        signalIframe();
      } catch (error) {
        console.error('Error updating orders:', error);
        // Revert to original state on error
        setSortableItems(oldItems);
      }
    } else {
      // Link was moved to another link's position
      // Extract only the links for updating
      const newLinks = newItems
        .filter((item) => !item.isPhotoBook)
        .map((link, index) => ({
          ...link,
          order: index,
        }));

      // Update link order
      try {
        await updateLinksOrderMutation.mutateAsync(newLinks);
      } catch (error) {
        console.error('Error updating link order:', error);
        // Revert to original state on error
        setSortableItems(oldItems);
      }
    }
  };

  const updateLinksOrderMutation = useMutation(
    async (newLinks) => {
      await axios.put(`/api/links`, {
        links: newLinks,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['links', currentUser?.id]);
        signalIframe();
      },
    }
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div className="max-w-[640px] mx-auto my-10">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <div className="">
              <button
                className="bg-slate-900 w-full font-medium flex justify-center gap-1 
                				items-center h-12 px-8 rounded-3xl text-white hover:bg-slate-700"
              >
                <Plus /> Add link
              </button>
            </div>
          </Dialog.Trigger>
          <AddLinkModal />
        </Dialog.Root>

        <div className="my-10">
          {!isLoading && sortableItems.length > 0 ? (
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {sortableItems.map((item) => {
                // Render PhotoBookItem if this is the photo book
                if (item.isPhotoBook) {
                  return (
                    <motion.div
                      key={PHOTO_BOOK_ID}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <PhotoBookItem id={PHOTO_BOOK_ID} />
                    </motion.div>
                  );
                }

                // Render Link for regular links
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link key={item.id} id={item.id} {...item} />
                  </motion.div>
                );
              })}
            </SortableContext>
          ) : isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <LinkSkeleton key={i} />)
          ) : (
            <div className="mt-4 w-[245px] h-auto flex flex-col mx-auto">
              <Image
                className="object-cover"
                width="220"
                height="220"
                alt="not-found"
                src="/assets/not-found.png"
              />
              <h3 className="font-bold text-lg mt-3 text-[#222]">
                You don&apos;t have any links yet
              </h3>
              <p className="text-sm text-[#555] text-center px-3">
                Please click on the button above to add your first link 🚀
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="h-[40px] mb-12" />
    </DndContext>
  );
};

export default LinksEditor;
