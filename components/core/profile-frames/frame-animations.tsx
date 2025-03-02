import { AnimationProps } from 'framer-motion';

export interface FrameAnimation {
  type:
    | 'rotate'
    | 'pulse'
    | 'glow'
    | 'bounce'
    | 'shimmer'
    | 'breathe'
    | 'shake'
    | 'spin-pulse'
    | null;
  enabled: boolean;
  config: {
    duration?: number;
    delay?: number;
    [key: string]: any;
  };
}

export const getFrameAnimationProps = (animation: FrameAnimation | undefined): AnimationProps => {
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
          filter: ['drop-shadow(0 0 0px)', 'drop-shadow(0 0 8px)', 'drop-shadow(0 0 0px)'],
        },
        transition: {
          ...baseConfig,
        },
      };

    case 'bounce':
      return {
        animate: {
          y: [0, -10, 0],
        },
        transition: {
          ...baseConfig,
          duration: baseConfig.duration || 1.5,
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
          ...baseConfig,
          duration: baseConfig.duration || 2.5,
        },
      };

    case 'breathe':
      return {
        animate: {
          scale: [1, 1.03, 1],
          opacity: [1, 0.9, 1],
        },
        transition: {
          ...baseConfig,
          duration: baseConfig.duration || 4,
        },
      };

    case 'shake':
      return {
        animate: {
          rotate: [0, -2, 0, 2, 0],
        },
        transition: {
          ...baseConfig,
          duration: baseConfig.duration || 0.5,
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
            ...baseConfig,
            ease: 'linear',
            duration: baseConfig.duration || 3,
          },
          scale: {
            ...baseConfig,
            duration: baseConfig.duration || 1.5,
            repeatDelay: 0.5,
          },
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
  bounce: {
    type: 'bounce',
    enabled: true,
    config: {
      duration: 1.5,
    },
  },
  shimmer: {
    type: 'shimmer',
    enabled: true,
    config: {
      duration: 2.5,
    },
  },
  breathe: {
    type: 'breathe',
    enabled: true,
    config: {
      duration: 4,
    },
  },
  shake: {
    type: 'shake',
    enabled: true,
    config: {
      duration: 0.5,
    },
  },
  'spin-pulse': {
    type: 'spin-pulse',
    enabled: true,
    config: {
      duration: 3,
    },
  },
  none: {
    type: null,
    enabled: false,
    config: {},
  },
} as const;

export type FrameAnimationType = keyof typeof FRAME_ANIMATION_PRESETS;
