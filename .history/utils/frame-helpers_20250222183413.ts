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
  { type: 'oval-v', label: 'Vertical Oval', shape: 'rounded-full aspect-[3/4]' },
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
      return { aspectRatio: '3/4' };
    case 'heart':
      return {
        clipPath: "path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')"
      };
    case 'pentagon':
      return {
        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
      };
    case 'hexagon':
      return {
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
      };
    case 'heptagon':
      return {
        clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
      };
    case 'octagon':
      return {
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
      };
    case 'nonagon':
      return {
        clipPath: 'polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)'
      };
    case 'decagon':
      return {
        clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)'
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