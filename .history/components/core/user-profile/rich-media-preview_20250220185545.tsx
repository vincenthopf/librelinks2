import { useState, useEffect, useRef } from 'react';
import { EMBED_CONFIGS } from '@/config/embed';
import { RichMediaContent, EmbedConfig } from '@/types/embed';
import {
  InstagramContainer,
  YouTubeContainer,
  TwitterContainer,
  GenericContainer,
} from './embed-containers';

interface RichMediaPreviewProps {
  link: RichMediaContent;
  config?: Partial<EmbedConfig>;
}

declare global {
  interface Window {
    iframely: {
      load: () => void;
    };
    instgrm: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const RichMediaPreview = ({ link, config }: RichMediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const initializeCount = useRef(0);

  // Get provider config
  const providerConfig = EMBED_CONFIGS[link.providerName] || EMBED_CONFIGS.Generic;
  const mergedConfig = { ...providerConfig, ...config };

  // Debug the incoming link data
  useEffect(() => {
    console.log('RichMediaPreview - Component mounted/updated with link:', {
      providerName: link.providerName,
      hasEmbedHtml: !!link.embedHtml,
      scriptLoaded,
      isLoading
    });
  }, [link, scriptLoaded, isLoading]);

  // Handle provider-specific script loading
  useEffect(() => {
    console.log('Script loading effect triggered:', {
      providerName: link.providerName,
      hasScript: !!scriptRef.current
    });

    // Don't reload if script is already loaded
    if (scriptRef.current || scriptLoaded) {
      console.log('Script already loaded, skipping');
      return;
    }

    const loadScript = () => {
      const scriptConfig = mergedConfig.script;
      if (!scriptConfig) {
        console.log('Loading Iframely script');
        const script = document.createElement('script');
        script.src = '//cdn.iframe.ly/embed.js';
        script.async = true;
        script.onload = () => {
          console.log('Iframely script loaded successfully');
          if (window.iframely) {
            window.iframely.load();
          }
          setScriptLoaded(true);
          setIsLoading(false);
        };
        script.onerror = () => {
          console.error('Failed to load Iframely script');
          setHasError(true);
          setErrorMessage('Failed to load preview service');
        };
        scriptRef.current = script;
        document.body.appendChild(script);
      } else {
        console.log('Loading provider script:', link.providerName);
        const mainScript = document.createElement('script');
        mainScript.async = true;
        mainScript.src = scriptConfig.main;
        
        mainScript.onerror = () => {
          if (scriptConfig.fallback) {
            console.log('Main script failed, loading fallback');
            const fallbackScript = document.createElement('script');
            fallbackScript.src = scriptConfig.fallback;
            fallbackScript.async = true;
            fallbackScript.onload = () => {
              console.log('Fallback script loaded successfully');
              setScriptLoaded(true);
              setIsLoading(false);
            };
            fallbackScript.onerror = () => {
              console.error('Both main and fallback scripts failed');
              setHasError(true);
              setErrorMessage('Failed to load preview service');
            };
            scriptRef.current = fallbackScript;
            document.body.appendChild(fallbackScript);
          } else {
            setHasError(true);
            setErrorMessage('Failed to load preview service');
          }
        };

        mainScript.onload = () => {
          console.log('Main script loaded successfully');
          setScriptLoaded(true);
          setIsLoading(false);
        };

        scriptRef.current = mainScript;
        document.body.appendChild(mainScript);
      }
    };

    loadScript();

    return () => {
      if (scriptRef.current) {
        console.log('Cleaning up script');
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [link.providerName, mergedConfig.script]);

  // Initialize embeds when content changes or script loads
  useEffect(() => {
    if (!scriptLoaded) {
      console.log('Script not loaded yet, skipping initialization');
      return;
    }

    initializeCount.current += 1;
    console.log('Initializing embed:', {
      count: initializeCount.current,
      providerName: link.providerName,
      hasEmbedHtml: !!link.embedHtml
    });

    // Only reset loading state on first initialization
    if (initializeCount.current === 1) {
      setIsLoading(true);
    }

    // Initialize appropriate embed
    if (link.providerName === 'Instagram' && window.instgrm) {
      console.log('Processing Instagram embed');
      window.instgrm.Embeds.process();
    } else if (window.iframely) {
      console.log('Processing Iframely embed');
      window.iframely.load();
    }

    // Set loading to false after initialization
    const timer = setTimeout(() => {
      console.log('Setting loading to false after initialization');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [link.embedHtml, scriptLoaded]);

  // Early return if no embed data
  if (!link.embedHtml && (!link.thumbnails || !Array.isArray(link.thumbnails) || link.thumbnails.length === 0)) {
    console.log('RichMediaPreview - No preview content available');
    return null;
  }

  const handleIframeError = (error: Event) => {
    console.error('RichMediaPreview - Iframe error:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview');
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
  };

  const handleImageError = (error: Event) => {
    console.error('Failed to load image:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview image');
  };

  // Get the first valid thumbnail URL
  const thumbnailUrl = link.thumbnails && Array.isArray(link.thumbnails) && link.thumbnails.length > 0
    ? (link.thumbnails[0].href || link.thumbnails[0].url)
    : null;

  // Process HTML if needed
  const processedHtml = link.embedHtml && mergedConfig.processHtml
    ? mergedConfig.processHtml(link.embedHtml)
    : link.embedHtml;

  // Render content based on provider
  const renderContent = () => {
    const content = processedHtml ? (
      <div 
        className="w-full h-full relative"
        style={{ 
          minHeight: link.providerName === 'Spotify' ? '352px' : undefined,
          maxWidth: link.providerName === 'Spotify' ? '100%' : undefined
        }}
      >
        <div 
          className="absolute inset-0"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
          onError={handleIframeError}
        />
      </div>
    ) : thumbnailUrl ? (
      <img
        src={thumbnailUrl}
        alt={link.title || 'Content preview'}
        className="w-full h-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    ) : null;

    switch (link.providerName) {
      case 'Spotify':
        return (
          <div className="spotify-embed-wrapper w-full max-w-[500px] mx-auto">
            <InstagramContainer
              config={mergedConfig}
              isLoading={isLoading}
              hasError={hasError}
            >
              {content}
            </InstagramContainer>
          </div>
        );
      case 'Instagram':
        return (
          <div className="instagram-embed-wrapper w-full max-w-[540px] mx-auto">
            <InstagramContainer
              config={mergedConfig}
              isLoading={isLoading}
              hasError={hasError}
            >
              {content}
            </InstagramContainer>
          </div>
        );
      case 'YouTube':
        return (
          <div className="youtube-embed-wrapper w-full">
            <YouTubeContainer
              config={mergedConfig}
              isLoading={isLoading}
              hasError={hasError}
            >
              {content}
            </YouTubeContainer>
          </div>
        );
      case 'Twitter':
        return (
          <div className="twitter-embed-wrapper w-full max-w-[550px] mx-auto">
            <TwitterContainer
              config={mergedConfig}
              isLoading={isLoading}
              hasError={hasError}
            >
              {content}
            </TwitterContainer>
          </div>
        );
      default:
        return (
          <div className="generic-embed-wrapper w-full">
            <GenericContainer
              config={mergedConfig}
              isLoading={isLoading}
              hasError={hasError}
            >
              {content}
            </GenericContainer>
          </div>
        );
    }
  };

  return (
    <div className="rich-media-preview w-full">
      {renderContent()}
      {link.iframelyMeta?.description && !hasError && !isLoading && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {link.iframelyMeta.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default RichMediaPreview; 