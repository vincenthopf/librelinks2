import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the actual Lottie component
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false, // Keep SSR disabled for Lottie
});

const LazyLottieLoader = ({
  path,
  loop = true,
  autoplay = true,
  className = '',
  style = {},
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Ensure IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, loading Lottie immediately.');
      setIsVisible(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // When the element is intersecting (visible)
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Stop observing once visible
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      {
        // Start loading when the element is a bit below the viewport
        rootMargin: '100px 0px',
        threshold: 0.01, // Trigger even if just 1% is visible
      }
    );

    const currentContainerRef = containerRef.current;
    if (currentContainerRef) {
      observerRef.current.observe(currentContainerRef);
    }

    // Cleanup function to disconnect observer
    return () => {
      if (observerRef.current && currentContainerRef) {
        observerRef.current.unobserve(currentContainerRef);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    // This div is the target for the Intersection Observer
    <div ref={containerRef} style={{ minHeight: '1px' }}>
      {' '}
      {/* Added minHeight to ensure div is observable */}
      {isVisible ? (
        <Lottie
          path={path}
          loop={loop}
          autoplay={autoplay}
          className={className}
          style={style}
          {...rest} // Pass any other Lottie props
        />
      ) : // Optional: Render a placeholder while loading/invisible
      // <div className={className} style={{ ...style, backgroundColor: 'rgba(0,0,0,0.05)', aspectRatio: 'auto' }}></div>
      null // Or render nothing until visible
      }
    </div>
  );
};

export default LazyLottieLoader;
