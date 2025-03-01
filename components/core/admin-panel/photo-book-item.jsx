import { useState } from 'react';
import {
  GripVertical,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PhotoBookTab from '@/components/core/photo-book/photo-book-tab';
import { AnimatePresence, motion } from 'framer-motion';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { toast } from 'react-hot-toast';
import { signalIframe } from '@/utils/helpers';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import useCurrentUser from '@/hooks/useCurrentUser';

const PhotoBookItem = ({ id }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { photos, deletePhoto } = usePhotoBook();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  // Get the count of photos in the photo book
  const photoCount = Array.isArray(photos) ? photos.length : 0;

  // Use static title since we don't have these fields in the database
  const photoBookTitle = 'Photo Book';
  const photoBookDescription =
    'Your collection of photos displayed in your chosen layout';

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id, // Use a special ID to represent the photo book
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleExpand = (e) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const handleDeletePhotoBook = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        'Are you sure you want to delete the photo book? This will remove all photos and the photo book section. This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    let hasErrors = false;

    try {
      // Step 1: Delete all photos in the database first
      if (Array.isArray(photos) && photos.length > 0) {
        // Create an array of all delete promises
        const deletePromises = photos.map(async (photo) => {
          try {
            await deletePhoto(photo.id);
            return { success: true };
          } catch (error) {
            console.error('Error deleting photo:', error);
            return { success: false, error };
          }
        });

        // Wait for all delete operations to complete
        const results = await Promise.all(deletePromises);

        // Check if any deletions failed
        hasErrors = results.some((result) => !result.success);
      }

      // Step 2: Remove the photo book section by setting photoBookOrder to null
      // NOTE: We're only setting photoBookOrder to null because photoBookTitle and photoBookDescription
      // are not in the database schema
      await axios.patch('/api/users/update', {
        photoBookOrder: null,
        // Removed fields that don't exist in the schema
      });

      // Step 3: Force refresh all related queries to ensure UI updates
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['photobook', currentUser?.id]);

      // Step 4: Show appropriate toast message based on results
      if (hasErrors) {
        toast.error(
          'Some photos could not be deleted, but the photo book section was removed'
        );
      } else if (photoCount > 0) {
        toast.success('Photo book and all photos removed successfully');
      } else {
        toast.info('Photo book section removed');
      }

      // Step 5: Signal iframe to refresh
      signalIframe();
    } catch (error) {
      console.error('Error removing photo book:', error);
      toast.error('Failed to remove photo book');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg drop-shadow-md my-5 overflow-hidden"
    >
      {/* Header section */}
      <div className="flex items-center p-2">
        <div
          className="text-gray-400 text-sm hover:bg-blue-100 rounded-sm p-[3px]"
          {...attributes}
          {...listeners}
        >
          <GripVertical color="grey" size={17} />
        </div>
        {/* Photo Book Icon */}
        <div className="h-10 w-10 flex justify-center items-center bg-blue-100 rounded-full">
          <ImageIcon size={20} color="#4F46E5" />
        </div>
        <div className="flex-1 p-2 h-full relative">
          <div className="flex">
            <div className="w-full pr-3">
              <div className="grid mb-1 w-full grid-cols-[minmax(0,_90%)] items-baseline">
                <div className="w-full row-start-1 col-start-1 items-center">
                  <div className="flex items-center max-w-full rounded-[2px] outline-offset-2 outline-2 gap-2 lg:gap-4">
                    <p className="w-fit text-gray-900 font-semibold">
                      {photoBookTitle}
                    </p>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </div>

                <div className="">
                  <div className="row-start-1 col-start-1 inline-flex">
                    <p className="text-gray-500 text-sm">
                      {photoBookDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeletePhotoBook}
                disabled={isDeleting}
                className="group rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 hover:bg-red-100 active:scale-95"
                title="Delete photo book section"
              >
                <Trash2 className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
              </button>
              <button
                onClick={toggleExpand}
                className="group rounded-full bg-gray-100 p-1.5 transition-all duration-75 hover:scale-105 hover:bg-blue-100 active:scale-95"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t"
          >
            <div className="p-4">
              <PhotoBookTab embedded={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoBookItem;
