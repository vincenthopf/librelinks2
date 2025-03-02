import React from 'react';
import { motion } from 'framer-motion';
import { getFrameCacheKey, useOptimizedFrame, getOptimizedStyles } from '../frame-optimizations';

export type CornerStyle =
  | 'notch'
  | 'scoop'
  | 'bevel'
  | 'diamond'
  | 'straight'
  | 'round'
  | 'squircle'
  | 'apple';

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

    case 'apple':
      // Apple's iOS-style rounded corners (continuous curvature)
      const appleCtrl = r * 0.45; // Adjusted control point for Apple's style
      if (position === 'topLeft')
        return `C ${x} ${y + appleCtrl}, ${x + appleCtrl} ${y}, ${x + r} ${y}`;
      if (position === 'topRight')
        return `C ${x + width - appleCtrl} ${y}, ${x + width} ${y + appleCtrl}, ${x + width} ${y + r}`;
      if (position === 'bottomRight')
        return `C ${x + width} ${y + height - appleCtrl}, ${x + width - appleCtrl} ${y + height}, ${x + width - r} ${y + height}`;
      if (position === 'bottomLeft')
        return `C ${x + appleCtrl} ${y + height}, ${x} ${y + height - appleCtrl}, ${x} ${y + height - r}`;
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
  animation,
  className,
}) => {
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
  });

  const cacheKey = getFrameCacheKey(
    'rounded-corners',
    size,
    color,
    rotation,
    thickness,
    '', // name parameter should be empty string, not cornerStyle
    animation,
    cornerStyle,
    borderRadius,
    allCorners,
    topLeftRadius,
    topRightRadius,
    bottomLeftRadius,
    bottomRightRadius
  );

  const isAnimated = animation?.enabled && animation.type !== null;
  const optimizedStyles = getOptimizedStyles(isAnimated);

  // Calculate dimensions for the SVG viewBox
  const viewBoxSize = 100;
  const frameWidth = viewBoxSize - thickness;
  const frameHeight = viewBoxSize - thickness;
  const frameX = thickness / 2;
  const frameY = thickness / 2;

  const renderFrame = () => (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        rotate: `${rotation}deg`,
        ...optimizedStyles,
      }}
      className={className}
    >
      <path
        d={generateFramePath(
          cornerStyle,
          frameWidth,
          frameHeight,
          allCorners,
          borderRadius,
          topLeftRadius,
          topRightRadius,
          bottomRightRadius,
          bottomLeftRadius
        )}
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

export default RoundedCornersFrame;
