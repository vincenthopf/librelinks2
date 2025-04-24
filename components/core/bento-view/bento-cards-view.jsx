'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaItem from './media-item';
import GalleryModal from './gallery-modal';
import { mapContentToBentoItems } from '@/utils/bento-helpers';

const BentoCardsView = ({
  items, // Combined links & texts (pre-sorted)
  fetchedUser,
  theme,
  registerClicks,
  renderPhotoBook,
  photos, // Separate photos array
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bentoItems, setBentoItems] = useState([]);

  // Map input items to bento-compatible format with spans and styling
  // This now uses the improved mapContentToBentoItems
  useEffect(() => {
    if (!fetchedUser) return;

    // Extract links and texts from the combined 'items' array
    const links = items.filter(i => i.type === 'link');
    const texts = items.filter(i => i.type === 'text');

    // Parse user's saved bento settings
    let userBentoSettings = [];
    try {
      if (fetchedUser.bentoItems && typeof fetchedUser.bentoItems === 'string') {
        userBentoSettings = JSON.parse(fetchedUser.bentoItems);
      } else if (Array.isArray(fetchedUser.bentoItems)) {
        userBentoSettings = fetchedUser.bentoItems;
      }
    } catch (error) {
      console.warn('Error parsing bentoItems settings:', error);
    }

    // Map content using the updated utility function
    const mappedItems = mapContentToBentoItems(
      links,
      texts,
      photos,
      userBentoSettings, // Pass the user's layout structure
      theme,
      null // photoBookOrder is deprecated when using userBentoSettings
    );

    setBentoItems(mappedItems);
  }, [items, fetchedUser, photos, theme]); // Re-run when inputs change

  // Handle item click
  const handleItemClick = item => {
    if (isDragging) return;

    // Only register click if it's not being opened in modal
    if (registerClicks) {
      registerClicks(item.id, item.url, item.title);
    }

    // Open modal
    setSelectedItem(item);
  };

  // Render photobook content if item is photobook type
  const renderContent = item => {
    if (item.type === 'photobook' && renderPhotoBook) {
      return renderPhotoBook();
    }
    return null;
  };

  // Handle drag end (Removed - Dragging is handled in BentoLayoutSelector now)
  // const handleDragEnd = (e, info, index) => { ... };

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        {selectedItem ? (
          <GalleryModal
            selectedItem={selectedItem}
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            setSelectedItem={setSelectedItem}
            mediaItems={bentoItems} // Use the processed bentoItems
            theme={theme}
          />
        ) : (
          <motion.div
            // Synchronized grid layout with BentoLayoutSelector
            className="grid grid-cols-3 gap-3 auto-rows-[60px]"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            style={{
              // Ensure gap uses the correct user setting (but className takes precedence)
              gap: `${fetchedUser?.betweenCardsPadding ?? 12}px`, // Use 12px (gap-3) as default
            }}
          >
            {bentoItems.map((item, index) => (
              <motion.div
                key={item.id} // Use item.id from the mapped data
                layoutId={`media-${item.id}`}
                // Use the full responsive span class directly
                className={`relative overflow-hidden rounded-xl cursor-pointer ${item.span}`}
                onClick={() => handleItemClick(item)}
                variants={{
                  hidden: { y: 50, scale: 0.9, opacity: 0 },
                  visible: {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 350,
                      damping: 25,
                      delay: index * 0.05,
                    },
                  },
                }}
                whileHover={{ scale: 1.02 }}
                style={{
                  // Ensure border radius uses the correct user setting
                  borderRadius:
                    fetchedUser?.buttonStyle === 'rounded-full'
                      ? '999px'
                      : fetchedUser?.buttonStyle === 'rounded-none'
                        ? '0px'
                        : '12px',
                }}
              >
                {/* Item Content */}
                {item.type === 'photobook' ? (
                  <div className="absolute inset-0 w-full h-full">{renderContent(item)}</div>
                ) : (
                  <MediaItem
                    item={item}
                    className="absolute inset-0 w-full h-full"
                    onClick={() => !isDragging && handleItemClick(item)}
                  />
                )}

                {/* Item Overlay with Title/Description */}
                <motion.div
                  className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 md:p-4"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-3 md:p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <h3
                      className="relative text-white font-medium line-clamp-1"
                      style={{
                        fontSize: `${fetchedUser?.linkTitleFontSize || 14}px`,
                        fontFamily: fetchedUser?.linkTitleFontFamily || 'Inter',
                      }}
                    >
                      {item.title}
                    </h3>
                    {(item.desc || item.content) && (
                      <p
                        className="relative text-white/70 mt-0.5 line-clamp-2"
                        style={{
                          fontSize: `${(fetchedUser?.linkTitleFontSize || 14) - 2}px`,
                          fontFamily: fetchedUser?.bioFontFamily || 'Inter',
                        }}
                      >
                        {item.desc || item.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BentoCardsView;
