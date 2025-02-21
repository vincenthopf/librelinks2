/**
 * Utility function to create and manage a ResizeObserver instance
 * @param {HTMLElement} element - The element to observe
 * @param {Function} callback - Callback function receiving width and height
 * @returns {Function} Cleanup function to remove observer
 */
export function observeElementResize(element, callback) {
  if (!element || !callback) return () => {};

  // Create observer instance
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      callback({ width, height });
    }
  });

  // Start observing
  observer.observe(element);

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * Hook to track element dimensions
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce timeout in milliseconds
 * @returns {Object} ref and dimensions
 */
export function useElementDimensions(options = { debounceMs: 150 }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const elementRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const handleResize = (newDimensions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDimensions(newDimensions);
      }, options.debounceMs);
    };

    const cleanup = observeElementResize(elementRef.current, handleResize);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      cleanup();
    };
  }, [options.debounceMs]);

  return { ref: elementRef, dimensions };
}
