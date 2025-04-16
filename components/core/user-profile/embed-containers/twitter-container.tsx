import React from 'react';
import { EmbedConfig } from '@/types/embed';
import EmbedContainer from '../embed-container';

interface TwitterContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  embedBackground?: string;
  contentAnimation?: any;
}

const TwitterContainer: React.FC<TwitterContainerProps> = ({
  config,
  children,
  isLoading,
  hasError,
  embedBackground,
  contentAnimation,
}) => {
  // Twitter-specific container class
  const twitterConfig = {
    ...config,
    containerClass: `twitter-embed-container w-full max-w-[550px] mx-auto overflow-hidden rounded-lg ${config?.containerClass || ''}`,
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-auto',
      desktop: 'aspect-auto',
    },
  };

  const containerStyle = {
    background: embedBackground || 'transparent',
  };

  return (
    <div className="twitter-wrapper relative">
      <EmbedContainer
        config={twitterConfig}
        isLoading={isLoading}
        hasError={hasError}
        style={containerStyle}
        contentAnimation={contentAnimation}
      >
        {/* Twitter-specific wrapper for dynamic height */}
        <div className="twitter-content-wrapper relative w-full min-h-[250px]">{children}</div>
      </EmbedContainer>
    </div>
  );
};

export default TwitterContainer;
