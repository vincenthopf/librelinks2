'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LayoutGrid, GripHorizontal } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useCurrentUser from '@/hooks/useCurrentUser';
import useLinks from '@/hooks/useLinks';
import useTexts from '@/hooks/useTexts';
import { usePhotoBook } from '@/hooks/usePhotoBook';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SPAN_OPTIONS } from '@/utils/bento-helpers'; // Import standard span options

// Use the standard SPAN_OPTIONS from bento-helpers
const BENTO_SIZES = SPAN_OPTIONS.map(option => ({
  id: option.id,
  size: option.size,
  span: option.span, // Use the full responsive span string
}));

// --- Size Selector Popover Component ---
const SizeSelectorPopover = ({ currentSpan, onSizeSelect, onClose }) => {
  const popoverRef = useRef(null);
  const maxCols = 3;
  const maxRows = 3;

  // Get current dimensions from span string
  const getCurrentDims = () => {
    const colMatch = currentSpan.match(/col-span-(\d+)/);
    const rowMatch = currentSpan.match(/row-span-(\d+)/);
    return {
      cols: colMatch ? parseInt(colMatch[1], 10) : 1,
      rows: rowMatch ? parseInt(rowMatch[1], 10) : 1,
    };
  };
  const currentDims = getCurrentDims();

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleCellClick = (cols, rows) => {
    // Find the BENTO_SIZES entry matching the selected dimensions
    const targetSizeString = `${cols}x${rows}`;
    const matchingSize = BENTO_SIZES.find(s => s.size === targetSizeString);

    if (matchingSize) {
      // Pass the FULL responsive span string to the callback
      onSizeSelect(matchingSize.span);
    } else {
      // Handle cases where the clicked size doesn't exist in BENTO_SIZES (optional)
      console.warn(`Selected size ${targetSizeString} not found in BENTO_SIZES.`);
      // Optionally, could generate a simple span string as fallback:
      // onSizeSelect(`col-span-${cols} row-span-${rows}`);
    }
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white shadow-lg rounded-md border border-gray-200 p-2"
    >
      <div
        className={`grid gap-1`}
        style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: maxRows }).map((_, rIndex) =>
          Array.from({ length: maxCols }).map((_, cIndex) => {
            const cols = cIndex + 1;
            const rows = rIndex + 1;
            const isCurrent = cols === currentDims.cols && rows === currentDims.rows;
            return (
              <button
                key={`${rIndex}-${cIndex}`}
                onClick={() => handleCellClick(cols, rows)}
                className={`w-8 h-8 rounded border transition-all flex items-center justify-center text-xs font-mono ${isCurrent ? 'bg-blue-500 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 hover:bg-blue-100 hover:border-blue-400'}`}
              >
                {`${cols}x${rows}`}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
// --- End Popover Component ---

const BentoLayoutSelector = ({ theme }) => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data: userLinks } = useLinks(currentUser?.id);
  const { data: userTexts } = useTexts(currentUser?.id);
  const { photos } = usePhotoBook();
  const [bentoItems, setBentoItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null); // Track which item's popover is open

  // Initialize bento items from user data or create default items from all available content
  useEffect(() => {
    if (currentUser) {
      let parsedBentoItems = [];
      try {
        if (currentUser.bentoItems) {
          if (typeof currentUser.bentoItems === 'string') {
            parsedBentoItems = JSON.parse(currentUser.bentoItems);
          } else if (Array.isArray(currentUser.bentoItems)) {
            parsedBentoItems = currentUser.bentoItems;
          }
          // Ensure existing items have the correct full span format
          parsedBentoItems = parsedBentoItems.map(item => {
            const matchingSize = BENTO_SIZES.find(
              size =>
                size.span === item.span || // Already correct
                size.id === item.span // Maybe stored with old ID format
            );
            return {
              ...item,
              span: matchingSize ? matchingSize.span : BENTO_SIZES[0].span, // Default to small if invalid
            };
          });
        }
      } catch (error) {
        console.error('Error parsing or correcting bentoItems:', error);
      }

      if (parsedBentoItems.length > 0) {
        setBentoItems(parsedBentoItems);
      } else {
        // Create default bento items from all available content
        const defaultItems = [];
        if (userLinks) {
          userLinks.forEach((link, index) => {
            if (!link.isSocial && !link.archived) {
              defaultItems.push({
                id: link.id,
                type: 'link',
                span: BENTO_SIZES[0].span, // Default to small span (full format)
                order: index,
              });
            }
          });
        }
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
      // Ensure all items being saved have the full span format
      const itemsToSave = updatedItems.map(item => {
        const matchingSize = BENTO_SIZES.find(
          size => size.span === item.span || size.id === item.span
        );
        return {
          ...item,
          span: matchingSize ? matchingSize.span : BENTO_SIZES[0].span,
        };
      });
      await axios.post('/api/users/update-bento-spans', { bentoItems: itemsToSave });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Bento layout updated');
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
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setBentoItems(updatedItems);
    updateBentoSpans.mutate(updatedItems);
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

  // Toggle popover
  const toggleSizeEditor = itemId => {
    setEditingItemId(prevId => (prevId === itemId ? null : itemId));
  };

  // Get current size string (e.g., "1x1") from span
  const getSizeString = span => {
    const sizeOption = BENTO_SIZES.find(s => s.span === span);
    return sizeOption ? sizeOption.size : 'Custom';
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
            // Updated Grid Layout to match preview's sm breakpoint and row height
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-3 auto-rows-[60px] gap-3" // Match preview grid
            >
              {bentoItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative ${item.span} rounded-lg transition-all group shadow-sm hover:shadow-md ${
                        editingItemId === item.id ? 'z-40' : 'z-auto'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        border: `2px solid ${theme?.accent || '#6170F8'}20`,
                      }}
                    >
                      {/* Drag Handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full p-1 cursor-grab"
                      >
                        <GripHorizontal size={14} className="text-gray-500" />
                      </div>
                      {/* Content Preview */}
                      {getItemPreview(item)}
                      {/* Size Control Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                        {/* Button to open the popover */}
                        <button
                          onClick={() => toggleSizeEditor(item.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all bg-white/20 text-white hover:bg-white/30`}
                        >
                          {getSizeString(item.span)}
                        </button>
                      </div>

                      {/* Render Popover conditionally */}
                      {editingItemId === item.id && (
                        <SizeSelectorPopover
                          currentSpan={item.span}
                          onSizeSelect={fullSpanString =>
                            updateItemSize(
                              item.id,
                              BENTO_SIZES.find(s => s.span === fullSpanString)?.id || 'custom'
                            )
                          }
                          onClose={() => setEditingItemId(null)}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default BentoLayoutSelector;
