/// <reference types="react" />
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useMemo } from 'react';
import { FrameTemplate } from './frame-selector';

// Cache for rendered frames
const frameCache = new Map<string, React.ReactElement>();

// Generate cache key from frame props
export const getFrameCacheKey = (
  template: FrameTemplate,
  size: number,
  color: string,
  rotation: number,
  thickness: number,
  name: string,
  animation?: {
    type: string | null;
    enabled: boolean;
    config: Record<string, any>;
  }
) => {
  return `${template}-${size}-${color}-${rotation}-${thickness}-${name}-${JSON.stringify(animation)}`;
};

// SVG optimization function
export const optimizeSvgPaths = (path: string): string => {
  return (
    path
      // Remove unnecessary spaces
      .replace(/\s+/g, ' ')
      // Remove spaces after commands
      .replace(/([MLHVCSQTA]) /gi, '$1')
      // Remove spaces before commands
      .replace(/ ([MLHVCSQTA])/gi, '$1')
      // Remove trailing decimals
      .replace(/(\d+)\.0([^\d])/g, '$1$2')
  );
};

// Hook for optimized frame rendering
export const useOptimizedFrame = (
  renderFunction: () => React.ReactElement,
  cacheKey: string
) => {
  return useMemo(() => {
    if (frameCache.has(cacheKey)) {
      return frameCache.get(cacheKey);
    }

    const renderedFrame = renderFunction();
    frameCache.set(cacheKey, renderedFrame);
    return renderedFrame;
  }, [cacheKey, renderFunction]);
};

// Performance optimization styles
export const getOptimizedStyles = (
  isAnimated: boolean
): React.CSSProperties => {
  return {
    // Use hardware acceleration for animations
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    // Add will-change hint for animated elements
    willChange: isAnimated ? 'transform, filter' : 'auto',
  };
};

// Lazy loading wrapper component
export const LazyFrame: React.FC<{
  children: React.ReactNode;
  onLoad?: () => void;
}> = ({ children, onLoad }) => {
  return (
    <div style={{ minHeight: '1px', minWidth: '1px' }} onLoad={onLoad}>
      {children}
    </div>
  );
};
