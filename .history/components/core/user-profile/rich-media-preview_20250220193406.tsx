import { useState, useEffect, useRef } from 'react';
import { EMBED_CONFIGS } from '@/config/embed';
import { RichMediaContent, EmbedConfig } from '@/types/embed';
import { AlertCircle } from 'lucide-react';

interface RichMediaPreviewProps {
  link: RichMediaContent;
  config?: Partial<EmbedConfig>;
}

const RichMediaPreview = ({ link, config }: RichMediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const providerConfig = EMBED_CONFIGS[link.providerName] || EMBED_CONFIGS.Generic;
  const mergedConfig = { ...providerConfig, ...config };

  useEffect(() => {
    if (!link.embedHtml || !embedRef.current) return;

    // Create a temporary div to parse the embed HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = link.embedHtml;
    const scripts = Array.from(tempDiv.getElementsByTagName('script'));

    const loadScripts = async () => {
      for (const originalScript of scripts) {
        const script = document.createElement('script');
        Array.from(originalScript.attributes).forEach(attr => {
          script.setAttribute(attr.name, attr.value);
        });
        script.text = originalScript.text;
        try {
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            embedRef.current?.appendChild(script);
          });
        } catch (error) {
          console.error('Error loading embed script:', error);
          setHasError(true);
        }
      }
      setIsLoading(false);
    };

    loadScripts();

    return () => {
      const scripts = embedRef.current?.getElementsByTagName('script');
      if (scripts) {
        Array.from(scripts).forEach(script => script.remove());
      }
    };
  }, [link.embedHtml]);

  const renderContent = () => {
    if (link.type === 'photo' && link.url) {
      return (
        <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-lg">
          <img
            src={link.url}
            alt={link.title || ''}
            className="h-full w-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    if ((link.type === 'rich' || link.type === 'video') && link.embedHtml) {
      const processedHtml = mergedConfig.processHtml 
        ? mergedConfig.processHtml(link.embedHtml)
        : link.embedHtml;

      return (
        <div 
          ref={embedRef}
          className={`relative w-full overflow-hidden rounded-lg ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } transition-opacity duration-300`}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      );
    }

    if (link.thumbnails?.[0]) {
      return (
        <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-lg">
          <img
            src={link.thumbnails[0].href || link.thumbnails[0].url}
            alt={link.title || ''}
            className="h-full w-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="rich-media-preview relative">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Failed to load content</p>
          </div>
        </div>
      )}

      {/* Content */}
      {renderContent()}

      {/* Description */}
      {link.description && !hasError && !isLoading && (
        <div className="mt-3 px-4 py-2 bg-gray-50/50 rounded-md">
          <p className="text-sm text-gray-600 line-clamp-2">
            {link.description}
          </p>
          {link.provider && (
            <p className="mt-2 text-xs text-gray-400">
              {link.provider}
              {link.author && ` • ${link.author}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RichMediaPreview; 