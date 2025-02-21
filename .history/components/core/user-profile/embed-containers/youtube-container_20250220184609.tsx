import React from 'react';
import { EmbedConfig } from '@/types/embed';
import EmbedContainer from '../embed-container';

interface YouTubeContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
}

const YouTubeContainer: React.FC<YouTubeContainerProps> = ({
  config,
  children,
  isLoading,
  hasError,
}) => {
  // YouTube-specific container class with 16:9 aspect ratio
  const youtubeConfig = {
    ...config,
    containerClass: `youtube-embed-container w-full overflow-hidden rounded-lg ${config?.containerClass || ''}`,
    aspectRatio: {
      mobile: 'aspect-video',
      tablet: 'aspect-video',
      desktop: 'aspect-video',
    },
  };

  return (
    <div className="youtube-wrapper relative">
      <EmbedContainer
        config={youtubeConfig}
        isLoading={isLoading}
        hasError={hasError}
      >
        {/* YouTube-specific wrapper for responsive iframe */}
        <div className="youtube-content-wrapper relative w-full h-full">
          {children}
        </div>
      </EmbedContainer>
    </div>
  );
};

export default YouTubeContainer; 