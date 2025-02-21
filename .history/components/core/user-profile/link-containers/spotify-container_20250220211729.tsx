import React, { useEffect, useRef, useState } from 'react';
import { EmbedConfig } from '@/types/embed';
import ContentContainer from '../content-container';
import { AlertCircle } from 'lucide-react';
import ErrorBoundary from '../../error-boundary';

interface SpotifyContainerProps {
  embedHtml?: string;
  url: string;
  title: string;
  maxWidth?: string;
  config?: Partial<EmbedConfig>;
  className?: string;
}

// ... existing code ...
const getSpotifyUri = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    if (path.includes('/track/')) {
      return path.replace('/track/', '');
    } else if (path.includes('/album/')) {
      return path.replace('/album/', '');
    } else if (path.includes('/playlist/')) {
      return path.replace('/playlist/', '');
    } else if (path.includes('/artist/')) {
      return path.replace('/artist/', '');
    }
    return null;
  } catch {
    return null;
  }
};

// Get embed type from URL
const getEmbedType = (url: string): string => {
  if (url.includes('/track/')) return 'track';
  if (url.includes('/album/')) return 'album';
  if (url.includes('/playlist/')) return 'playlist';
  if (url.includes('/artist/')) return 'artist';
  return 'track';
};

useEffect(() => {
  if (!embedHtml) {
    const uri = getSpotifyUri(url);
    if (!uri) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const type = getEmbedType(url);
    const height = type === 'track' ? '152' : '352';
    
    try {
      const iframe = document.createElement('iframe');
      iframe.src = `https://open.spotify.com/embed/${type}/${uri}?utm_source=generator&theme=0`;
      iframe.width = '100%';
      iframe.height = height;
      iframe.style.border = 'none';
      iframe.style.borderRadius = '12px';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.loading = 'lazy';
      iframe.onload = () => setIsLoading(false);
      iframe.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      
      iframeRef.current = iframe;
      if (containerRef.current) {
        containerRef.current.appendChild(iframe);
      }
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
    }
  } else {
    setIsLoading(false);
  }

  return () => {
    if (iframeRef.current && containerRef.current) {
      containerRef.current.removeChild(iframeRef.current);
    }
  };
}, [embedHtml, url]);

return (
  <ErrorBoundary>
    <ContentContainer
      type="audio"
      maxWidth={{
        mobile: '100%',
        tablet: maxWidth,
        desktop: maxWidth
      }}
      ref={containerRef}
    >
      {isLoading && <LoadingSpinner />}
      {hasError && <ErrorMessage />}
    </ContentContainer>
  </ErrorBoundary>
);
// ... existing code ...

export default SpotifyContainer; 