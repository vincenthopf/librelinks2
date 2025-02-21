import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ASPECT_RATIOS = {
  video: 'aspect-video', // 16:9
  playlist: 'aspect-square', // 1:1
  link: 'aspect-[4/3]', // 4:3
};

const PROVIDER_HEIGHTS = {
  Spotify: '100%',
  YouTube: '100%',
  Reddit: 'auto',
};

const RichMediaPreview = ({ link }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Iframely script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//cdn.iframe.ly/embed.js';
    script.async = true;
    script.onload = () => {
      // Once script is loaded, initialize any embeds
      if (window.iframely) {
        window.iframely.load();
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []); // Run once on mount

  // Initialize embeds when content changes
  useEffect(() => {
    // Reset states when link changes
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    // Debug logging
    console.log('RichMediaPreview - Link data:', {
      hasEmbedHtml: !!link.embedHtml,
      hasThumbnails: !!(link.thumbnails && link.thumbnails.length > 0),
      type: link.type,
      providerName: link.providerName
    });

    // Initialize embeds if script is already loaded
    if (window.iframely) {
      window.iframely.load();
    }

    // Set loading to false after a short delay to allow initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [link.embedHtml]);

  // Early return if no embed data
  if (!link.embedHtml && (!link.thumbnails || link.thumbnails.length === 0)) {
    console.log('RichMediaPreview - No preview content available');
    return null;
  }

  const aspectRatioClass = ASPECT_RATIOS[link.type || 'link'];
  const heightStyle = PROVIDER_HEIGHTS[link.providerName] || '100%';

  const handleIframeError = (error) => {
    console.error('RichMediaPreview - Iframe error:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error?.message || 'Failed to load preview');
  };

  return (
    <div className="w-full overflow-hidden rounded-lg bg-gray-50">
      <div className={`relative ${aspectRatioClass}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        ) : (
          <>
            {link.embedHtml ? (
              <div 
                className="w-full h-full"
                style={{ minHeight: heightStyle }}
                dangerouslySetInnerHTML={{ __html: link.embedHtml }}
                onError={handleIframeError}
              />
            ) : link.thumbnails?.[0]?.href ? (
              <img
                src={link.thumbnails[0].href}
                alt={link.title || 'Content preview'}
                className="w-full h-full object-cover"
                onLoad={() => setIsLoading(false)}
                onError={handleIframeError}
              />
            ) : null}
          </>
        )}
      </div>
      
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