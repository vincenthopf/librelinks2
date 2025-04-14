import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AspectRatioConfig, EmbedConfig } from '@/types/embed';
import { DEFAULT_ASPECT_RATIO, DEFAULT_CONTAINER_CLASS } from '@/types/embed';

interface EmbedContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  style?: React.CSSProperties;
  frameAnimation?: any;
}

const getAspectRatioClass = (aspectRatio: AspectRatioConfig | undefined): string => {
  if (!aspectRatio) return DEFAULT_ASPECT_RATIO.mobile;

  // Check viewport width for responsive design
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width >= 1024 && aspectRatio.desktop) return aspectRatio.desktop;
    if (width >= 768 && aspectRatio.tablet) return aspectRatio.tablet;
    return aspectRatio.mobile;
  }

  return aspectRatio.mobile;
};

const EmbedContainer: React.FC<EmbedContainerProps> = ({
  config,
  children,
  isLoading = false,
  hasError = false,
  style,
  frameAnimation,
}) => {
  // State to track if the container is visible in the viewport
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const containerClass = config?.containerClass || DEFAULT_CONTAINER_CLASS;
  const aspectRatioClass = getAspectRatioClass(config?.aspectRatio);

  // Intersection Observer to set isInView
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when element is intersecting (visible)
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin: '100px', // Trigger slightly before it's fully in view
        threshold: 0.1, // Trigger when 10% is visible
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []); // Run only once on mount

  // Add hardware acceleration properties to style
  const enhancedStyle = {
    ...style,
    willChange: 'transform, opacity', // Include opacity for fade-in
    transform: 'translateZ(0)',
  };

  // Determine animation class and style for content fade-in
  const contentAnimation = useMemo(() => {
    if (!frameAnimation || !frameAnimation.enabled || frameAnimation.type === 'none') {
      // Fallback to default fade if no user animation is set
      return { className: 'embed-fade-in', style: {} };
    }

    // Use user's animation settings
    const { type, duration = 0.5, delay = 0 } = frameAnimation;
    return {
      className: `animate-${type}`,
      style: {
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity: 0, // Start hidden
        animationFillMode: 'forwards',
      },
    };
  }, [frameAnimation]);

  // Determine if the content should start its animation
  const shouldAnimate = isInView && !isLoading && !hasError;

  return (
    <div
      ref={containerRef} // Attach ref for IntersectionObserver
      className={`embed-container ${containerClass}`}
      style={enhancedStyle}
    >
      <div className={`relative ${aspectRatioClass}`}>
        {/* Loading State - Shows until !isLoading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden">
            <div className="w-full h-full embed-loading">
              <div className="h-8 w-8 m-auto absolute inset-0 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
          </div>
        )}

        {/* Error State with animation */}
        {hasError && (
          <div
            className="absolute inset-0 flex items-center justify-center p-4 animate-fade"
            style={{ animationDuration: '0.3s' }}
          >
            <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-3 rounded-lg shadow-sm">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Failed to load content</p>
            </div>
          </div>
        )}

        {/* Content - Rendered when not loading/error, animation applied only when shouldAnimate is true */}
        <div
          className={`h-full w-full ${shouldAnimate ? contentAnimation.className : 'opacity-0'}`}
          style={{
            // Use visibility hidden to prevent layout shifts before animation starts
            visibility: isLoading || hasError ? 'hidden' : 'visible',
            // Apply animation styles only when animating
            ...(shouldAnimate
              ? contentAnimation.style
              : { animationDuration: '0s', animationDelay: '0s' }),
          }}
        >
          {/* Render children only if not loading/error to prevent potential issues with unloaded embeds */}
          {!isLoading && !hasError && children}
        </div>
      </div>
    </div>
  );
};

export default EmbedContainer;
