import React from 'react';
import { motion } from 'framer-motion';
import { CircleFrame } from './frame-templates/circle-frame';
import { PolaroidClassicFrame } from './frame-templates/polaroid-classic-frame';
import { PolaroidPatternFrame } from './frame-templates/polaroid-pattern-frame';
import { FrameAnimation } from './frame-animations';

export type FrameTemplate =
  | 'none'
  | 'circle'
  | 'polaroid-classic'
  | 'polaroid-pattern';

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
];

const PREVIEW_ANIMATION: FrameAnimation = {
  type: null,
  enabled: false,
  config: {},
};

export const FrameSelector: React.FC<FrameSelectorProps> = ({
  selectedTemplate,
  color,
  thickness,
  name,
  onSelect,
  className,
}) => {
  const renderPreviewFrame = (template: FrameTemplate) => {
    // For "none" template, return null to show no frame
    if (template === 'none') {
      return null;
    }

    const props = {
      size: 80,
      color,
      thickness,
      rotation: 0,
      animation: PREVIEW_ANIMATION,
      name,
    };

    switch (template) {
      case 'circle':
        return <CircleFrame {...props} />;
      case 'polaroid-classic':
        return <PolaroidClassicFrame {...props} />;
      case 'polaroid-pattern':
        return <PolaroidPatternFrame {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={className || ''}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {FRAME_TEMPLATES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`
              flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all
              ${
                selectedTemplate === id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="relative w-20 h-24 flex items-center justify-center">
              {renderPreviewFrame(id)}
            </div>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
