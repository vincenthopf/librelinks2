import React, { useEffect, useRef, useState } from 'react';
import { EmbedConfig } from '@/types/embed';

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

const TikTokContainer: React.FC<TikTokContainerProps> = ({ embedHtml, url, title }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
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
      } catch (error) {
        console.error('Failed to load TikTok embed:', error);
      }
    }
  }, [embedHtml, isScriptLoaded]);

  // This is a React fragment with no wrapper elements, just rendering the HTML directly
  return embedHtml ? (
    <>{React.createElement('div', { dangerouslySetInnerHTML: { __html: embedHtml } })}</>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  );
};

export default TikTokContainer;
