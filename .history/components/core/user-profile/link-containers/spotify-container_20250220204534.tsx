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

const SpotifyContainer: React.FC<SpotifyContainerProps> = ({
  embedHtml,
  url,
  title,
  maxWidth = '325px',
  config,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Extract Spotify URI from URL
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
      const height = type === 'track' ? '1000' : '380';
      
      try {
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/${type}/${uri}`;
        iframe.width = '100%';
        iframe.height = height;
        iframe.frameBorder = '0';
        iframe.allow = 'encrypted-media';
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
        className={className}
      >
        <div 
          ref={containerRef}
          className="relative w-full min-h-[1000px] overflow-hidden"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <p className="text-sm text-gray-500">Loading Spotify content...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Failed to load Spotify content</p>
              </div>
            </div>
          )}

          {/* Spotify Content */}
          {embedHtml && (
            <div
              className={`spotify-embed w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          )}

          {/* Fallback */}
          {!embedHtml && hasError && (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="text-sm font-medium">{title}</span>
              </a>
            </div>
          )}
        </div>
      </ContentContainer>
    </ErrorBoundary>
  );
};

export default SpotifyContainer; 