import React from 'react';
import { motion } from 'framer-motion';
import { CircleFrame } from './frame-templates/circle-frame';
import { PolaroidClassicFrame } from './frame-templates/polaroid-classic-frame';
import { PolaroidPatternFrame } from './frame-templates/polaroid-pattern-frame';
import { RoundedCornersFrame } from './frame-templates/rounded-corners-frame';
import { FrameAnimation } from './frame-animations';

export type FrameTemplate =
  | 'none'
  | 'circle'
  | 'polaroid-classic'
  | 'polaroid-pattern'
  | 'rounded-corners';

interface FrameSelectorProps {
  selectedTemplate: FrameTemplate;
  color: string;
  thickness: number;
  name: string;
  onSelect: (template: FrameTemplate) => void;
  className?: string;
}

const FRAME_TEMPLATES: { id: FrameTemplate; label: string }[] = [
  { id: 'none', label: 'No Frame' },
  { id: 'circle', label: 'Circle' },
  { id: 'polaroid-classic', label: 'Polaroid Classic' },
  { id: 'polaroid-pattern', label: 'Square' },
  { id: 'rounded-corners', label: 'Your Own Frame' },
];

const PREVIEW_ANIMATION: FrameAnimation = {
  type: null,
  enabled: false,
  config: {},
};

// Frame style symbols
const renderFrameSymbol = (template: FrameTemplate, isSelected: boolean) => {
  const color = isSelected ? '#3b82f6' : '#9ca3af';

  switch (template) {
    case 'none':
      return (
        <div className="h-14 flex items-center justify-center">
          <span className="text-gray-400">—</span>
        </div>
      );
    case 'circle':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="25" cy="25" r="20" stroke={color} strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'polaroid-classic':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="5"
            width="30"
            height="40"
            rx="2"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />
          <rect
            x="13"
            y="8"
            width="24"
            height="28"
            rx="1"
            stroke={color}
            strokeWidth="1.5"
            fill="none"
          />
          <rect x="18" y="38" width="14" height="3" rx="1.5" fill={color} />
        </svg>
      );
    case 'polaroid-pattern':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="10"
            y="10"
            width="30"
            height="30"
            rx="2"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      );
    case 'rounded-corners':
      return (
        <svg
          width="40"
          height="40"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10,15 L40,15 L45,25 L40,35 L32,25 L25,40 L18,25 L10,35 L5,25 L10,15 Z"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      );
    default:
      return null;
  }
};

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedTemplate,
  color,
  thickness,
  name,
  onSelect,
  className,
}) => {
  // Simplified preview frame rendering - only render the symbol
  const renderPreviewFrame = (template: FrameTemplate) => {
    // We'll use only the symbols for preview
    return null;
  };

  return (
    <div className={className || ''}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FRAME_TEMPLATES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`
              flex flex-col items-center justify-between p-3 rounded-xl border-2 transition-all h-[120px]
              ${
                selectedTemplate === id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex-1 flex items-center justify-center">
              {renderFrameSymbol(id, selectedTemplate === id)}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
