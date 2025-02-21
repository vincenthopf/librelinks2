import React from 'react';
import { ProviderName } from '@/types/embed';
import { PROVIDER_CONSTRAINTS } from '@/config/provider-constraints';

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

const getResponsiveClasses = (
  size: SizeConstraints | undefined,
  prefix: string
): string => {
  if (!size) return '';
  
  const mobileClass = `${prefix}-[${size.mobile}]`;
  const tabletClass = size.tablet ? ` md:${prefix}-[${size.tablet}]` : '';
  const desktopClass = size.desktop ? ` lg:${prefix}-[${size.desktop}]` : '';
  return `${mobileClass}${tabletClass}${desktopClass}`;
};

const getAspectRatioClasses = (
  aspectRatio: SizeConstraints | undefined
): string => {
  if (!aspectRatio) return '';

  const mobileClass = `aspect-[${aspectRatio.mobile}]`;
  const tabletClass = aspectRatio.tablet ? ` md:aspect-[${aspectRatio.tablet}]` : '';
  const desktopClass = aspectRatio.desktop ? ` lg:aspect-[${aspectRatio.desktop}]` : '';
  return `${mobileClass}${tabletClass}${desktopClass}`;
};

const getPaddingClasses = (
  padding: SizeConstraints | undefined
): string => {
  if (!padding) return 'p-4';

  const mobileClass = `p-[${padding.mobile}]`;
  const tabletClass = padding.tablet ? ` md:p-[${padding.tablet}]` : '';
  const desktopClass = padding.desktop ? ` lg:p-[${padding.desktop}]` : '';
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
  const constraints = provider ? PROVIDER_CONSTRAINTS[provider] : PROVIDER_CONSTRAINTS.Generic;
  
  // Merge provided constraints with provider defaults
  const finalMaxWidth = maxWidth || constraints.maxWidth;
  const finalMaxHeight = maxHeight || constraints.maxHeight;
  const { aspectRatio, minHeight, padding } = constraints;

  // Build responsive classes
  const widthClasses = getResponsiveClasses(finalMaxWidth, 'max-w');
  const heightClasses = getResponsiveClasses(finalMaxHeight, 'max-h');
  const aspectRatioClasses = getAspectRatioClasses(aspectRatio);
  const paddingClasses = getPaddingClasses(padding);

  // Base classes for different content types
  const typeClasses = {
    link: 'overflow-hidden rounded-lg bg-white/80',
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
      <div 
        className={`
          content-wrapper relative w-full h-full
          ${aspectRatioClasses}
          ${paddingClasses}
        `}
        style={minHeight ? { minHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
};

export default ContentContainer; 