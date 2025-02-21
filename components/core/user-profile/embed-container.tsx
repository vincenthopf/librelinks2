import React from 'react';
import { AspectRatioConfig, EmbedConfig } from '@/types/embed';
import { DEFAULT_ASPECT_RATIO, DEFAULT_CONTAINER_CLASS } from '@/types/embed';

interface EmbedContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
}

const getAspectRatioClass = (aspectRatio: AspectRatioConfig | undefined): string => {
  if (!aspectRatio) return DEFAULT_ASPECT_RATIO.mobile;

  // Check viewport width for responsive design
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width >= 1024 && aspectRatio.desktop) return aspectRatio.desktop;
    if (width >= 768 && aspectRatio.tablet) return aspectRatio.tablet;
    return aspectRatio.mobile;
  }

  return aspectRatio.mobile;
};

const EmbedContainer: React.FC<EmbedContainerProps> = ({
  config,
  children,
  isLoading = false,
  hasError = false,
}) => {
  const containerClass = config?.containerClass || DEFAULT_CONTAINER_CLASS;
  const aspectRatioClass = getAspectRatioClass(config?.aspectRatio);

  return (
    <div className={`embed-container ${containerClass}`}>
      <div className={`relative ${aspectRatioClass}`}>
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Failed to load content</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`h-full w-full ${isLoading || hasError ? 'hidden' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default EmbedContainer; 