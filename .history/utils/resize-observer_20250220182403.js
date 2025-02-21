import { useState, useEffect, useRef } from 'react';

/**
 * Utility function to create and manage a ResizeObserver instance
 * @param {HTMLElement} element - The element to observe
 * @param {Function} callback - Callback function receiving width and height
 * @returns {Function} Cleanup function to remove observer
 */
export function observeElementResize(element, callback) {
  if (!element || !callback) {
    console.warn('observeElementResize: Missing required parameters');
    return () => {};
  }

  if (typeof window === 'undefined' || !window.ResizeObserver) {
    console.warn('ResizeObserver not supported');
    return () => {};
  }

  try {
    const observer = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to throttle updates
      requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          callback({ width: Math.round(width), height: Math.round(height) });
        }
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  } catch (error) {
    console.error('Error setting up ResizeObserver:', error);
    return () => {};
  }
}

/**
 * Hook to track element dimensions with debouncing
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce timeout in milliseconds
 * @param {boolean} options.roundValues - Whether to round dimension values
 * @returns {Object} ref and dimensions object
 */
export function useElementDimensions(
  options = { debounceMs: 150, roundValues: true }
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastDimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleResize = (newDimensions) => {
      // Skip if dimensions haven't changed significantly (within 1px)
      const hasSignificantChange =
        Math.abs(newDimensions.width - lastDimensionsRef.current.width) > 1 ||
        Math.abs(newDimensions.height - lastDimensionsRef.current.height) > 1;

      if (!hasSignificantChange) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastDimensionsRef.current = newDimensions;
        setDimensions(newDimensions);
      }, options.debounceMs);
    };

    const cleanup = observeElementResize(element, handleResize);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      cleanup();
    };
  }, [options.debounceMs]);

  return {
    ref: elementRef,
    dimensions,
    setDimensions, // Expose setter for manual updates if needed
  };
}
