import { signalIframe } from '@/utils/helpers';

/**
 * Utility functions to handle frame refreshes
 */

// Store the last frame dimensions to detect changes
let lastFrameWidth = 0;
let lastFrameHeight = 0;

/**
 * Check if frame dimensions have changed and force a refresh if needed
 * @param {number} frameWidth - Current frame width
 * @param {number} frameHeight - Current frame height
 * @returns {boolean} - Whether a refresh was triggered
 */
export const checkAndRefreshFrames = (frameWidth, frameHeight) => {
  // If dimensions have changed significantly, force a refresh
  if (Math.abs(frameWidth - lastFrameWidth) > 5 || Math.abs(frameHeight - lastFrameHeight) > 5) {
    console.log('Frame dimensions changed significantly:', {
      oldWidth: lastFrameWidth,
      newWidth: frameWidth,
      oldHeight: lastFrameHeight,
      newHeight: frameHeight,
    });

    // Update stored dimensions
    lastFrameWidth = frameWidth;
    lastFrameHeight = frameHeight;

    // First try a gentle update with dimensions
    signalIframe('update_dimensions', {
      frameWidth,
      frameHeight,
    });

    // Then schedule a full refresh after a short delay
    // This ensures everything is properly updated if the gentle approach isn't sufficient
    setTimeout(() => {
      signalIframe('update_user');
    }, 100);

    return true;
  }

  // Update stored dimensions even if no refresh was needed
  lastFrameWidth = frameWidth;
  lastFrameHeight = frameHeight;

  return false;
};

/**
 * Force a refresh of all iframes in the document
 */
export const forceRefreshAllIframes = () => {
  console.log('Refreshing all iframes');

  // Use a balanced approach - first try a gentle update
  signalIframe('update_user');

  return true;
};
