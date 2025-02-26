import { useEffect, useState } from 'react';

export default function useMediaQuery() {
  const [device, setDevice] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [isNavigationOverflow, setIsNavigationOverflow] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;

      // Device type detection
      if (width <= 640) {
        setDevice('mobile');
      } else if (width <= 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }

      // Set dimensions
      setDimensions({ width, height: window.innerHeight });

      // Check for navigation overflow
      // We'll consider navigation overflowing if width is less than 768px
      setIsNavigationOverflow(width < 768);
    };

    // Initial detection
    checkDevice();

    // Listener for windows resize with debounce
    let timeoutId;
    const resizeHandler = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(checkDevice, 100);
    };

    window.addEventListener('resize', resizeHandler);

    // Cleanup listener
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return {
    device,
    width: dimensions ? dimensions.width : null,
    height: dimensions ? dimensions.height : null,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isNavigationOverflow,
  };
}
