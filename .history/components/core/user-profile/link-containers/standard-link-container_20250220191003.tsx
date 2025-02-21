import React, { useState } from 'react';
import { EmbedConfig } from '@/types/embed';
import ContentContainer from '../content-container';
import { AlertCircle, Globe } from 'lucide-react';

interface StandardLinkContainerProps {
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  maxWidth?: string;
  config?: Partial<EmbedConfig>;
  className?: string;
}

const StandardLinkContainer: React.FC<StandardLinkContainerProps> = ({
  title,
  url,
  description,
  favicon,
  maxWidth = '600px',
  config,
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Handle favicon loading
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <ContentContainer
      type="link"
      maxWidth={{
        mobile: '100%',
        tablet: maxWidth,
        desktop: maxWidth
      }}
      className={className}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Favicon/Icon Section */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {favicon && !hasError ? (
            <img
              src={favicon}
              alt={`${title} favicon`}
              className={`w-full h-full object-contain transition-opacity duration-200 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <Globe className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow min-w-0">
          {/* Title with ellipsis */}
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>

          {/* URL with ellipsis */}
          <p className="text-sm text-gray-500 truncate mt-1">
            {url}
          </p>

          {/* Description with line clamping */}
          {description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Failed to load preview</p>
          </div>
        </div>
      )}
    </ContentContainer>
  );
};

export default StandardLinkContainer; 