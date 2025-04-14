import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  embedBackground?: string;
  frameAnimation?: any;
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

// Global script tracking
const loadedScripts: Record<string, boolean> = {};

const RichMediaPreview = ({
  link,
  config,
  embedBackground,
  frameAnimation,
}: RichMediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const initializeCount = useRef(0);
  const idleCallbackHandle = useRef<number | null>(null);

  // Get provider config
  const providerConfig = EMBED_CONFIGS[link.providerName] || EMBED_CONFIGS.Generic;
  const mergedConfig = { ...providerConfig, ...config };

  // Initialize embeds when content changes or script loads
  const initializeEmbed = useCallback(() => {
    initializeCount.current += 1;

    // Process only if we have embed HTML
    if (!link.embedHtml) {
      setIsLoading(false);
      return;
    }

    // Initialize appropriate embed based on provider
    if (link.providerName === 'Instagram' && window.instgrm) {
      window.instgrm.Embeds.process();
    } else if (link.providerName === 'Twitter' && window.twttr) {
      window.twttr.widgets.load();
    } else if (window.iframely) {
      window.iframely.load();
    }

    // If the script was already loaded when initializeEmbed was called, loading should stop now.
    if (scriptLoaded) {
      setIsLoading(false);
    }
  }, [link.embedHtml, link.providerName, scriptLoaded]);

  // Handle provider-specific script loading
  const loadEmbedScripts = useCallback(() => {
    // Skip if scripts are already loaded
    if (scriptLoaded) return;

    const scriptConfig = mergedConfig.script;
    const scriptUrl = scriptConfig?.main || '//cdn.iframe.ly/embed.js';

    // Check if script is already loaded globally
    if (loadedScripts[scriptUrl]) {
      setScriptLoaded(true);
      // Initialize immediately, don't wait for idle
      initializeEmbed();
      // No need for idleCallbackHandle here
      return;
    }

    const loadScript = (url: string, onSuccess: () => void, onError: () => void) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = onSuccess;
      script.onerror = onError;
      document.body.appendChild(script);
      return script;
    };

    // Load main script
    loadScript(
      scriptUrl,
      () => {
        loadedScripts[scriptUrl] = true;
        setScriptLoaded(true);
        // Initialize immediately and set loading false
        initializeEmbed();
        setIsLoading(false);
        // No need for idleCallbackHandle here
      },
      () => {
        // Try fallback if available
        if (scriptConfig?.fallback && !loadedScripts[scriptConfig.fallback]) {
          loadScript(
            scriptConfig.fallback,
            () => {
              loadedScripts[scriptConfig.fallback!] = true;
              setScriptLoaded(true);
              // Initialize immediately and set loading false
              initializeEmbed();
              setIsLoading(false);
              // No need for idleCallbackHandle here
            },
            () => {
              setHasError(true);
              setErrorMessage('Failed to load preview service');
              setIsLoading(false);
            }
          );
        } else {
          setHasError(true);
          setErrorMessage('Failed to load preview service');
          setIsLoading(false);
        }
      }
    );
  }, [scriptLoaded, mergedConfig.script, initializeEmbed]);

  // ADD Effect to trigger eager loading on mount
  useEffect(() => {
    // Start loading scripts soon after component mounts,
    // using requestIdleCallback to avoid blocking initial render too much.
    const handle = window.requestIdleCallback
      ? window.requestIdleCallback(loadEmbedScripts)
      : window.setTimeout(loadEmbedScripts, 50); // Short delay fallback

    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, [loadEmbedScripts]); // Run when loadEmbedScripts is stable

  // Force re-initialization when content changes
  useEffect(() => {
    if (scriptLoaded && link.embedHtml) {
      // Initialize immediately, don't wait for idle
      initializeEmbed();
      // No need for idleCallbackHandle here
    }
  }, [link.embedHtml, scriptLoaded, initializeEmbed]);

  // Early return if no embed data
  if (
    !link.embedHtml &&
    (!link.thumbnails || !Array.isArray(link.thumbnails) || link.thumbnails.length === 0)
  ) {
    return null;
  }

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview');
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview image');
  };

  // Get the first valid thumbnail URL
  const thumbnailUrl =
    link.thumbnails && Array.isArray(link.thumbnails) && link.thumbnails.length > 0
      ? link.thumbnails[0].href || link.thumbnails[0].url
      : null;

  // Process HTML if needed
  const processedHtml =
    link.embedHtml && mergedConfig.processHtml
      ? mergedConfig.processHtml(link.embedHtml)
      : link.embedHtml;

  // Render content based on provider
  const renderContent = () => {
    const content = processedHtml ? (
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
        onError={handleIframeError}
      />
    ) : thumbnailUrl ? (
      <img
        src={thumbnailUrl}
        alt={link.title || 'Content preview'}
        className="w-full h-full object-cover"
        loading="eager" // Use eager loading for visible content
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    ) : null;

    // Pass frameAnimation to all containers
    const commonContainerProps = {
      config: mergedConfig,
      isLoading,
      hasError,
      embedBackground,
      frameAnimation,
    };

    switch (link.providerName) {
      case 'Instagram':
        return (
          <InstagramContainer {...commonContainerProps}>
            <div className="instagram-embed-scaling w-full h-full">{content}</div>
          </InstagramContainer>
        );
      case 'YouTube':
        return <YouTubeContainer {...commonContainerProps}>{content}</YouTubeContainer>;
      case 'Twitter':
        return <TwitterContainer {...commonContainerProps}>{content}</TwitterContainer>;
      default:
        return <GenericContainer {...commonContainerProps}>{content}</GenericContainer>;
    }
  };

  return <div ref={embedRef}>{renderContent()}</div>;
};

export default RichMediaPreview;
