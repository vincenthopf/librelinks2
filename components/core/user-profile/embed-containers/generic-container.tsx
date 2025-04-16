import React from 'react';
import { EmbedConfig } from '@/types/embed';
import EmbedContainer from '../embed-container';

interface GenericContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
  embedBackground?: string;
  contentAnimation?: any;
}

const GenericContainer: React.FC<GenericContainerProps> = ({
  config,
  children,
  isLoading,
  hasError,
  embedBackground,
  contentAnimation,
}) => {
  // Generic container with sensible defaults
  const genericConfig = {
    ...config,
    containerClass: `generic-embed-container w-full overflow-hidden rounded-lg ${config?.containerClass || ''}`,
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
    <div className="generic-wrapper relative">
      <EmbedContainer
        config={genericConfig}
        isLoading={isLoading}
        hasError={hasError}
        style={containerStyle}
        contentAnimation={contentAnimation}
      >
        {/* Generic wrapper with flexible content area */}
        <div className="generic-content-wrapper relative w-full h-full">{children}</div>
      </EmbedContainer>
    </div>
  );
};

export default GenericContainer;
