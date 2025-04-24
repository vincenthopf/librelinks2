'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutGrid, GripHorizontal } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Size options that match what the BentoCardsView component and utils/bento-helpers.js expect
const BENTO_SIZES = [
  {
    id: 'small',
    size: '1x1',
    span: 'md:col-span-1 md:row-span-1 sm:col-span-1 sm:row-span-1',
    displaySpan: 'col-span-1 row-span-1', // For display in our editor grid
  },
  {
    id: 'medium',
    size: '2x1',
    span: 'md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1',
    displaySpan: 'col-span-2 row-span-1',
  },
  {
    id: 'large',
    size: '2x2',
    span: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2',
    displaySpan: 'col-span-2 row-span-2',
  },
  {
    id: 'wide',
    size: '3x1',
    span: 'md:col-span-3 md:row-span-1 sm:col-span-3 sm:row-span-1',
    displaySpan: 'col-span-3 row-span-1',
  },
  {
    id: 'tall',
    size: '1x2',
    span: 'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2',
    displaySpan: 'col-span-1 row-span-2',
  },
  {
    id: 'featured',
    size: '3x2',
    span: 'md:col-span-3 md:row-span-2 sm:col-span-3 sm:row-span-2',
    displaySpan: 'col-span-3 row-span-2',
  },
];

const BentoLayoutSelector = ({ theme }) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);
  const { photos } = usePhotoBook();
  const [bentoItems, setBentoItems] = useState([]);

  // Initialize bento items from user data or create default items from all available content
  useEffect(() => {
    if (currentUser) {
      // Handle case where currentUser.bentoItems exists but might be a string
      let parsedBentoItems = [];

      try {
        if (currentUser.bentoItems) {
          if (typeof currentUser.bentoItems === 'string') {
            parsedBentoItems = JSON.parse(currentUser.bentoItems);
          } else if (Array.isArray(currentUser.bentoItems)) {
            parsedBentoItems = currentUser.bentoItems;
          }
        }
      } catch (error) {
        console.error('Error parsing bentoItems:', error);
      }

      if (parsedBentoItems.length > 0) {
        setBentoItems(parsedBentoItems);
      } else {
        // Create default bento items from all available content
        const defaultItems = [];

        // Add links as individual items
        if (userLinks) {
          userLinks.forEach((link, index) => {
            if (!link.isSocial && !link.archived) {
              defaultItems.push({
                id: link.id,
                type: 'link',
                span: BENTO_SIZES[0].span, // Use the full responsive span format
                order: index,
              });
            }
          });
        }

        // Add text cards as individual items
        if (userTexts) {
          userTexts.forEach((text, index) => {
            if (!text.archived) {
              defaultItems.push({
                id: text.id,
                type: 'text',
                span: BENTO_SIZES[0].span,
                order: defaultItems.length + index,
              });
            }
          });
        }

        // Add photos as individual items
        if (photos) {
          photos.forEach((photo, index) => {
            defaultItems.push({
              id: photo.id,
              type: 'photo',
              span: BENTO_SIZES[0].span,
              order: defaultItems.length + index,
            });
          });
        }

        setBentoItems(defaultItems);
      }
    }
  }, [currentUser, userLinks, userTexts, photos]);

  // Mutation for updating bento spans
  const updateBentoSpans = useMutation({
    mutationFn: async updatedItems => {
      await axios.post('/api/users/update-bento-spans', { bentoItems: updatedItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Bento layout updated');

      // Force refresh of the preview components
      window.postMessage('refresh', '*');
      window.postMessage('update_user', '*');
    },
    onError: error => {
      console.error('Failed to update bento layout:', error);
      toast.error('Failed to update layout');
    },
  });

  // Handle drag and drop reordering
  const onDragEnd = result => {
    if (!result.destination) return;

    const items = Array.from(bentoItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setBentoItems(updatedItems);
    updateBentoSpans.mutate(updatedItems);
  };

  // Get display span for the editor grid
  const getDisplaySpan = itemSpan => {
    const sizeOption = BENTO_SIZES.find(size => size.span === itemSpan);
    return sizeOption ? sizeOption.displaySpan : 'col-span-1 row-span-1';
  };

  // Update an item's size
  const updateItemSize = (itemId, sizeId) => {
    const sizeOption = BENTO_SIZES.find(s => s.id === sizeId);
    if (!sizeOption) return;

    const updatedItems = bentoItems.map(item =>
      item.id === itemId ? { ...item, span: sizeOption.span } : item
    );

    setBentoItems(updatedItems);
    updateBentoSpans.mutate(updatedItems);
  };

  // Get item preview content
  const getItemPreview = item => {
    const link = userLinks?.find(l => l.id === item.id);
    if (link) {
      // For links
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-100 rounded-lg">
          {link.favicon && (
            <img
              src={link.favicon}
              alt=""
              className="w-6 h-6 mb-2 rounded-sm"
              onError={e => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="text-sm font-medium text-gray-800 text-center">
            {link.title || link.url}
          </div>
        </div>
      );
    }

    const text = userTexts?.find(t => t.id === item.id);
    if (text) {
      // For text cards
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-800 text-center">
            {text.title || 'Text Card'}
          </div>
          {text.content && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-2 text-center">
              {text.content}
            </div>
          )}
        </div>
      );
    }

    const photo = photos?.find(p => p.id === item.id);
    if (photo) {
      // For photos
      return (
        <div className="w-full h-full relative overflow-hidden rounded-lg">
          <img
            src={photo.url}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-xs text-gray-500">No content</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <LayoutGrid size={16} />
          <h3 className="text-lg font-semibold">Bento Grid Layout</h3>
        </div>
        <div>
          <button
            onClick={() => {
              // Trigger explicit refresh
              window.postMessage('refresh', '*');
              window.postMessage('update_user', '*');
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh Preview
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mb-4">
        <p className="text-sm text-gray-600">
          Drag items to reorder them. Hover over an item to access size controls. Changes will
          update in the preview automatically.
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="bento-grid">
          {provided => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-3 auto-rows-[120px] gap-4"
            >
              {bentoItems.map((item, index) => {
                // Get the display span for this item in the editor grid
                const displaySpan = getDisplaySpan(item.span);

                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative ${displaySpan} rounded-lg transition-all group overflow-hidden shadow-sm hover:shadow-md`}
                        style={{
                          ...provided.draggableProps.style,
                          border: `2px solid ${theme?.accent || '#6170F8'}20`,
                        }}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1"
                        >
                          <GripHorizontal size={14} className="text-gray-500" />
                        </div>

                        {/* Content Preview */}
                        {getItemPreview(item)}

                        {/* Size Control Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {BENTO_SIZES.map(size => (
                            <button
                              key={size.id}
                              onClick={() => updateItemSize(item.id, size.id)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                item.span === size.span
                                  ? 'bg-white/30 text-white'
                                  : 'text-white/80 hover:bg-white/20'
                              }`}
                            >
                              {size.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BentoLayoutSelector;
