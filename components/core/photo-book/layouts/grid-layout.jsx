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
const SortablePhoto = ({ photo, index, onPhotoClick, isPublicView }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  });

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
        key={`error-${index}`}
        className="relative bg-gray-200 flex items-center justify-center"
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
      className={`overflow-hidden ${!isPublicView ? 'cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]' : ''}`}
      onClick={isPublicView ? undefined : () => onPhotoClick(photo)}
    >
      <div className="relative overflow-hidden bg-gray-100">
        <CloudinaryImage
          src={photo.url}
          alt={photo.title || 'Photo'}
          width={300}
          height={300}
          preserveAspectRatio={true}
          className="w-full"
        />
        {(photo.title || photo.description) && (
          <div
            className={`absolute inset-0 bg-black ${isPublicView ? 'bg-opacity-0 hover:bg-opacity-40' : 'group-hover:bg-opacity-60 bg-opacity-0'} flex flex-col justify-end p-3 text-white ${isPublicView ? 'opacity-0 hover:opacity-100' : 'group-hover:opacity-100 opacity-0'} transition-all duration-200`}
          >
            {photo.title && <h4 className="font-medium text-sm truncate">{photo.title}</h4>}
            {photo.description && (
              <p className="text-xs mt-1 line-clamp-2 text-gray-200">{photo.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const GridLayout = ({ photos, isPublicView = false, showTitle = false }) => {
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

  return (
    <div className="space-y-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            {items.map((photo, index) => (
              <SortablePhoto
                key={photo.id || index}
                photo={photo}
                index={index}
                onPhotoClick={handlePhotoClick}
                isPublicView={isPublicView}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {!isPublicView && isModalOpen && selectedPhoto && (
        <PhotoEditModal photo={selectedPhoto} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default GridLayout;
