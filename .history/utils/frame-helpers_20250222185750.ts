import { CSSProperties } from 'react';

export type FrameType = 
  | 'none' 
  | 'circle' 
  | 'rect-h' 
  | 'rect-v' 
  | 'square' 
  | 'oval-v' 
  | 'heart' 
  | 'pentagon' 
  | 'hexagon' 
  | 'heptagon' 
  | 'octagon' 
  | 'nonagon' 
  | 'decagon';

export interface FrameOption {
  type: FrameType;
  label: string;
  shape: string;
}

export const FRAME_OPTIONS: FrameOption[] = [
  { type: 'none', label: 'No Frame', shape: '' },
  { type: 'circle', label: 'Circle', shape: 'rounded-full' },
  { type: 'rect-h', label: 'Horizontal Rectangle', shape: 'rounded-xl aspect-[16/9]' },
  { type: 'rect-v', label: 'Vertical Rectangle', shape: 'rounded-xl aspect-[9/16]' },
  { type: 'square', label: 'Square', shape: 'rounded-xl aspect-square' },
  { type: 'oval-v', label: 'Vertical Oval', shape: 'rounded-full aspect-[2/3]' },
  { type: 'heart', label: 'Heart', shape: 'heart-shape' },
  { type: 'pentagon', label: 'Pentagon', shape: 'pentagon-shape' },
  { type: 'hexagon', label: 'Hexagon', shape: 'hexagon-shape' },
  { type: 'heptagon', label: 'Heptagon', shape: 'heptagon-shape' },
  { type: 'octagon', label: 'Octagon', shape: 'octagon-shape' },
  { type: 'nonagon', label: 'Nonagon', shape: 'nonagon-shape' },
  { type: 'decagon', label: 'Decagon', shape: 'decagon-shape' }
];

export const getFrameStyles = (frameType: FrameType): CSSProperties => {
  switch(frameType) {
    case 'none':
      return { border: 'none' };
    case 'oval-v':
      return { 
        aspectRatio: '2/3',
        borderRadius: '50%'
      };
    case 'heart':
      return {
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'none',
        '&:before, &:after': {
          position: 'absolute',
          content: '""',
          left: '50%',
          top: '0',
          width: '50%',
          height: '80%',
          background: 'inherit',
          borderRadius: '50% 50% 0 0',
          transform: 'translate(-50%, 20%) rotate(-45deg)',
          transformOrigin: '0 100%',
          border: '2px solid currentColor'
        },
        '&:after': {
          transform: 'translate(-50%, 20%) rotate(45deg)',
          transformOrigin: '100% 100%'
        }
      };
    case 'pentagon':
      return {
        clipPath: 'polygon(50% 2%, 98% 35%, 85% 98%, 15% 98%, 2% 35%)'
      };
    case 'hexagon':
      return {
        clipPath: 'polygon(25% 2%, 75% 2%, 98% 50%, 75% 98%, 25% 98%, 2% 50%)'
      };
    case 'heptagon':
      return {
        clipPath: 'polygon(50% 2%, 90% 22%, 98% 58%, 75% 98%, 25% 98%, 2% 58%, 10% 22%)'
      };
    case 'octagon':
      return {
        clipPath: 'polygon(30% 2%, 70% 2%, 98% 30%, 98% 70%, 70% 98%, 30% 98%, 2% 70%, 2% 30%)'
      };
    case 'nonagon':
      return {
        clipPath: 'polygon(50% 2%, 83% 14%, 98% 43%, 94% 78%, 68% 98%, 32% 98%, 6% 78%, 2% 43%, 17% 14%)'
      };
    case 'decagon':
      return {
        clipPath: 'polygon(50% 2%, 80% 12%, 98% 35%, 98% 70%, 80% 88%, 50% 98%, 20% 88%, 2% 70%, 2% 35%, 20% 12%)'
      };
    default:
      return {};
  }
};

export const getFrameClassName = (frameType: FrameType): string => {
  const baseClasses = 'transition-all duration-300';
  const option = FRAME_OPTIONS.find(opt => opt.type === frameType);
  
  if (!option) return baseClasses;
  return `${baseClasses} ${option.shape}`.trim();
};

export const isValidFrameType = (frameType: string): frameType is FrameType => {
  return FRAME_OPTIONS.some(option => option.type === frameType);
};

export const isValidHexColor = (color: string): boolean => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

export const DEFAULT_FRAME_COLOR = '#3B82F6'; // blue-300
export const DEFAULT_FRAME_TYPE: FrameType = 'circle'; 