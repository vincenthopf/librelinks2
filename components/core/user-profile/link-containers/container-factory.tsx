import React from 'react';
import { EmbedConfig } from '@/types/embed';
import StandardLinkContainer from './standard-link-container';
import TwitterContainer from './twitter-container';
import YouTubeContainer from './youtube-container';
import SpotifyContainer from './spotify-container';
import { TikTokContainer } from './tiktok-container';

interface ContainerFactoryProps {
  type: string;
  embedHtml?: string;
  url: string;
  title: string;
  maxWidth?: string;
  config?: Partial<EmbedConfig>;
  className?: string;
}

const ContainerFactory: React.FC<ContainerFactoryProps> = ({
  type,
  embedHtml,
  url,
  title,
  maxWidth,
  config,
  className,
}) => {
  const commonProps = {
    embedHtml,
    url,
    title,
    maxWidth,
    config,
    className,
  };

  // Helper function to determine if URL matches a pattern
  const matchesPattern = (pattern: RegExp): boolean => pattern.test(url);

  // Determine container type based on URL and type
  const getContainerType = (): string => {
    // Check for specific platforms first
    if (matchesPattern(/twitter\.com/)) return 'twitter';
    if (matchesPattern(/youtube\.com|youtu\.be/)) return 'youtube';
    if (matchesPattern(/tiktok\.com/)) return 'tiktok';
    if (matchesPattern(/spotify\.com|open\.spotify\.com/)) return 'spotify';

    // Fallback to standard link container
    return 'standard';
  };

  // Render appropriate container based on type
  const renderContainer = () => {
    const containerType = getContainerType();

    switch (containerType) {
      case 'tiktok':
        return <TikTokContainer {...commonProps} />;
      case 'twitter':
        return <TwitterContainer {...commonProps} />;
      case 'youtube':
        return <YouTubeContainer {...commonProps} />;
      case 'spotify':
        return <SpotifyContainer {...commonProps} />;
      default:
        return <StandardLinkContainer {...commonProps} />;
    }
  };

  return renderContainer();
};

export default ContainerFactory;
