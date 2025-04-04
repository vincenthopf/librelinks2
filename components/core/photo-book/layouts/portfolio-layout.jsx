import { useState, useEffect } from 'react';
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
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { signalIframe } from '@/utils/helpers';

// Sortable photo item component
const SortablePhoto = ({ photo, onPhotoClick, isPublicView }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    height: '100%',
  };

  if (!photo || !photo.url) {
    console.error('Invalid photo data:', photo);
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center`}
        style={{ minHeight: '200px' }}
      >
        <span className="text-gray-400">Photo unavailable</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isPublicView ? {} : listeners)}
      className={`${!isPublicView ? 'cursor-grab active:cursor-grabbing hover:opacity-95 transition-opacity' : ''} bg-gray-100 h-full`}
      onClick={isPublicView ? undefined : () => onPhotoClick(photo)}
    >
      <div className={`relative w-full overflow-hidden h-full`}>
        <CloudinaryImage
          src={photo.url}
          alt={photo.title || 'Photo'}
          width={800}
          height={800}
          preserveAspectRatio={true}
          className="w-full h-full object-cover"
        />
        {(photo.title || photo.description) && isPublicView && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex flex-col justify-end p-3 text-white opacity-0 hover:opacity-100 transition-all duration-200">
            {photo.title && (
              <h4 className="font-medium text-sm md:text-base truncate">{photo.title}</h4>
            )}
            {photo.description && (
              <p className="text-xs md:text-sm mt-1 line-clamp-2 text-gray-200">
                {photo.description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PortfolioLayout = ({ photos, isPublicView = false, showTitle = true }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState(photos || []);
  const { updatePhoto } = usePhotoBook();

  // Update local state when photos prop changes
  useEffect(() => {
    if (photos && photos.length > 0) {
      setItems(photos);
    }
  }, [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before activation
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handlePhotoClick = photo => {
    if (isPublicView) return; // Don't open modal in public view

    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleDragEnd = async event => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Find indices of the dragged item and the target
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      // Create new array with the item moved
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update local state first for immediate UI update
      setItems(newItems);

      // Update the order in the database
      try {
        // Update all affected photos with their new order
        const updatePromises = newItems.map((photo, index) =>
          updatePhoto({ id: photo.id, order: index })
        );

        await Promise.all(updatePromises);
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

  // Create groups of photos for the asymmetrical grid
  const createPhotoGroups = photoList => {
    // Ensure photoList is an array
    if (!Array.isArray(photoList)) {
      console.error('photoList is not an array:', photoList);
      return [];
    }

    // Filter out invalid photos first
    const validPhotos = photoList.filter(photo => photo && photo.url);

    if (validPhotos.length === 0) {
      return [];
    }

    if (validPhotos.length <= 2) {
      return [
        {
          type: 'pattern4',
          photos: validPhotos,
        },
      ]; // Single group for 1-2 photos
    }

    // Initialize groups array
    const groups = [];
    let currentIndex = 0;

    // Create groups of various patterns
    while (currentIndex < validPhotos.length) {
      const remainingPhotos = validPhotos.length - currentIndex;

      if (remainingPhotos >= 7) {
        // Pattern 1: 3-3-1 grid (7 photos)
        groups.push({
          type: 'pattern1',
          photos: validPhotos.slice(currentIndex, currentIndex + 7),
        });
        currentIndex += 7;
      } else if (remainingPhotos >= 5) {
        // Pattern 2: 2-2-1 grid (5 photos)
        groups.push({
          type: 'pattern2',
          photos: validPhotos.slice(currentIndex, currentIndex + 5),
        });
        currentIndex += 5;
      } else if (remainingPhotos >= 3) {
        // Pattern 3: 2-1 grid (3 photos)
        groups.push({
          type: 'pattern3',
          photos: validPhotos.slice(currentIndex, currentIndex + 3),
        });
        currentIndex += 3;
      } else {
        // Pattern 4: Just show remaining photos in a row
        groups.push({
          type: 'pattern4',
          photos: validPhotos.slice(currentIndex, validPhotos.length),
        });
        currentIndex = validPhotos.length;
      }
    }

    return groups;
  };

  // Render a specific pattern group
  const renderPatternGroup = group => {
    if (!group || !group.photos) {
      console.error('Invalid group data:', group);
      return null; // Return null for invalid groups
    }

    const { type, photos: groupPhotos } = group;

    // Ensure groupPhotos is always an array
    if (!Array.isArray(groupPhotos)) {
      console.error('groupPhotos is not an array:', groupPhotos);
      return null;
    }

    if (type === 'pattern1') {
      // 3-3-1 layout (7 photos)
      return (
        <div className="mb-1">
          <div className="flex flex-wrap">
            {/* Feature large photo on left */}
            <div className="w-full md:w-1/2 p-0.5">{renderPhoto(groupPhotos[0])}</div>
            {/* 2x2 grid on right */}
            <div className="w-full md:w-1/2 p-0.5">
              <div className="flex flex-wrap h-full">
                <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[1])}</div>
                <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[2])}</div>
                <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[3])}</div>
                <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[4])}</div>
              </div>
            </div>
          </div>
          {/* Bottom row with 2 photos */}
          <div className="flex flex-wrap">
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[5])}</div>
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[6])}</div>
          </div>
        </div>
      );
    } else if (type === 'pattern2') {
      // 2-2-1 layout (5 photos)
      return (
        <div className="mb-1">
          <div className="flex flex-wrap">
            {/* Top row with 2 photos */}
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[0])}</div>
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[1])}</div>
          </div>
          <div className="flex flex-wrap">
            {/* Bottom row with 3 photos */}
            <div className="w-2/3 p-0.5">{renderPhoto(groupPhotos[2])}</div>
            <div className="w-1/3 p-0.5">
              <div className="h-1/2 p-0.5 pb-0">{renderPhoto(groupPhotos[3])}</div>
              <div className="h-1/2 p-0.5 pt-0">{renderPhoto(groupPhotos[4])}</div>
            </div>
          </div>
        </div>
      );
    } else if (type === 'pattern3') {
      // 2-1 layout (3 photos)
      return (
        <div className="mb-1">
          <div className="flex flex-wrap">
            {/* Top row with 1 large photo */}
            <div className="w-full p-0.5">{renderPhoto(groupPhotos[0])}</div>
          </div>
          <div className="flex flex-wrap">
            {/* Bottom row with 2 photos */}
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[1])}</div>
            <div className="w-1/2 p-0.5">{renderPhoto(groupPhotos[2])}</div>
          </div>
        </div>
      );
    } else {
      // 1 photo or other fallback
      return (
        <div className="mb-1">
          <div className="flex flex-wrap">
            {groupPhotos &&
              groupPhotos.map((photo, index) => (
                <div
                  key={index}
                  className={`w-full ${groupPhotos.length === 2 ? 'md:w-1/2' : ''} p-0.5`}
                >
                  {renderPhoto(photo)}
                </div>
              ))}
          </div>
        </div>
      );
    }
  };

  // Render an individual photo
  const renderPhoto = photo => {
    if (!photo || !photo.url) {
      console.error('Invalid photo data:', photo);
      return (
        <div
          className={`bg-gray-200 flex items-center justify-center`}
          style={{ minHeight: '200px' }}
        >
          <span className="text-gray-400">Photo unavailable</span>
        </div>
      );
    }

    return (
      <SortablePhoto photo={photo} onPhotoClick={handlePhotoClick} isPublicView={isPublicView} />
    );
  };

  // Create groups based on the photos we have
  const photoGroups = createPhotoGroups(items);

  return (
    <div className="space-y-2">
      {!isPublicView && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">Drag and drop photos to rearrange them</p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        // Disable drag and drop in public view
        autoScroll={!isPublicView}
      >
        <SortableContext
          items={items.map(photo => photo.id)}
          strategy={rectSortingStrategy}
          disabled={isPublicView}
        >
          {photoGroups.map((group, index) => (
            <div key={index}>{renderPatternGroup(group)}</div>
          ))}
        </SortableContext>
      </DndContext>

      {!isPublicView && isModalOpen && selectedPhoto && (
        <PhotoEditModal photo={selectedPhoto} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default PortfolioLayout;
