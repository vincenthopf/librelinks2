import React from 'react';

const TemplateLoading = () => {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md" />

      {/* Template grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-sm p-4 space-y-4"
          >
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
            </div>

            {/* Stats skeleton */}
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
              <div className="h-8 bg-gray-200 animate-pulse rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateLoading;
