import React from 'react';
import { motion } from 'framer-motion';
import { getFrameCacheKey, useOptimizedFrame, getOptimizedStyles } from '../frame-optimizations';

interface PolaroidPatternFrameProps {
  size: number;
  color: string;
  thickness: number;
  rotation: number;
  animation?: {
    type: string | null;
    enabled: boolean;
    config: Record<string, any>;
  };
  className?: string;
}

export const PolaroidPatternFrame: React.FC<PolaroidPatternFrameProps> = ({
  size,
  color,
  thickness,
  rotation,
  animation,
  className,
}) => {
  const cacheKey = getFrameCacheKey(
    'polaroid-pattern',
    size,
    color,
    rotation,
    thickness,
    '',
    animation
  );
  const isAnimated = animation?.enabled && animation.type !== null;
  const optimizedStyles = getOptimizedStyles(!!isAnimated);
  const animationProps = getAnimationProps(animation);

  // Calculate dimensions based on thickness
  const viewBoxSize = 100;
  const borderRadius = 8;
  const frameSize = viewBoxSize - thickness;

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
      {...animationProps}
    >
      <rect
        x={thickness / 2}
        y={thickness / 2}
        width={frameSize}
        height={frameSize}
        stroke={color}
        strokeWidth={thickness}
        fill="transparent"
      />
    </motion.svg>
  );

  const optimizedFrame = useOptimizedFrame(renderFrame, cacheKey);

  // Return null if thickness is undefined
  if (thickness === undefined) {
    return null;
  }

  return optimizedFrame;
};

const getAnimationProps = (animation: PolaroidPatternFrameProps['animation']) => {
  if (!animation?.enabled || !animation.type) return {};

  switch (animation.type) {
    case 'rotate':
      return {
        animate: { rotate: [0, 360] },
        transition: {
          duration: animation.config.duration || 3,
          repeat: Infinity,
          ease: 'linear',
        },
      };
    case 'pulse':
      return {
        animate: { scale: [1, 1.05, 1] },
        transition: {
          duration: animation.config.duration || 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'glow':
      return {
        animate: {
          filter: ['drop-shadow(0 0 0px)', 'drop-shadow(0 0 8px)', 'drop-shadow(0 0 0px)'],
        },
        transition: {
          duration: animation.config.duration || 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'bounce':
      return {
        animate: { y: [0, -10, 0] },
        transition: {
          duration: animation.config.duration || 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'shimmer':
      return {
        animate: {
          opacity: [1, 0.7, 1],
          filter: [
            'brightness(1) contrast(1)',
            'brightness(1.2) contrast(1.1)',
            'brightness(1) contrast(1)',
          ],
        },
        transition: {
          duration: animation.config.duration || 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'breathe':
      return {
        animate: {
          scale: [1, 1.03, 1],
          opacity: [1, 0.9, 1],
        },
        transition: {
          duration: animation.config.duration || 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'shake':
      return {
        animate: { rotate: [0, -2, 0, 2, 0] },
        transition: {
          duration: animation.config.duration || 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };
    case 'spin-pulse':
      return {
        animate: {
          rotate: [0, 360],
          scale: [1, 1.05, 1],
        },
        transition: {
          rotate: {
            duration: animation.config.duration || 3,
            repeat: Infinity,
            ease: 'linear',
          },
          scale: {
            duration: animation.config.duration || 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatDelay: 0.5,
          },
        },
      };
    default:
      return {};
  }
};

export default PolaroidPatternFrame;
