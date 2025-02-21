import { useState, useEffect, useRef } from 'react';
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
  const scriptRef = useRef(null);
  const initializeCount = useRef(0);

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
      if (!link.providerName || !PROVIDER_SCRIPTS[link.providerName]) {
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
        const scripts = PROVIDER_SCRIPTS[link.providerName];
        const mainScript = document.createElement('script');
        mainScript.async = true;
        mainScript.src = scripts.main;
        
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
          scriptRef.current = fallbackScript;
          document.body.appendChild(fallbackScript);
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
  }, [link.providerName]);

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