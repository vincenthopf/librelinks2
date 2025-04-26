'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MediaItem from './media-item';

const GalleryModal = ({
  selectedItem,
  isOpen,
  onClose,
  setSelectedItem,
  mediaItems,
  theme, // Add theme for consistent styling with the rest of the app
}) => {
  const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 });

  if (!isOpen || !selectedItem) return null;

  return (
    <>
      {/* Main Modal */}
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className="fixed inset-0 w-full min-h-screen sm:h-[90vh] md:h-[600px] backdrop-blur-lg 
                  rounded-none sm:rounded-lg md:rounded-xl overflow-hidden z-50"
        style={{
          backgroundColor: `${theme.primary}80`, // Add opacity for backdrop effect
        }}
      >
        {/* Main Content */}
        <div className="h-full flex flex-col">
          <div
            className="flex-1 p-2 sm:p-3 md:p-4 flex items-center justify-center"
            style={{ backgroundColor: `${theme.secondary}50` }} // Semi-transparent background
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedItem.id}
                className="relative w-full aspect-[16/9] max-w-[95%] sm:max-w-[85%] md:max-w-3xl 
                         h-auto max-h-[70vh] rounded-lg overflow-hidden shadow-md"
                initial={{ y: 20, scale: 0.97 }}
                animate={{
                  y: 0,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5,
                  },
                }}
                exit={{
                  y: 20,
                  scale: 0.97,
                  transition: { duration: 0.15 },
                }}
              >
                {selectedItem.embedHtml ? (
                  <div
                    className="w-full h-full overflow-hidden bg-white"
                    style={{
                      backgroundColor: theme?.embedBackground || 'white',
                      minHeight: '300px',
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedItem.embedHtml }}
                  />
                ) : (
                  <MediaItem
                    item={selectedItem}
                    className="w-full h-full object-contain bg-gray-900/20"
                  />
                )}
                <div
                  className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 
                          bg-gradient-to-t from-black/50 to-transparent"
                >
                  <h3
                    className="text-white text-base sm:text-lg md:text-xl font-semibold"
                    style={{
                      fontFamily: selectedItem.fontFamily || 'Inter',
                      fontSize: `${selectedItem.fontSize || 16}px`,
                    }}
                  >
                    {selectedItem.title}
                  </h3>
                  <p
                    className="text-white/80 text-xs sm:text-sm mt-1"
                    style={{ fontFamily: selectedItem.fontFamily || 'Inter' }}
                  >
                    {selectedItem.desc || selectedItem.content}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Close Button */}
        <motion.button
          className="absolute top-2 sm:top-2.5 md:top-3 right-2 sm:right-2.5 md:right-3 
                    p-2 rounded-full text-gray-700 backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.secondary}80`,
            color: theme.accent,
          }}
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Draggable Dock */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={false}
        animate={{ x: dockPosition.x, y: dockPosition.y }}
        onDragEnd={(_, info) => {
          setDockPosition(prev => ({
            x: prev.x + info.offset.x,
            y: prev.y + info.offset.y,
          }));
        }}
        className="fixed z-[60] left-1/2 bottom-4 -translate-x-1/2 touch-none"
      >
        <motion.div
          className="relative rounded-xl backdrop-blur-xl border shadow-lg
                    cursor-grab active:cursor-grabbing"
          style={{
            backgroundColor: `${theme.secondary}20`,
            borderColor: `${theme.accent}30`,
          }}
        >
          <div className="flex items-center -space-x-2 px-3 py-2">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedItem(item);
                }}
                style={{
                  zIndex: selectedItem.id === item.id ? 30 : mediaItems.length - index,
                  ringColor: selectedItem.id === item.id ? theme.accent : `${theme.accent}30`,
                }}
                className={`
                  relative group
                  w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0 
                  rounded-lg overflow-hidden 
                  cursor-pointer hover:z-20
                  ${
                    selectedItem.id === item.id
                      ? 'ring-2 shadow-lg'
                      : 'hover:ring-2 hover:ring-white/30'
                  }
                `}
                initial={{ rotate: index % 2 === 0 ? -15 : 15 }}
                animate={{
                  scale: selectedItem.id === item.id ? 1.2 : 1,
                  rotate: selectedItem.id === item.id ? 0 : index % 2 === 0 ? -15 : 15,
                  y: selectedItem.id === item.id ? -8 : 0,
                }}
                whileHover={{
                  scale: 1.3,
                  rotate: 0,
                  y: -10,
                  transition: { type: 'spring', stiffness: 400, damping: 25 },
                }}
              >
                <MediaItem item={item} className="w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20" />
                {selectedItem.id === item.id && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute -inset-2 blur-xl"
                    style={{ backgroundColor: `${theme.accent}20` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default GalleryModal;
