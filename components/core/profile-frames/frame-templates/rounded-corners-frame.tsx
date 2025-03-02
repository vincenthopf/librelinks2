import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { getFrameCacheKey, useOptimizedFrame, getOptimizedStyles } from '../frame-optimizations';

export type CornerStyle =
  | 'notch'
  | 'scoop'
  | 'bevel'
  | 'diamond'
  | 'straight'
  | 'round'
  | 'squircle';

interface RoundedCornersFrameProps {
  size: number;
  color: string;
  thickness: number;
  rotation: number;
  cornerStyle: CornerStyle;
  borderRadius: number;
  allCorners: boolean;
  topLeftRadius: number;
  topRightRadius: number;
  bottomLeftRadius: number;
  bottomRightRadius: number;
  width?: number;
  height?: number;
  animation?: {
    type: string | null;
    enabled: boolean;
    config: Record<string, any>;
  };
  className?: string;
}

// Helper function to generate SVG path for different corner styles
const generateCornerPath = (
  cornerStyle: CornerStyle,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  position: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'
): string => {
  // Ensure radius doesn't exceed half of the smallest dimension
  const maxRadius = Math.min(width / 2, height / 2);
  const r = Math.min(radius, maxRadius);

  // Calculate corner points based on position
  let startX, startY, endX, endY;

  switch (position) {
    case 'topLeft':
      startX = x;
      startY = y + r;
      endX = x + r;
      endY = y;
      break;
    case 'topRight':
      startX = x + width - r;
      startY = y;
      endX = x + width;
      endY = y + r;
      break;
    case 'bottomRight':
      startX = x + width;
      startY = y + height - r;
      endX = x + width - r;
      endY = y + height;
      break;
    case 'bottomLeft':
      startX = x + r;
      startY = y + height;
      endX = x;
      endY = y + height - r;
      break;
  }

  // Generate path based on corner style
  switch (cornerStyle) {
    case 'notch':
      // Inward-pointing corner
      const midX = position === 'topLeft' || position === 'bottomLeft' ? x + r : x + width - r;
      const midY = position === 'topLeft' || position === 'topRight' ? y + r : y + height - r;
      return `L ${midX} ${midY} L ${endX} ${endY}`;

    case 'scoop':
      // Rounded inward curve
      return `Q ${x + width / 2} ${y + height / 2}, ${endX} ${endY}`;

    case 'bevel':
      // Straight diagonal
      return `L ${endX} ${endY}`;

    case 'diamond':
      // Diamond-shaped corner
      const diamondMidX =
        position === 'topLeft' || position === 'bottomLeft' ? x + r / 2 : x + width - r / 2;
      const diamondMidY =
        position === 'topLeft' || position === 'topRight' ? y + r / 2 : y + height - r / 2;
      return `L ${diamondMidX} ${diamondMidY} L ${endX} ${endY}`;

    case 'straight':
      // Square corner
      if (position === 'topLeft') return `L ${x} ${y} L ${x + r} ${y}`;
      if (position === 'topRight') return `L ${x + width} ${y} L ${x + width} ${y + r}`;
      if (position === 'bottomRight')
        return `L ${x + width} ${y + height} L ${x + width - r} ${y + height}`;
      if (position === 'bottomLeft') return `L ${x} ${y + height} L ${x} ${y + height - r}`;
      return '';

    case 'round':
      // Simple rounded corner
      const sweep = 1; // Sweep flag for arc
      return `A ${r} ${r} 0 0 ${sweep} ${endX} ${endY}`;

    case 'squircle':
      // Superellipse approximation (more rounded than regular rounded corners)
      const ctrl = r * 0.552284749831; // Magic number for approximating a circle with cubic bezier
      if (position === 'topLeft') return `C ${x} ${y + ctrl}, ${x + ctrl} ${y}, ${x + r} ${y}`;
      if (position === 'topRight')
        return `C ${x + width - ctrl} ${y}, ${x + width} ${y + ctrl}, ${x + width} ${y + r}`;
      if (position === 'bottomRight')
        return `C ${x + width} ${y + height - ctrl}, ${x + width - ctrl} ${y + height}, ${x + width - r} ${y + height}`;
      if (position === 'bottomLeft')
        return `C ${x + ctrl} ${y + height}, ${x} ${y + height - ctrl}, ${x} ${y + height - r}`;
      return '';

    default:
      // Default to rounded corner
      return `A ${r} ${r} 0 0 1 ${endX} ${endY}`;
  }
};

// Generate the complete SVG path for the frame
const generateFramePath = (
  cornerStyle: CornerStyle,
  width: number,
  height: number,
  allCorners: boolean,
  borderRadius: number,
  topLeftRadius: number,
  topRightRadius: number,
  bottomRightRadius: number,
  bottomLeftRadius: number
): string => {
  const x = 0;
  const y = 0;

  // Use individual corner radii or the common border radius
  // Convert percentage values to actual pixel values based on width/height
  const maxRadius = Math.min(width, height) / 2;
  const tl = Math.min(allCorners ? borderRadius : topLeftRadius, maxRadius);
  const tr = Math.min(allCorners ? borderRadius : topRightRadius, maxRadius);
  const br = Math.min(allCorners ? borderRadius : bottomRightRadius, maxRadius);
  const bl = Math.min(allCorners ? borderRadius : bottomLeftRadius, maxRadius);

  // Start at top-left corner
  let path = `M ${x} ${y + tl}`;

  // Top-left corner
  path += generateCornerPath(cornerStyle, x, y, width, height, tl, 'topLeft');

  // Top edge
  path += ` L ${x + width - tr} ${y}`;

  // Top-right corner
  path += generateCornerPath(cornerStyle, x, y, width, height, tr, 'topRight');

  // Right edge
  path += ` L ${x + width} ${y + height - br}`;

  // Bottom-right corner
  path += generateCornerPath(cornerStyle, x, y, width, height, br, 'bottomRight');

  // Bottom edge
  path += ` L ${x + bl} ${y + height}`;

  // Bottom-left corner
  path += generateCornerPath(cornerStyle, x, y, width, height, bl, 'bottomLeft');

  // Close the path
  path += ' Z';

  return path;
};

export const RoundedCornersFrame: React.FC<RoundedCornersFrameProps> = ({
  size,
  color,
  thickness,
  rotation,
  cornerStyle,
  borderRadius,
  allCorners,
  topLeftRadius,
  topRightRadius,
  bottomLeftRadius,
  bottomRightRadius,
  width = 512,
  height = 512,
  animation,
  className,
}) => {
  const [frameKey, setFrameKey] = useState(`${width}-${height}-${Date.now()}`);
  const prevDimensionsRef = useRef({ width, height });
  const dimensionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Force re-render when dimensions change
  useEffect(() => {
    // Check if dimensions have actually changed significantly (more than 1px)
    if (
      Math.abs(width - prevDimensionsRef.current.width) > 1 ||
      Math.abs(height - prevDimensionsRef.current.height) > 1
    ) {
      console.log('Frame dimensions changed, updating key:', {
        oldWidth: prevDimensionsRef.current.width,
        newWidth: width,
        oldHeight: prevDimensionsRef.current.height,
        newHeight: height,
      });

      // Update the ref
      prevDimensionsRef.current = { width, height };

      // Update the key with a timestamp to ensure uniqueness
      // This will cause a local re-render of just this component
      setFrameKey(`${width}-${height}-${Date.now()}`);

      // Clear any existing timeout to prevent multiple updates
      if (dimensionChangeTimeoutRef.current) {
        clearTimeout(dimensionChangeTimeoutRef.current);
      }

      // For significant dimension changes, we need to ensure proper synchronization
      // First try a targeted update, then follow with a full refresh if needed
      dimensionChangeTimeoutRef.current = setTimeout(() => {
        try {
          // Try to find and notify any parent windows
          if (window.parent && window.parent !== window) {
            // First send a targeted update_dimensions message
            window.parent.postMessage(
              {
                type: 'update_dimensions',
                frameWidth: width,
                frameHeight: height,
              },
              '*'
            );

            // Then follow with a standard update_user message after a short delay
            // This ensures proper synchronization while minimizing visible flashing
            setTimeout(() => {
              window.parent.postMessage('update_user', '*');
            }, 100);
          }
        } catch (error) {
          console.error('Error notifying parent about dimension change:', error);
        }
      }, 50);
    }

    return () => {
      // Clean up timeout on unmount or when dependencies change
      if (dimensionChangeTimeoutRef.current) {
        clearTimeout(dimensionChangeTimeoutRef.current);
      }
    };
  }, [width, height]);

  // Log the props for debugging
  console.log('RoundedCornersFrame props:', {
    size,
    color,
    thickness,
    rotation,
    cornerStyle,
    borderRadius,
    allCorners,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,
    width,
    height,
  });

  const cacheKey = getFrameCacheKey(
    'rounded-corners',
    size,
    color,
    rotation,
    thickness,
    cornerStyle,
    animation,
    cornerStyle,
    borderRadius,
    allCorners,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,
    width,
    height
  );

  const isAnimated = animation?.enabled && animation.type !== null;
  const optimizedStyles = getOptimizedStyles(!!isAnimated);

  // Calculate dimensions for the SVG viewBox
  // Use the width and height to determine the aspect ratio
  const aspectRatio = width / height;

  // Determine if we need to adjust for non-square aspect ratio
  let svgWidth = size;
  let svgHeight = size;

  // Adjust SVG dimensions to maintain aspect ratio within the size constraint
  if (aspectRatio > 1) {
    // Wider than tall
    svgHeight = size / aspectRatio;
  } else if (aspectRatio < 1) {
    // Taller than wide
    svgWidth = size * aspectRatio;
  }

  // Use a fixed viewBox width and calculate height based on aspect ratio
  const viewBoxWidth = 100;
  const viewBoxHeight = viewBoxWidth / aspectRatio;

  // Calculate frame dimensions within the viewBox
  const frameWidth = viewBoxWidth - thickness;
  const frameHeight = viewBoxHeight - thickness;
  const frameX = thickness / 2;
  const frameY = thickness / 2;

  // Generate the frame path for both stroke and clip path
  const framePath = generateFramePath(
    cornerStyle,
    frameWidth,
    frameHeight,
    allCorners,
    borderRadius,
    topLeftRadius,
    topRightRadius,
    bottomRightRadius,
    bottomLeftRadius
  );

  // Generate a unique clip path ID that includes all relevant properties
  const clipPathId = `rounded-corners-clip-${cacheKey}-${frameKey}`;

  const renderFrame = () => (
    <motion.svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        rotate: `${rotation}deg`,
        ...optimizedStyles,
      }}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      key={frameKey}
    >
      {/* Define clip path for the image */}
      <defs>
        <clipPath id={clipPathId}>
          <path d={framePath} transform={`translate(${frameX}, ${frameY})`} />
        </clipPath>
      </defs>

      {/* Frame stroke */}
      <path
        d={framePath}
        stroke={color}
        strokeWidth={thickness}
        fill="transparent"
        transform={`translate(${frameX}, ${frameY})`}
      />
    </motion.svg>
  );

  const optimizedFrame = useOptimizedFrame(renderFrame, cacheKey);

  if (thickness === undefined) {
    return null;
  }

  return optimizedFrame;
};

// Export the function to generate frame path for use in other components
export const getFramePathForClipping = (
  cornerStyle: CornerStyle,
  size: number,
  thickness: number,
  allCorners: boolean,
  borderRadius: number,
  topLeftRadius: number,
  topRightRadius: number,
  bottomLeftRadius: number,
  bottomRightRadius: number,
  width: number = 512,
  height: number = 512
): string => {
  // For clipping, we want to use the inner dimensions of the frame
  const aspectRatio = width / height;
  const viewBoxWidth = 100;
  const viewBoxHeight = viewBoxWidth / aspectRatio;

  const frameWidth = viewBoxWidth - thickness;
  const frameHeight = viewBoxHeight - thickness;
  const frameX = thickness / 2;
  const frameY = thickness / 2;

  // Calculate the actual radii to use based on the frame dimensions
  const maxRadius = Math.min(frameWidth, frameHeight) / 2;
  const tl = Math.min(allCorners ? borderRadius : topLeftRadius, maxRadius);
  const tr = Math.min(allCorners ? borderRadius : topRightRadius, maxRadius);
  const br = Math.min(allCorners ? borderRadius : bottomRightRadius, maxRadius);
  const bl = Math.min(allCorners ? borderRadius : bottomLeftRadius, maxRadius);

  // Log parameters for debugging
  console.log('getFramePathForClipping:', {
    cornerStyle,
    size,
    thickness,
    allCorners,
    borderRadius,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius,
    frameWidth,
    frameHeight,
    frameX,
    frameY,
    width,
    height,
    aspectRatio,
    maxRadius,
    actualRadii: { tl, tr, br, bl },
  });

  // Generate the path with the same parameters as the frame
  const path = generateFramePath(
    cornerStyle,
    frameWidth,
    frameHeight,
    allCorners,
    borderRadius,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius
  );

  return path;
};

export default RoundedCornersFrame;
