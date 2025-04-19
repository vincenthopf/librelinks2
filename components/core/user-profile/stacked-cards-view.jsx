'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LinkCard from './links-card';
import TextCard from './text-card';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Import arrows

// Define animation variants based on contentAnimation types
const animationVariants = {
  none: {
    initial: { opacity: 1, y: 0, scale: 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 1, y: 0, scale: 1 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: '50%' },
    animate: { opacity: 1, y: '0%' },
    exit: { opacity: 0, y: '-50%' }, // Exit upwards
  },
  slideDown: {
    initial: { opacity: 0, y: '-50%' },
    animate: { opacity: 1, y: '0%' },
    exit: { opacity: 0, y: '50%' }, // Exit downwards
  },
  slideLeft: {
    initial: { opacity: 0, x: '50%' },
    animate: { opacity: 1, x: '0%' },
    exit: { opacity: 0, x: '-50%' }, // Exit left
  },
  slideRight: {
    initial: { opacity: 0, x: '-50%' },
    animate: { opacity: 1, x: '0%' },
    exit: { opacity: 0, x: '50%' }, // Exit right
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  rotate: {
    initial: { opacity: 0, rotate: -45, scale: 0.9 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 45, scale: 0.9 },
  },
  bounce: {
    initial: { opacity: 0, y: '30%', scale: 0.9 },
    animate: {
      opacity: 1,
      y: '0%',
      scale: 1,
      transition: { type: 'spring', stiffness: 150, damping: 15 },
    },
    exit: { opacity: 0, y: '30%', scale: 0.9 },
  },
};

// --- 1. Define Resting Styles ---
const restingStyles = {
  active: {
    zIndex: 3,
    scale: 1,
    y: '0%',
    opacity: 1,
    rotate: 0,
    filter: 'blur(0px)',
  },
  behind: {
    zIndex: 2,
    scale: 0.95,
    y: '3%',
    opacity: 0.6,
    rotate: -4,
    filter: 'blur(2px)',
  },
  farBehind: {
    zIndex: 1,
    scale: 0.9,
    y: '6%',
    opacity: 0.3,
    rotate: 4,
    filter: 'blur(4px)',
  },
  hidden: {
    // State for cards further back
    zIndex: 0,
    scale: 0.85,
    y: '9%',
    opacity: 0,
    rotate: 6,
    filter: 'blur(5px)',
  },
};

// --- 2. Define Transition Variants based on Type ---
const getTransitionVariants = animationType => {
  switch (animationType) {
    case 'fadeIn':
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
    case 'slideUp':
      return {
        initial: { opacity: 0, y: '20%' },
        animate: { opacity: 1, y: '0%' },
        exit: { opacity: 0, y: '-20%' },
      };
    case 'slideDown':
      return {
        initial: { opacity: 0, y: '-20%' },
        animate: { opacity: 1, y: '0%' },
        exit: { opacity: 0, y: '20%' },
      };
    case 'slideLeft':
      return {
        initial: { opacity: 0, x: '20%' },
        animate: { opacity: 1, x: '0%' },
        exit: { opacity: 0, x: '-20%' },
      };
    case 'slideRight':
      return {
        initial: { opacity: 0, x: '-20%' },
        animate: { opacity: 1, x: '0%' },
        exit: { opacity: 0, x: '50%' },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      };
    case 'rotate':
      return {
        initial: { opacity: 0, rotate: -15, scale: 0.9 },
        animate: { opacity: 1, rotate: 0, scale: 1 },
        exit: { opacity: 0, rotate: 15, scale: 0.9 },
      };
    case 'bounce':
      return {
        initial: { opacity: 0, y: '15%', scale: 0.9 },
        animate: { opacity: 1, y: '0%', scale: 1 }, // Transition override handled separately
        exit: { opacity: 0, y: '15%', scale: 0.9 },
      };
    case 'none':
    default:
      return { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }; // No visual change
  }
};

// --- Removed props: positions, currentItems ---
// --- Added prop: items (full list) ---
export function StackedCardsView({
  items = [],
  handleShuffle,
  fetchedUser,
  theme,
  registerClicks,
  renderPhotoBook,
  contentAnimation,
}) {
  // --- State for active index ---
  const [activeIndex, setActiveIndex] = React.useState(0);
  // Remove dragRef and positions state
  // const dragRef = React.useRef(0);
  // const [positions, setPositions] = React.useState(['front', 'middle', 'back']);
  // Remove currentItems state
  // const [currentItems, setCurrentItems] = React.useState([]);

  // --- Initialize currentItems removed ---

  // --- handleShuffle replaced by handleNext/handlePrev ---
  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + items.length) % items.length);
  };

  // Return null if no items
  if (!items || items.length === 0) return null;

  // Get current animation settings
  const currentAnimationType = contentAnimation?.type || 'none';
  const currentAnimationDuration = contentAnimation?.duration || 0.4;
  const transitionVariants = getTransitionVariants(currentAnimationType);

  // Define transition config (including bounce handling)
  let transitionConfig = {
    duration: currentAnimationDuration,
    ease: 'easeInOut',
  };
  if (currentAnimationType === 'bounce') {
    transitionConfig = {
      y: { type: 'spring', stiffness: 150, damping: 15, duration: currentAnimationDuration },
      scale: { type: 'spring', stiffness: 150, damping: 15, duration: currentAnimationDuration },
      opacity: { duration: currentAnimationDuration * 0.6 },
      default: { duration: currentAnimationDuration, ease: 'easeInOut' },
    };
  }

  // Calculate indices for background cards
  const behindIndex = (activeIndex + 1) % items.length;
  const farBehindIndex = (activeIndex + 2) % items.length;

  return (
    // Main container: Full height/width, flex-col
    <div className="relative w-full h-full flex flex-col items-center justify-start p-4">
      {/* Navigation Buttons - Moved ABOVE cards, add padding */}
      {items.length > 1 && (
        <div className="flex gap-4 w-full justify-center py-2 z-10">
          {' '}
          {/* Centered buttons */}
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow"
            aria-label="Previous Card"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow"
            aria-label="Next Card"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Card container - Takes remaining space */}
      <div className="relative w-full flex-grow flex items-center justify-center h-[calc(100%-60px)]">
        {' '}
        {/* Adjusted height calc */}
        {/* Background Cards (Rendered Statically based on activeIndex) */}
        {[behindIndex, farBehindIndex].map(index => {
          if (index === activeIndex || items.length <= 1) return null; // Don't render active or if only 1 item
          if (items.length === 2 && index === farBehindIndex) return null; // Don't render farBehind if only 2 items

          const item = items[index];
          if (!item) return null; // Safety check

          const style = index === behindIndex ? restingStyles.behind : restingStyles.farBehind;

          return (
            <motion.div
              key={item.id || `${item.type}-${index}-bg`} // Use unique key for background
              animate={style} // Animate directly to resting style
              transition={{ duration: 0.4, ease: 'easeInOut' }} // Standard transition for background cards shifting
              className={`absolute left-0 right-0 mx-auto top-0 w-full max-w-[calc(100%-40px)] h-auto select-none rounded-xl border border-gray-200 shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700`}
              style={{ originX: 0.5, originY: 1 }}
            >
              {/* Render Content (Read Only - No Interaction needed for BG) */}
              {item.type === 'photobook' ? (
                <div className="h-full w-full opacity-50">{renderPhotoBook()}</div> // Reduced opacity for BG
              ) : item.url ? (
                <LinkCard
                  {...item}
                  theme={theme}
                  buttonStyle={fetchedUser?.buttonStyle}
                  fontSize={fetchedUser?.linkTitleFontSize}
                  fontFamily={fetchedUser?.linkTitleFontFamily}
                  cardHeight={fetchedUser?.linkCardHeight}
                  faviconSize={fetchedUser?.faviconSize}
                />
              ) : (
                <TextCard
                  {...item}
                  theme={theme}
                  buttonStyle={fetchedUser?.textCardButtonStyle}
                  fontSize={fetchedUser?.linkTitleFontSize}
                  fontFamily={fetchedUser?.linkTitleFontFamily}
                />
              )}
            </motion.div>
          );
        })}
        {/* Active Card (Handled by AnimatePresence) */}
        <AnimatePresence initial={false}>
          <motion.div
            key={activeIndex} // KEY CHANGE: Use activeIndex to trigger AnimatePresence
            variants={transitionVariants} // Use variants for initial/animate/exit
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionConfig} // Apply specific transition
            className={`absolute left-0 right-0 mx-auto top-0 w-full max-w-[calc(100%-40px)] h-auto select-none rounded-xl border border-gray-200 shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700`}
            style={{ originX: 0.5, originY: 1, zIndex: restingStyles.active.zIndex }} // Ensure active is on top
          >
            {/* Render active card content */}
            {items[activeIndex] &&
              (() => {
                const item = items[activeIndex];
                return item.type === 'photobook' ? (
                  <div className="h-full w-full">{renderPhotoBook()}</div>
                ) : item.url ? (
                  <LinkCard
                    {...item}
                    fontSize={fetchedUser?.linkTitleFontSize}
                    fontFamily={fetchedUser?.linkTitleFontFamily}
                    buttonStyle={fetchedUser?.buttonStyle}
                    theme={theme}
                    faviconSize={fetchedUser?.faviconSize ?? 32}
                    cardHeight={fetchedUser?.linkCardHeight}
                    registerClicks={() => registerClicks(item.id, item.url, item.title)}
                  />
                ) : (
                  <TextCard
                    title={item.title}
                    content={item.content}
                    buttonStyle={fetchedUser?.textCardButtonStyle}
                    theme={theme}
                    fontSize={fetchedUser?.linkTitleFontSize}
                    fontFamily={fetchedUser?.linkTitleFontFamily}
                  />
                );
              })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
