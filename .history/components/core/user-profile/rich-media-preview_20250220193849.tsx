import { useState, useEffect, useRef } from 'react';
import { EMBED_CONFIGS } from '@/config/embed';
import { RichMediaContent, EmbedConfig } from '@/types/embed';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface RichMediaPreviewProps {
  link: RichMediaContent;
  config?: Partial<EmbedConfig>;
  appearance?: 'minimal' | 'vertical';
}

const RichMediaPreview = ({ link, config, appearance = 'vertical' }: RichMediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const providerConfig = EMBED_CONFIGS[link.providerName] || EMBED_CONFIGS.Generic;
  const mergedConfig = { ...providerConfig, ...config };

  useEffect(() => {
    // Only load embed scripts for vertical mode and when metadata exists
    if (appearance !== 'vertical' || !link.embedHtml || !embedRef.current) return;

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
  }, [link.embedHtml, appearance]);

  const renderRichMedia = () => {
    if (!link || appearance === 'minimal') return null;

    if (link.type === 'photo' && link.url) {
      return (
        <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-lg mt-4">
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
          className="relative rounded-lg overflow-hidden mt-4"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
      );
    }

    if (link.thumbnails?.[0]) {
      return (
        <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-lg mt-4">
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

  const renderMetadata = () => {
    if (!link || appearance === 'minimal') return null;

    return (
      <div className="relative z-10">
        {renderRichMedia()}
        
        <div className="mt-4">
          {/* Collapsible Content */}
          <div
            ref={contentRef}
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 py-2 bg-accent/50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900">
                {link.title}
              </h4>
              {link.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {link.description}
                </p>
              )}
              {link.provider && (
                <p className="mt-2 text-xs text-gray-400">
                  {link.provider}
                  {link.author && ` • ${link.author}`}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-2 w-full text-sm font-medium text-primary-muted hover:text-primary flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Show details</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (!link) return null;

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
      {renderMetadata()}
    </div>
  );
};

export default RichMediaPreview; 