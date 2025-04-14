import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RichMediaPreview from './rich-media-preview';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import { getApexDomain } from '@/utils/helpers';
import Head from 'next/head';

const LinkCard = props => {
  const [showPreview, setShowPreview] = useState(props.alwaysExpandEmbed || false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const isTransparent = props.buttonStyle.includes('bg-transparent');
  const hasShadowProp = props.buttonStyle.includes('shadow');
  const isHorizontalOnly = props.buttonStyle.includes('horizontal-only');
  const isBottomOnly = props.buttonStyle.includes('bottom-only');
  const faviconSize = props.faviconSize || 32;
  const richMediaContainerRef = useRef(null);
  const previewRef = useRef(null);

  // Extract domain for preconnect optimization
  const apexDomain = getApexDomain(props.url);

  // Update showPreview state when alwaysExpandEmbed prop changes
  useEffect(() => {
    setShowPreview(!!props.alwaysExpandEmbed);

    // If it should be expanded by default, mark as loaded
    if (!!props.alwaysExpandEmbed) {
      setIsPreviewLoaded(true);
    }
  }, [props.alwaysExpandEmbed, props.id]);

  // Preload the preview content when component mounts or when relevant props change
  useEffect(() => {
    // If we have embed HTML or thumbnails, preload the preview
    const hasContent = props.embedHtml || (props.thumbnails && props.thumbnails.length > 0);

    if (hasContent && !isPreviewLoaded) {
      // Start loading the preview data immediately, even if not visible yet
      setIsPreviewLoaded(true);
    }
  }, [props.embedHtml, props.thumbnails, isPreviewLoaded]);

  // Optimize transition performance with IntersectionObserver
  useEffect(() => {
    if (!richMediaContainerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && !isPreviewLoaded) {
          setIsPreviewLoaded(true);
        }
      },
      { rootMargin: '200px' } // Start loading when within 200px of viewport
    );

    observer.observe(richMediaContainerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isPreviewLoaded]);

  const style = {
    background: isTransparent ? 'transparent' : props.theme.secondary,
    display: props.archived ? 'none' : 'flex',
    boxShadow: hasShadowProp ? `5px 5px 0 0 ${props.theme.neutral}` : '',
    minHeight: `${props.cardHeight || 40}px`,
  };

  // Apply border styles conditionally and explicitly
  if (isHorizontalOnly) {
    style.borderTop = `1.5px solid ${props.theme.neutral}`;
    style.borderBottom = `1.5px solid ${props.theme.neutral}`;
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else if (isBottomOnly) {
    style.borderBottom = `1.5px solid ${props.theme.neutral}`;
    style.borderTop = 'none';
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else {
    // Default case: apply border to all sides
    style.border = `1.5px solid ${props.theme.neutral}`;
  }

  // Extract only the Iframely-related props
  const iframelyData = {
    embedHtml: props.embedHtml,
    thumbnails: props.thumbnails,
    type: props.type,
    providerName: props.providerName,
    title: props.title,
    iframelyMeta: props.iframelyMeta,
  };

  const hasPreview =
    iframelyData.embedHtml || (iframelyData.thumbnails && iframelyData.thumbnails.length > 0);

  // Apply animation styles from props if provided
  const animationStyles = props.animationStyle || {};
  const animationClass = props.className || '';
  const frameAnimation = props.frameAnimation;

  return (
    <>
      {/* Add preconnect hints for faster loading */}
      <Head>
        {apexDomain && <link rel="preconnect" href={`https://${apexDomain}`} />}
        {apexDomain && <link rel="dns-prefetch" href={`https://${apexDomain}`} />}
        <link rel="preconnect" href={GOOGLE_FAVICON_URL.replace('https://', '')} />
      </Head>

      <div
        className={`w-full transition-all duration-300 ${animationClass}`}
        onClick={props.registerClicks}
        style={{ cursor: 'pointer', ...animationStyles }}
      >
        <div className="relative">
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full ${props.buttonStyle} p-4 transition-all duration-300`}
            style={style}
            onClick={e => {
              e.stopPropagation();
              if (typeof props.registerClicks === 'function') {
                props.registerClicks();
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-grow pr-8">
                <div
                  style={{
                    width: `${faviconSize}px`,
                    height: `${faviconSize}px`,
                  }}
                >
                  <img
                    src={`${GOOGLE_FAVICON_URL}${apexDomain}`}
                    alt={props.title}
                    style={{
                      width: `${faviconSize}px`,
                      height: `${faviconSize}px`,
                    }}
                    className="rounded-full"
                    loading="lazy"
                  />
                </div>
                <h2
                  className="font-medium"
                  style={{
                    fontSize: `${props.fontSize || 14}px`,
                    fontFamily: props.fontFamily || 'Inter',
                    color: props.theme.accent,
                  }}
                >
                  {props.title}
                </h2>
              </div>
            </div>
            {hasPreview && (
              <button
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPreview(!showPreview);
                }}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? (
                  <ChevronUp className="w-5 h-5" style={{ color: props.theme.accent }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: props.theme.accent }} />
                )}
              </button>
            )}
          </a>
        </div>

        <div
          ref={richMediaContainerRef}
          className={`transition-all duration-300 rounded-lg overflow-hidden will-change-transform ${
            showPreview ? 'opacity-100 mt-2' : 'opacity-0 h-0'
          }`}
          style={{
            height: showPreview ? 'auto' : '0',
            visibility: showPreview ? 'visible' : 'hidden',
            marginBottom: showPreview ? '8px' : '0',
            background: showPreview ? props.theme.embedBackground || 'transparent' : 'transparent',
            transform: 'translateZ(0)', // Hardware acceleration
          }}
          onPointerEnter={() => {
            if (typeof props.registerClicks === 'function') {
              props.registerClicks();
            }
          }}
        >
          {/* Always render the preview component but with conditional visibility */}
          <div ref={previewRef} style={{ display: showPreview ? 'block' : 'none' }}>
            {isPreviewLoaded && (
              <RichMediaPreview
                link={iframelyData}
                embedBackground={props.theme.embedBackground}
                frameAnimation={frameAnimation}
              />
            )}
            {!isPreviewLoaded && showPreview && (
              <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded">
                <div className="w-6 h-6 border-t-2 border-accent animate-spin rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkCard;
