import React from 'react';
import { EmbedConfig } from '@/types/embed';
import EmbedContainer from '../embed-container';

interface InstagramContainerProps {
  config?: Partial<EmbedConfig>;
  children: React.ReactNode;
  isLoading?: boolean;
  hasError?: boolean;
}

const InstagramContainer: React.FC<InstagramContainerProps> = ({
  config,
  children,
  isLoading,
  hasError,
}) => {
  // Instagram-specific container class
  const instagramConfig = {
    ...config,
    containerClass: `instagram-embed-container w-full max-w-[540px] mx-auto overflow-hidden rounded-lg h-[450px] ${config?.containerClass || ''}`,
  };

  return (
    <div className="instagram-wrapper relative">
      <EmbedContainer
        config={instagramConfig}
        isLoading={isLoading}
        hasError={hasError}
      >
        {/* Instagram-specific wrapper for better mobile handling */}
        <div className="instagram-content-wrapper relative w-full">
          {children}
        </div>
      </EmbedContainer>
    </div>
  );
};

export default InstagramContainer; 