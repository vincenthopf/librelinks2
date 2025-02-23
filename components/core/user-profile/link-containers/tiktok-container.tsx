import React, { useEffect, useRef, useState } from 'react';
import { EmbedConfig } from '@/types/embed';
import ContentContainer from '../content-container';
import { AlertCircle } from 'lucide-react';
import ErrorBoundary from '../../error-boundary';

interface TikTokContainerProps {
  embedHtml?: string;
  url: string;
  title: string;
  maxWidth?: string;
  config?: Partial<EmbedConfig>;
  className?: string;
}

declare global {
  interface Window {
    TikTok: {
      embed: {
        load: () => void;
      };
    };
  }
}

const TikTokContainer: React.FC<TikTokContainerProps> = ({
  embedHtml,
  url,
  title,
  maxWidth = 'auto',
  config,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const loadTikTokScript = () => {
      if (window.TikTok) {
        setIsScriptLoaded(true);
        window.TikTok.embed.load();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        if (window.TikTok) {
          window.TikTok.embed.load();
        }
      };
      script.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      scriptRef.current = script;
      document.body.appendChild(script);
    };

    loadTikTokScript();

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.TikTok) {
      try {
        window.TikTok.embed.load();
        setIsLoading(false);
      } catch (error) {
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [embedHtml, isScriptLoaded]);

  return (
    <ErrorBoundary>
      <ContentContainer
        type="social"
        maxWidth={{
          mobile: '100%',
          tablet: maxWidth,
          desktop: maxWidth
        }}
        className={className}
      >
        <div 
          ref={containerRef}
          className="relative w-full min-h-[575px] overflow-hidden"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading TikTok content...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Failed to load TikTok content</p>
              </div>
            </div>
          )}

          {/* TikTok Content */}
          {embedHtml ? (
            <div
              className={`tiktok-embed w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              dangerouslySetInnerHTML={{ __html: embedHtml }}
            />
          ) : (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 015.17-2.39V12.1a6.32 6.32 0 00-1.37-.17 6.35 6.35 0 106.35 6.35V9.41a8.16 8.16 0 005.27 1.92V7.88a4.85 4.85 0 01-3-1.19z"/>
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

export default TikTokContainer; 