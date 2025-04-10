import { Plus, GripVertical } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import AddLinkModal from '../../shared/modals/add-new-link';
import AddTextModal from '../../shared/modals/add-new-text';
import AddPhotoBookModal from '../../shared/modals/add-new-photo-book';
import { motion } from 'framer-motion';
import Image from 'next/image';
import LinkItem from './link';
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
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { signalIframe, getApexDomain } from '@/utils/helpers';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import toast from 'react-hot-toast';
import LinkSkeleton from './link-skeleton';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import TooltipWrapper from '@/components/utils/tooltip';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Special ID for the photo book item
const PHOTO_BOOK_ID = 'photo-book-item';

const LinksEditor = () => {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id ? currentUser.id : null;
  const currentPhotoBookOrder = currentUser?.photoBookOrder;
  const { photos } = usePhotoBook();
  const hasPhotos = Array.isArray(photos) && photos.length > 0;

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const { data: userLinks, isLoading: isLinksLoading } = useLinks(userId);
  const { data: userTexts, isLoading: isTextsLoading } = useTexts(userId);
  const queryClient = useQueryClient();

  // State for sortable items (regular links, texts, photo book)
  const [sortableItems, setSortableItems] = useState([]);
  // State for social links (now also sortable within their own context)
  const [socialLinks, setSocialLinks] = useState([]);

  // --- Combined Reorder Mutation ---
  const reorderItemsMutation = useMutation(
    async payload => {
      // Payload structure: { items: [{ id, type, order }], photoBookOrder: N | null }
      await axios.put(`/api/items/reorder`, payload);
    },
    {
      // On successful mutation (backend update succeeded)
      onSuccess: (data, variables) => {
        // Invalidate all relevant queries to refetch the new, consistent state
        // Note: Using invalidateQueries without queryKey will invalidate all queries
        queryClient.invalidateQueries({ queryKey: ['links'] });
        queryClient.invalidateQueries({ queryKey: ['texts'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });

        // Force a hard refresh of the iframe after a slight delay to allow queries to settle
        setTimeout(() => {
          signalIframe('refresh');
        }, 50);

        toast.success('Order updated successfully!');
      },
      // On mutation error (backend update failed)
      onError: (error, variables) => {
        console.error('Error updating item order:', error);
        toast.error(error?.response?.data?.error || 'Failed to update order');

        // Invalidate all to ensure we're synchronized with backend state
        queryClient.invalidateQueries({ queryKey: ['links'] });
        queryClient.invalidateQueries({ queryKey: ['texts'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }
  );

  // Update items state based on fetched data
  useEffect(() => {
    if (!userLinks && !userTexts) return;

    const allLinks = userLinks || [];
    const texts = userTexts || [];

    // Process social links
    const currentSocialLinks = allLinks
      .filter(link => link.isSocial)
      .sort((a, b) => a.order - b.order);
    const regularLinks = allLinks.filter(link => !link.isSocial);
    setSocialLinks(currentSocialLinks);

    // Process regular items (links, texts, photo book)
    let combinedRegularItems = [...regularLinks, ...texts].sort((a, b) => a.order - b.order);

    // Handle photo book
    const shouldShowPhotoBook =
      currentPhotoBookOrder !== null && currentPhotoBookOrder !== undefined && hasPhotos;

    if (shouldShowPhotoBook) {
      // Ensure photo book position is valid
      const photoBookPosition = Math.min(
        Math.max(0, currentPhotoBookOrder),
        combinedRegularItems.length
      );
      const itemsBeforePhotoBook = combinedRegularItems.slice(0, photoBookPosition);
      const itemsAfterPhotoBook = combinedRegularItems.slice(photoBookPosition);

      setSortableItems([
        ...itemsBeforePhotoBook,
        { id: PHOTO_BOOK_ID, isPhotoBook: true },
        ...itemsAfterPhotoBook,
      ]);
    } else {
      setSortableItems(combinedRegularItems);
    }
  }, [userLinks, userTexts, currentPhotoBookOrder, hasPhotos]);

  // Drag handler for regular items (Links, Texts, PhotoBook)
  const handleRegularDragEnd = async event => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldItems = [...sortableItems];
    const activeIndex = oldItems.findIndex(item => item.id === active.id);
    const overIndex = oldItems.findIndex(item => item.id === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      console.error('Could not find dragged item or target item in regular list.');
      return;
    }

    // Create the new array order
    const newItems = arrayMove(oldItems, activeIndex, overIndex);

    // Apply optimistic update to the UI
    setSortableItems(newItems);

    // Track whether photo book exists in our state
    const wasPhotoBookPresent = oldItems.some(item => item.isPhotoBook);
    const isPhotoBookPresent = newItems.some(item => item.isPhotoBook);

    // --- Prepare payload for the API endpoint ---
    const itemsPayload = [];
    let newPhotoBookOrder = null;

    // Process items and capture photo book order
    newItems.forEach((item, index) => {
      if (item.isPhotoBook) {
        newPhotoBookOrder = index;
      } else if ('content' in item) {
        // Text item
        itemsPayload.push({ id: item.id, type: 'text', order: index });
      } else {
        // Regular Link item
        itemsPayload.push({ id: item.id, type: 'link', order: index });
      }
    });

    // If Photo Book was present before but is now missing (this shouldn't happen, but let's handle it)
    if (wasPhotoBookPresent && !isPhotoBookPresent) {
      console.warn('Photo Book was present but is now missing from sortable items.');
      // Rather than set to null (which means "no photo book"), we'll keep the original value
      newPhotoBookOrder = currentPhotoBookOrder;
    }

    // If photo book exists in the state but has no photos, don't update its order
    // This is to prevent issues when the photo book still appears in UI but shouldn't be saved
    if (!hasPhotos && isPhotoBookPresent) {
      console.warn('Photo Book is present in UI but has no photos, keeping original order.');
      newPhotoBookOrder = currentPhotoBookOrder;
    }

    const payload = {
      items: itemsPayload,
      photoBookOrder: newPhotoBookOrder,
    };

    console.log('Sending reorder payload:', payload);

    // Execute the mutation
    reorderItemsMutation.mutate(payload);
  };

  // Drag handler for social links - Keep using the separate endpoint for now
  const handleSocialDragEnd = async event => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldSocialLinks = [...socialLinks];
    const activeIndex = oldSocialLinks.findIndex(link => link.id === active.id);
    const overIndex = oldSocialLinks.findIndex(link => link.id === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      console.error('Could not find dragged social link or target item.');
      return;
    }

    const newSocialLinks = arrayMove(oldSocialLinks, activeIndex, overIndex);
    setSocialLinks(newSocialLinks); // Optimistic update

    const socialLinksToUpdate = newSocialLinks.map((link, index) => ({
      id: link.id,
      order: index,
    }));

    // Call the original link update mutation (or could be refactored to use the new endpoint too)
    try {
      await toast.promise(updateLinksOrderMutation.mutateAsync(socialLinksToUpdate), {
        loading: 'Updating social icon positions...',
        success: 'Social icon positions updated',
        error: 'Failed to update social icon positions',
      });
      signalIframe('refresh');
    } catch (error) {
      console.error('Error updating social link order:', error);
      setSocialLinks(oldSocialLinks);
    }
  };

  // --- Mutations ---

  // Keep this mutation for handleSocialDragEnd (or potentially remove if social also uses the new endpoint)
  const updateLinksOrderMutation = useMutation(
    async linksToUpdate => {
      await axios.put(`/api/links`, { links: linksToUpdate });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['links', userId] });
        // Refresh potentially needed for social links preview?
        signalIframe('refresh');
      },
      onError: error => {
        console.error('Error updating social link order:', error);
        queryClient.invalidateQueries({ queryKey: ['links', userId] });
      },
    }
  );

  // Remove updateTextsOrderMutation - it's handled by reorderItemsMutation
  // const updateTextsOrderMutation = useMutation(...);

  // --- Render Logic ---
  return (
    <div className="max-w-[640px] mx-auto my-10">
      {/* Three buttons container */}
      <div className="grid grid-cols-3 gap-1">
        {/* Add Link Button */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="bg-slate-900 font-medium flex justify-center items-center gap-0 \
              h-9 sm:h-10 px-1 rounded-3xl text-white hover:bg-slate-700 text-[11px] sm:text-xs"
            >
              <Plus size={14} className="mr-0.5 flex-shrink-0" />{' '}
              <span className="truncate">Add Link</span>
            </button>
          </Dialog.Trigger>
          <AddLinkModal />
        </Dialog.Root>

        {/* Add Text Button */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="bg-slate-900 font-medium flex justify-center items-center gap-0 \
              h-9 sm:h-10 px-1 rounded-3xl text-white hover:bg-slate-700 text-[11px] sm:text-xs"
            >
              <Plus size={14} className="mr-0.5 flex-shrink-0" />{' '}
              <span className="truncate">Add Text</span>
            </button>
          </Dialog.Trigger>
          <AddTextModal />
        </Dialog.Root>

        {/* Add Photo Button */}
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="bg-slate-900 font-medium flex justify-center items-center gap-0 \
              h-9 sm:h-10 px-1 rounded-3xl text-white hover:bg-slate-700 text-[11px] sm:text-xs"
            >
              <Plus size={14} className="mr-0.5 flex-shrink-0" />{' '}
              <span className="truncate">Add Photo</span>
            </button>
          </Dialog.Trigger>
          <AddPhotoBookModal />
        </Dialog.Root>
      </div>

      {/* --- Social Icons Section (Sortable) --- */}
      {socialLinks.length > 0 && (
        <div className="my-5">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Social Icons</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSocialDragEnd}
          >
            <SortableContext
              items={socialLinks.map(link => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {socialLinks.map(link => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <LinkItem key={link.id} id={link.id} {...link} />
                </motion.div>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add a horizontal rule if both sections are present */}
      {socialLinks.length > 0 && sortableItems.length > 0 && (
        <hr className="my-6 border-gray-300" />
      )}

      {/* --- Regular Items Section (Sortable) --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleRegularDragEnd} // Use the specific handler
        modifiers={[restrictToVerticalAxis]}
      >
        {/* Add Title for the Cards section if it has content */}
        {sortableItems.length > 0 && (
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Cards</h4>
        )}
        <div className="my-5">
          {/* Render sortable items (regular links, texts, photo book) */}
          {
            !isLinksLoading && !isTextsLoading && sortableItems.length > 0 ? (
              <SortableContext
                items={sortableItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortableItems.map(item => {
                  if (item.isPhotoBook) {
                    return (
                      <motion.div
                        key={PHOTO_BOOK_ID} /* Use constant ID */
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Ensure PhotoBookItem is compatible with useSortable or wrap it */}
                        <PhotoBookItem id={PHOTO_BOOK_ID} />
                      </motion.div>
                    );
                  } else if ('content' in item) {
                    // TextItem
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
                  } else {
                    // Regular LinkItem
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <LinkItem key={item.id} id={item.id} {...item} />
                      </motion.div>
                    );
                  }
                })}
              </SortableContext>
            ) : isLinksLoading || isTextsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <LinkSkeleton key={i} />)
            ) : socialLinks.length === 0 ? ( // Show 'no links' only if BOTH sections are empty
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
            ) : null /* Don't show 'no links' if only regular items are missing but social exist */
          }
        </div>
      </DndContext>
    </div>
  );
};

export default LinksEditor;
