'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layers, // For stacked view
  LayoutGrid, // For bento view - Replaced Grid3x3
  Monitor, // For normal view
} from 'lucide-react';

const ViewModeToggle = ({ value, onChange, theme }) => {
  // View mode options with icons and labels
  const viewModes = [
    { id: 'normal', label: 'Normal', icon: Monitor },
    { id: 'stacked', label: 'Stacked', icon: Layers },
    { id: 'bento', label: 'Bento', icon: LayoutGrid }, // Changed icon here
  ];

  return (
    <div
      className="flex rounded-md overflow-hidden border"
      style={{
        backgroundColor: theme?.secondary || '#f2f2f2',
        borderColor: `${theme?.accent}30` || '#33333330',
      }}
    >
      {viewModes.map(mode => {
        const isActive = value === mode.id;
        const Icon = mode.icon;

        return (
          <button
            key={mode.id}
            className={`relative px-3 py-2 flex items-center justify-center gap-2 ${isActive ? 'text-white' : ''}`}
            onClick={() => onChange(mode.id)}
            style={{
              zIndex: isActive ? 2 : 1,
              minWidth: '90px',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeViewMode"
                className="absolute inset-0"
                style={{ backgroundColor: theme?.accent || '#6170F8' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}

            <Icon
              className="relative z-10"
              size={16}
              strokeWidth={2}
              style={{
                color: isActive ? '#fff' : theme?.accent || '#6170F8',
              }}
            />

            <span
              className="relative z-10 text-sm font-medium"
              style={{
                color: isActive ? '#fff' : theme?.accent || '#6170F8',
              }}
            >
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeToggle;
