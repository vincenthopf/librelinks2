import { Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import AddLinkModal from '../../shared/modals/add-new-link';
import AddTextModal from '../../shared/modals/add-new-text';
import AddPhotoBookModal from '../../shared/modals/add-new-photo-book';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from './link';
import TextItem from './text-item';
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
import useTexts from '@/hooks/useTexts';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signalIframe } from '@/utils/helpers';
import toast from 'react-hot-toast';
import LinkSkeleton from './link-skeleton';
import { usePhotoBook } from '@/hooks/usePhotoBook';

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

  const { data: userLinks, isLoading: isLinksLoading } = useLinks(userId);
  const { data: userTexts, isLoading: isTextsLoading } = useTexts(userId);
  const queryClient = useQueryClient();

  // Combined items array that includes links, texts, and the photo book item
  const [sortableItems, setSortableItems] = useState([]);

  // Update sortable items when links, texts, or photo book order changes
  useEffect(() => {
    if (!userLinks && !userTexts) return;

    // Create arrays for links and texts (or empty arrays if none)
    const links = userLinks || [];
    const texts = userTexts || [];

    // Combine all items and sort by order
    let allItems = [...links, ...texts].sort((a, b) => a.order - b.order);

    // Check if we should display the photo book item
    // Only show photo book if photoBookOrder is explicitly set (not null/undefined)
    // When a photo book is deleted, photoBookOrder is set to null
    const shouldShowPhotoBook =
      photoBookOrder !== null && photoBookOrder !== undefined;

    if (shouldShowPhotoBook) {
      // Find the correct position for the photo book
      const photoBookPosition = Math.min(photoBookOrder, allItems.length);

      // Split the array and insert the photo book at the correct position
      const itemsBeforePhotoBook = allItems.slice(0, photoBookPosition);
      const itemsAfterPhotoBook = allItems.slice(photoBookPosition);

      // Reconstruct the array with the photo book at the correct position
      setSortableItems([
        ...itemsBeforePhotoBook,
        { id: PHOTO_BOOK_ID, isPhotoBook: true },
        ...itemsAfterPhotoBook,
      ]);
    } else {
      // If photoBookOrder is null or undefined, just use the links and texts
      setSortableItems(allItems);
    }
  }, [userLinks, userTexts, photoBookOrder]);

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
      // A link or text was moved to the position of the photo book
      // Extract only the non-photo book items for updating
      const newLinks = newItems
        .filter((item) => !item.isPhotoBook && !('content' in item))
        .map((link, index) => ({
          ...link,
          order: index,
        }));

      const newTexts = newItems
        .filter((item) => !item.isPhotoBook && 'content' in item)
        .map((text, index) => ({
          ...text,
          order: index,
        }));

      // Find the new photo book order (its index in the new items array)
      const newPhotoBookOrder = newItems.findIndex(
        (item) => item.id === PHOTO_BOOK_ID
      );

      // Update link order, text order, and photo book order
      try {
        // Update links order if there are any links
        if (newLinks.length > 0) {
          await updateLinksOrderMutation.mutateAsync(newLinks);
        }

        // Update texts order if there are any texts
        if (newTexts.length > 0) {
          await updateTextsOrderMutation.mutateAsync(newTexts);
        }

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
      // Item was moved to another item's position
      // Extract the links and texts for updating
      const newLinks = newItems
        .filter((item) => !item.isPhotoBook && !('content' in item))
        .map((link, index) => ({
          ...link,
          order: index,
        }));

      const newTexts = newItems
        .filter((item) => !item.isPhotoBook && 'content' in item)
        .map((text, index) => ({
          ...text,
          order: index,
        }));

      // Update orders
      try {
        // Update links order if there are any links
        if (newLinks.length > 0) {
          await updateLinksOrderMutation.mutateAsync(newLinks);
        }

        // Update texts order if there are any texts
        if (newTexts.length > 0) {
          await updateTextsOrderMutation.mutateAsync(newTexts);
        }
      } catch (error) {
        console.error('Error updating orders:', error);
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

  const updateTextsOrderMutation = useMutation(
    async (newTexts) => {
      await axios.put(`/api/texts`, {
        texts: newTexts,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['texts', currentUser?.id]);
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
        {/* Three buttons container */}
        <div className="grid grid-cols-3 gap-2">
          {/* Add Link Button */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="bg-slate-900 font-medium flex justify-center gap-1 
                items-center h-12 px-4 rounded-3xl text-white hover:bg-slate-700"
              >
                <Plus /> Add Link
              </button>
            </Dialog.Trigger>
            <AddLinkModal />
          </Dialog.Root>

          {/* Add Text Button */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="bg-slate-900 font-medium flex justify-center gap-1 
                items-center h-12 px-4 rounded-3xl text-white hover:bg-slate-700"
              >
                <Plus /> Add Text
              </button>
            </Dialog.Trigger>
            <AddTextModal />
          </Dialog.Root>

          {/* Add Photo Button */}
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="bg-slate-900 font-medium flex justify-center gap-1 
                items-center h-12 px-4 rounded-3xl text-white hover:bg-slate-700"
              >
                <Plus /> Add Photo
              </button>
            </Dialog.Trigger>
            <AddPhotoBookModal />
          </Dialog.Root>
        </div>

        <div className="my-10">
          {!isLinksLoading && !isTextsLoading && sortableItems.length > 0 ? (
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

                // Check if it's a text item (has content property) or a link
                if ('content' in item) {
                  // Render TextItem for text items
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TextItem key={item.id} id={item.id} {...item} />
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
          ) : isLinksLoading || isTextsLoading ? (
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
