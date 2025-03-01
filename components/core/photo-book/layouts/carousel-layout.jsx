import { useState, useEffect, useRef } from 'react';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';
import PhotoEditModal from '../photo-edit-modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import usePhotoBook from '@/hooks/usePhotoBook';
import { signalIframe } from '@/utils/helpers';

// Sortable thumbnail component for the carousel
const SortableThumbnail = ({
  photo,
  index,
  currentIndex,
  onThumbnailClick,
  isPublicView,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  if (!photo || !photo.url) {
    console.error('Invalid photo data:', photo);
    return (
      <div
        key={`error-thumbnail-${index}`}
        className="h-16 w-16 flex items-center justify-center bg-gray-200"
      >
        <span className="text-xs text-gray-400">Error</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isPublicView ? {} : listeners)}
      className={`h-16 w-16 ${index === currentIndex ? 'ring-2 ring-blue-500' : ''} ${!isPublicView ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : ''}`}
      onClick={() => onThumbnailClick(index)}
    >
      <div className="w-full h-full relative overflow-hidden">
        <CloudinaryImage
          src={photo.url}
          alt={photo.title || `Photo ${index + 1}`}
          width={100}
          height={100}
          preserveAspectRatio={true}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

const CarouselLayout = ({
  photos,
  isPublicView = false,
  showTitle = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState(photos || []);
  const [isLoading, setIsLoading] = useState(true);
  const mainImageRef = useRef(null);
  const carouselRef = useRef(null);
  const { updatePhoto } = usePhotoBook();

  // Update local state when photos prop changes
  useEffect(() => {
    if (photos && photos.length > 0) {
      setItems(photos);
      // Reset current index if it's out of bounds
      if (currentIndex >= photos.length) {
        setCurrentIndex(0);
      }
    }
  }, [photos]);

  // Handle image load to adjust container size
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before activation
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handlePhotoClick = (photo) => {
    if (isPublicView) return; // Don't open modal in public view

    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    if (!isPublicView) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentIndex, isPublicView]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Find indices of the dragged item and the target
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Create new array with the item moved
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update local state first for immediate UI update
      setItems(newItems);

      // If current index is affected, update it
      if (currentIndex === oldIndex) {
        setCurrentIndex(newIndex);
      } else if (currentIndex === newIndex) {
        setCurrentIndex(oldIndex);
      }

      // Update the order in the database
      try {
        // Update all affected photos with their new order
        const updatePromises = newItems.map((photo, index) =>
          updatePhoto({ id: photo.id, order: index })
        );

        await Promise.all(updatePromises);

        // Signal iframe to update the preview
        signalIframe();
      } catch (error) {
        console.error('Failed to update photo order:', error);
        // Revert to original order if update fails
        setItems(photos);
      }
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No photos to display</p>
      </div>
    );
  }

  const currentPhoto = items[currentIndex];

  return (
    <div className="space-y-4">
      {!isPublicView && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Drag and drop thumbnails to rearrange photos
          </p>
        </div>
      )}

      {/* Main carousel container */}
      <div
        ref={carouselRef}
        className="relative carousel-container bg-gray-100 flex items-center justify-center"
        style={{ minHeight: '300px', width: '100%' }}
      >
        {/* Current image */}
        {currentPhoto && (
          <div
            ref={mainImageRef}
            className="w-full h-full flex items-center justify-center"
            onClick={
              isPublicView ? undefined : () => handlePhotoClick(currentPhoto)
            }
          >
            <div className="w-full max-w-4xl mx-auto relative">
              <CloudinaryImage
                src={currentPhoto.url}
                alt={currentPhoto.title || `Photo ${currentIndex + 1}`}
                width={800}
                height={800}
                preserveAspectRatio={true}
                className={`w-full ${!isPublicView ? 'cursor-pointer' : ''}`}
                onLoad={handleImageLoad}
              />

              {/* Photo info overlay on hover */}
              {(currentPhoto.title || currentPhoto.description) &&
                isPublicView && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex flex-col justify-end p-3 text-white opacity-0 hover:opacity-100 transition-all duration-200">
                    {currentPhoto.title && (
                      <h4 className="font-medium text-sm md:text-base truncate">
                        {currentPhoto.title}
                      </h4>
                    )}
                    {currentPhoto.description && (
                      <p className="text-xs md:text-sm mt-1 line-clamp-2 text-gray-200">
                        {currentPhoto.description}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all"
              aria-label="Previous photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all"
              aria-label="Next photo"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-blue-500 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip for drag and drop - only show when not in public/preview mode */}
      {!isPublicView && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          autoScroll={true}
        >
          <SortableContext
            items={items.map((photo) => photo.id)}
            strategy={rectSortingStrategy}
          >
            <div className="thumbnail-strip flex items-center space-x-2 overflow-x-auto py-2 px-4 bg-gray-50">
              {items.map((photo, index) => (
                <SortableThumbnail
                  key={photo.id || index}
                  photo={photo}
                  index={index}
                  currentIndex={currentIndex}
                  onThumbnailClick={handleThumbnailClick}
                  isPublicView={isPublicView}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!isPublicView && isModalOpen && selectedPhoto && (
        <PhotoEditModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CarouselLayout;
