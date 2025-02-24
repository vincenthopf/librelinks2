import { AnimationProps } from 'framer-motion';

export interface FrameAnimation {
  type: 'rotate' | 'pulse' | 'glow' | null;
  enabled: boolean;
  config: {
    duration?: number;
    delay?: number;
    [key: string]: any;
  };
}

export const getFrameAnimationProps = (
  animation: FrameAnimation | undefined
): AnimationProps => {
  if (!animation?.enabled || !animation.type) {
    return {};
  }

  const baseConfig = {
    duration: animation.config.duration || 2,
    repeat: Infinity,
    ease: 'easeInOut',
    ...animation.config,
  };

  switch (animation.type) {
    case 'rotate':
      return {
        animate: {
          rotate: [0, 360],
        },
        transition: {
          ...baseConfig,
          ease: 'linear',
          duration: baseConfig.duration || 3,
        },
      };

    case 'pulse':
      return {
        animate: {
          scale: [1, 1.05, 1],
        },
        transition: {
          ...baseConfig,
        },
      };

    case 'glow':
      return {
        animate: {
          filter: [
            'drop-shadow(0 0 0px)',
            'drop-shadow(0 0 8px)',
            'drop-shadow(0 0 0px)',
          ],
        },
        transition: {
          ...baseConfig,
        },
      };

    default:
      return {};
  }
};

export const FRAME_ANIMATION_PRESETS = {
  rotate: {
    type: 'rotate',
    enabled: true,
    config: {
      duration: 3,
    },
  },
  pulse: {
    type: 'pulse',
    enabled: true,
    config: {
      duration: 2,
    },
  },
  glow: {
    type: 'glow',
    enabled: true,
    config: {
      duration: 2,
    },
  },
  none: {
    type: null,
    enabled: false,
    config: {},
  },
} as const;

export type FrameAnimationType = keyof typeof FRAME_ANIMATION_PRESETS;
