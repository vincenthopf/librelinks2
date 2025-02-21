import React from 'react';
import { ProviderName } from '@/types/embed';

interface SizeConstraints {
  mobile: string;
  tablet?: string;
  desktop?: string;
}

interface ContentContainerProps {
  type: 'link' | 'embed' | 'social' | 'playlist';
  maxWidth?: SizeConstraints;
  maxHeight?: SizeConstraints;
  children: React.ReactNode;
  provider?: ProviderName;
  className?: string;
}

const PROVIDER_CONSTRAINTS = {
  Spotify: {
    maxWidth: {
      mobile: '100%',
      tablet: '450px',
      desktop: '450px'
    },
    maxHeight: {
      mobile: '152px',
      tablet: '152px',
      desktop: '152px'
    }
  },
  YouTube: {
    maxWidth: {
      mobile: '100%',
      tablet: '560px',
      desktop: '560px'
    }
  },
  Instagram: {
    maxWidth: {
      mobile: '100%',
      tablet: '540px',
      desktop: '540px'
    }
  },
  Twitter: {
    maxWidth: {
      mobile: '100%',
      tablet: '550px',
      desktop: '550px'
    }
  },
  TikTok: {
    maxWidth: {
      mobile: '100%',
      tablet: '325px',
      desktop: '325px'
    }
  }
};

const getResponsiveSize = (size: SizeConstraints): string => {
  const mobileClass = `max-w-[${size.mobile}]`;
  const tabletClass = size.tablet ? ` md:max-w-[${size.tablet}]` : '';
  const desktopClass = size.desktop ? ` lg:max-w-[${size.desktop}]` : '';
  return `${mobileClass}${tabletClass}${desktopClass}`;
};

const ContentContainer: React.FC<ContentContainerProps> = ({
  type,
  maxWidth,
  maxHeight,
  children,
  provider,
  className = ''
}) => {
  // Get provider-specific constraints
  const constraints = provider ? PROVIDER_CONSTRAINTS[provider] : null;
  const finalMaxWidth = maxWidth || constraints?.maxWidth;
  const finalMaxHeight = maxHeight || constraints?.maxHeight;

  // Build responsive classes
  const widthClasses = finalMaxWidth ? getResponsiveSize(finalMaxWidth) : '';
  const heightClasses = finalMaxHeight ? getResponsiveSize(finalMaxHeight) : '';

  // Base classes for different content types
  const typeClasses = {
    link: 'overflow-hidden rounded-lg',
    embed: 'overflow-hidden rounded-lg bg-white/80 backdrop-blur-sm',
    social: 'overflow-hidden rounded-lg bg-white/90',
    playlist: 'overflow-hidden rounded-lg bg-black/5 backdrop-blur-sm'
  };

  return (
    <div className={`
      content-container relative w-full mx-auto
      ${typeClasses[type]}
      ${widthClasses}
      ${heightClasses}
      ${className}
    `}>
      <div className="content-wrapper relative w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default ContentContainer; 