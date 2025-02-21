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
  Instagram: 'auto',
};

const PROVIDER_SCRIPTS = {
  Instagram: {
    main: 'https://www.instagram.com/embed.js',
    fallback: 'https://cdn.iframe.ly/files/instagram_embed.js'
  }
};

const RichMediaPreview = ({ link }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Debug the incoming link data
  useEffect(() => {
    console.log('RichMediaPreview - Full link data:', {
      ...link,
      thumbnails: link.thumbnails ? JSON.stringify(link.thumbnails) : null
    });
  }, [link]);

  // Handle provider-specific script loading
  useEffect(() => {
    if (!link.providerName || !PROVIDER_SCRIPTS[link.providerName]) {
      // If no special script needed, just load Iframely
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
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }

    // Handle provider-specific scripts (e.g., Instagram)
    const scripts = PROVIDER_SCRIPTS[link.providerName];
    const mainScript = document.createElement('script');
    mainScript.async = true;
    mainScript.src = scripts.main;
    
    // Handle main script error with fallback
    mainScript.onerror = () => {
      console.log('Main script failed, loading fallback');
      const fallbackScript = document.createElement('script');
      fallbackScript.src = scripts.fallback;
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
      document.body.appendChild(fallbackScript);
    };

    // Handle successful main script load
    mainScript.onload = () => {
      console.log('Main script loaded successfully');
      setScriptLoaded(true);
      setIsLoading(false);
    };

    document.body.appendChild(mainScript);
    return () => {
      document.body.removeChild(mainScript);
    };
  }, [link.providerName]);

  // Initialize embeds when content changes or script loads
  useEffect(() => {
    if (!scriptLoaded) return;

    // Reset states
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    // Debug logging
    console.log('RichMediaPreview - Processing link:', {
      hasEmbedHtml: !!link.embedHtml,
      hasThumbnails: !!(link.thumbnails && link.thumbnails.length > 0),
      thumbnailData: link.thumbnails,
      type: link.type,
      providerName: link.providerName
    });

    // Initialize appropriate embed
    if (link.providerName === 'Instagram' && window.instgrm) {
      window.instgrm.Embeds.process();
    } else if (window.iframely) {
      window.iframely.load();
    }

    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [link.embedHtml, scriptLoaded]);

  // Early return if no embed data
  if (!link.embedHtml && (!link.thumbnails || !Array.isArray(link.thumbnails) || link.thumbnails.length === 0)) {
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

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
  };

  const handleImageError = (error) => {
    console.error('Failed to load image:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage('Failed to load preview image');
  };

  // Get the first valid thumbnail URL
  const thumbnailUrl = link.thumbnails && Array.isArray(link.thumbnails) && link.thumbnails.length > 0
    ? (link.thumbnails[0].href || link.thumbnails[0].url)
    : null;

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
            ) : thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={link.title || 'Content preview'}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
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