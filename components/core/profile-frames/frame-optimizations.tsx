/// <reference types="react" />
/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useMemo } from 'react';
import { FrameTemplate } from './frame-selector';
import { CornerStyle } from './frame-templates/rounded-corners-frame';

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
  },
  cornerStyle?: CornerStyle,
  borderRadius?: number,
  allCorners?: boolean,
  topLeftRadius?: number,
  topRightRadius?: number,
  bottomLeftRadius?: number,
  bottomRightRadius?: number,
  width?: number,
  height?: number
) => {
  // Create a base key with common properties
  let key = `${template}-${size}-${color}-${rotation}-${thickness}-${name}-${JSON.stringify(animation)}`;

  // Add rounded corners properties if applicable
  if (template === 'rounded-corners') {
    key += `-${cornerStyle}-${borderRadius}-${allCorners}-${topLeftRadius}-${topRightRadius}-${bottomLeftRadius}-${bottomRightRadius}`;

    // Add width and height if provided
    if (width && height) {
      key += `-${width}-${height}`;
    }
  }

  return key;
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
export const useOptimizedFrame = (renderFunction: () => React.ReactElement, cacheKey: string) => {
  return useMemo(() => {
    // Check if we have a cached version
    if (frameCache.has(cacheKey)) {
      return frameCache.get(cacheKey)!;
    }

    // Render and cache the frame
    const renderedFrame = renderFunction();
    frameCache.set(cacheKey, renderedFrame);
    return renderedFrame;
  }, [cacheKey, renderFunction]);
};

// Performance optimization styles
export const getOptimizedStyles = (isAnimated: boolean) => {
  // For animated frames, we need to avoid certain optimizations
  if (isAnimated) {
    return {};
  }

  // For static frames, apply performance optimizations
  return {
    willChange: 'transform',
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
