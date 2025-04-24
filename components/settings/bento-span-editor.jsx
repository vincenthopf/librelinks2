'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SPAN_OPTIONS } from '@/utils/bento-helpers';
import { Check, ChevronDown, LayoutGrid } from 'lucide-react';

const BentoSpanEditor = ({ items, bentoItems = [], onUpdate, theme }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter items that can have spans customized
  const customizableItems = items.filter(
    item => item.id !== 'photobook-preview' && item.id !== 'photobook-preview-mobile'
  );

  // Find the current span setting for an item
  const getItemSpan = itemId => {
    const bentoSetting = bentoItems.find(b => b.id === itemId);
    if (bentoSetting) return bentoSetting.span;

    // Return the span option ID based on matching span class
    const matchingOption = SPAN_OPTIONS.find(opt => opt.span === bentoSetting?.span);
    return matchingOption?.id || 'small';
  };

  // Update an item's span
  const updateItemSpan = (itemId, spanOptionId) => {
    // Get the span class from the selected option
    const spanOption = SPAN_OPTIONS.find(opt => opt.id === spanOptionId);
    if (!spanOption) return;

    // Find existing item in bentoItems
    const existingIndex = bentoItems.findIndex(item => item.id === itemId);
    let updatedBentoItems;

    if (existingIndex >= 0) {
      // Update existing item
      updatedBentoItems = [...bentoItems];
      updatedBentoItems[existingIndex] = {
        ...updatedBentoItems[existingIndex],
        span: spanOption.span,
      };
    } else {
      // Add new item
      updatedBentoItems = [...bentoItems, { id: itemId, span: spanOption.span }];
    }

    // Call the onUpdate callback
    onUpdate(updatedBentoItems);
    setIsDropdownOpen(false);
  };

  const getItemTitle = item => {
    return item.title || 'Untitled Item';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-2 space-x-2">
        <LayoutGrid size={16} />
        <h3 className="text-lg font-semibold">Bento Grid Layout</h3>
      </div>

      <div className="space-y-4 divide-y">
        {customizableItems.map(item => {
          const currentSpanId = getItemSpan(item.id);
          const selectedOption =
            SPAN_OPTIONS.find(opt => opt.id === currentSpanId) || SPAN_OPTIONS[0];

          return (
            <div key={item.id} className="pt-4 first:pt-0">
              <div className="flex justify-between items-center">
                <span className="font-medium">{getItemTitle(item)}</span>

                <div className="relative">
                  <button
                    onClick={() => {
                      setSelectedItem(item.id);
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm"
                    style={{
                      borderColor: `${theme?.accent}20` || '#00000020',
                      backgroundColor: theme?.secondary || '#f8f8f8',
                    }}
                  >
                    <span>
                      {selectedOption.label} ({selectedOption.size})
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {isDropdownOpen && selectedItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10"
                      style={{
                        borderColor: `${theme?.accent}20` || '#00000020',
                      }}
                    >
                      <div className="py-1">
                        {SPAN_OPTIONS.map(option => (
                          <button
                            key={option.id}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => updateItemSpan(item.id, option.id)}
                          >
                            <span>
                              {option.label} ({option.size})
                            </span>
                            {currentSpanId === option.id && (
                              <Check size={14} className="text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Visual preview of the grid cell */}
              <div className="mt-2 bg-gray-100 rounded-md p-1">
                <div
                  className="grid grid-cols-4 gap-1 h-16"
                  style={{
                    backgroundColor: theme?.primary || '#ffffff',
                  }}
                >
                  {/* Visual representation of the span */}
                  <div
                    className={`${selectedOption.span.replace(/md:|sm:/g, '')} rounded flex items-center justify-center text-xs`}
                    style={{
                      backgroundColor: `${theme?.accent}20` || '#6170F820',
                      border: `1px solid ${theme?.accent}40` || '#6170F840',
                      color: theme?.accent || '#6170F8',
                    }}
                  >
                    {selectedOption.size}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { BentoSpanEditor };
