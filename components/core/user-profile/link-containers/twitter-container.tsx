import React, { useEffect, useRef, useState } from 'react';
import { EmbedConfig } from '@/types/embed';
import ContentContainer from '../content-container';
import { AlertCircle, Twitter } from 'lucide-react';
import ErrorBoundary from '../../error-boundary';

interface TwitterContainerProps {
  embedHtml?: string;
  url: string;
  title: string;
  maxWidth?: string;
  config?: Partial<EmbedConfig>;
  className?: string;
}

declare global {
  interface Window {
    twttr: {
      widgets: {
        load: (element?: HTMLElement) => Promise<void>;
      };
    };
  }
}

const TwitterContainer: React.FC<TwitterContainerProps> = ({
  embedHtml,
  url,
  title,
  maxWidth = '550px',
  config,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const loadTwitterScript = () => {
      if (window.twttr) {
        setIsScriptLoaded(true);
        window.twttr.widgets.load(containerRef.current || undefined);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
        if (window.twttr) {
          window.twttr.widgets.load(containerRef.current || undefined);
        }
      };
      script.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      scriptRef.current = script;
      document.body.appendChild(script);
    };

    loadTwitterScript();

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.twttr) {
      window.twttr.widgets.load(containerRef.current || undefined)
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setHasError(true);
          setIsLoading(false);
        });
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
          className="relative w-full min-h-[250px] overflow-hidden"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Twitter className="w-8 h-8 text-gray-400 animate-pulse" />
                <p className="text-sm text-gray-500">Loading Twitter content...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">Failed to load Twitter content</p>
              </div>
            </div>
          )}

          {/* Twitter Content */}
          {embedHtml ? (
            <div
              className={`twitter-embed w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
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
                <Twitter className="w-5 h-5" />
                <span className="text-sm font-medium">{title}</span>
              </a>
            </div>
          )}
        </div>
      </ContentContainer>
    </ErrorBoundary>
  );
};

export default TwitterContainer; 