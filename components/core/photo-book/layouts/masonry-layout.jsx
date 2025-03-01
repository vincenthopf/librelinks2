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
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { signalIframe } from '@/utils/helpers';

// Sortable photo item component
const SortablePhoto = ({
  photo,
  index,
  columnIndex,
  onPhotoClick,
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
      <div key={`error-${index}-${columnIndex}`} className="p-1">
        <div className="bg-gray-200 h-[200px] flex items-center justify-center">
          <span className="text-gray-400">Photo unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isPublicView ? {} : listeners)}
      className="p-1"
    >
      <div
        className={`${!isPublicView ? 'cursor-grab active:cursor-grabbing hover:opacity-95 transition-opacity' : ''} bg-gray-100 h-full`}
        onClick={isPublicView ? undefined : () => onPhotoClick(photo)}
      >
        <div className={`relative w-full overflow-hidden`}>
          <CloudinaryImage
            src={photo.url}
            alt={photo.title || 'Photo'}
            width={600}
            height={600}
            preserveAspectRatio={true}
            className="w-full"
          />

          {(photo.title || photo.description) && isPublicView && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 flex flex-col justify-end p-3 text-white opacity-0 hover:opacity-100 transition-all duration-200">
              {photo.title && (
                <h4 className="font-medium text-sm md:text-base truncate">
                  {photo.title}
                </h4>
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
    </div>
  );
};

const MasonryLayout = ({ photos, isPublicView = false, showTitle = false }) => {
  const [columns, setColumns] = useState(2);
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

  // Adjust columns based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

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

  // Create masonry columns with varied heights
  const createMasonryColumns = (photoList, colCount) => {
    // Create empty columns
    const cols = Array.from({ length: colCount }, () => []);

    // Assign photos to columns in a round-robin fashion
    // This works better when we're preserving aspect ratios
    photoList.forEach((photo, index) => {
      const colIndex = index % colCount;
      cols[colIndex].push(photo);
    });

    return cols;
  };

  // Create the masonry columns
  const masonryColumns = createMasonryColumns(items, columns);

  return (
    <div className="space-y-4">
      {!isPublicView && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Drag and drop photos to rearrange them
          </p>
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
          items={items.map((photo) => photo.id)}
          strategy={rectSortingStrategy}
          disabled={isPublicView}
        >
          <div className="flex flex-wrap -mx-1">
            {masonryColumns.map((columnPhotos, columnIndex) => (
              <div
                key={columnIndex}
                className={`w-full ${
                  columns === 1 ? '' : columns === 2 ? 'md:w-1/2' : 'md:w-1/3'
                } px-1`}
              >
                <div className="flex flex-col space-y-1">
                  {columnPhotos.map((photo, photoIndex) => (
                    <SortablePhoto
                      key={photo.id || `${columnIndex}-${photoIndex}`}
                      photo={photo}
                      index={photoIndex}
                      columnIndex={columnIndex}
                      onPhotoClick={handlePhotoClick}
                      isPublicView={isPublicView}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

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

export default MasonryLayout;
