import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RichMediaPreview from './rich-media-preview';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import { getApexDomain } from '@/utils/helpers';
import Head from 'next/head';

const LinkCard = props => {
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

  // Ensure buttonStyle is a string and provide a default if missing
  const buttonStyle = typeof props.buttonStyle === 'string' ? props.buttonStyle : 'rounded-md'; // Default style

  // Ensure theme is an object and provide defaults if missing
  const theme = props.theme || {};
  const themeSecondary = theme.secondary || '#f8f8f8'; // Default secondary color
  const themeNeutral = theme.neutral || '#888888'; // Default neutral color
  const themeAccent = theme.accent || '#000000'; // Default accent color
  const themeEmbedBackground = theme.embedBackground || 'transparent'; // Default embed background

  const isTransparent = buttonStyle.includes('bg-transparent');
  const hasShadowProp = buttonStyle.includes('shadow');
  const isHorizontalOnly = buttonStyle.includes('horizontal-only');
  const isBottomOnly = buttonStyle.includes('bottom-only');

  const faviconSize = props.faviconSize || 32;
  const richMediaContainerRef = useRef(null);
  const previewRef = useRef(null);

  // Extract domain for preconnect optimization
  const apexDomain = getApexDomain(props.url);

  // Load preview immediately if content exists
  useEffect(() => {
    const hasContent = !!(props.embedHtml || (props.thumbnails && props.thumbnails.length > 0));
    if (hasContent) {
      setIsPreviewLoaded(true);
    }
  }, [props.embedHtml, props.thumbnails]);

  // Update showPreview state based on prop and keep it controlling visibility
  useEffect(() => {
    setShowPreview(!!props.alwaysExpandEmbed);
  }, [props.alwaysExpandEmbed, props.id]);

  const style = {
    background: isTransparent ? 'transparent' : themeSecondary,
    display: props.archived ? 'none' : 'flex',
    boxShadow: hasShadowProp ? `5px 5px 0 0 ${themeNeutral}` : '',
    height: `${props.cardHeight || 40}px`,
  };

  // Apply border styles conditionally and explicitly
  if (isHorizontalOnly) {
    style.borderTop = `1.5px solid ${themeNeutral}`;
    style.borderBottom = `1.5px solid ${themeNeutral}`;
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else if (isBottomOnly) {
    style.borderBottom = `1.5px solid ${themeNeutral}`;
    style.borderTop = 'none';
    style.borderLeft = 'none';
    style.borderRight = 'none';
  } else {
    // Default case: apply border to all sides
    style.border = `1.5px solid ${themeNeutral}`;
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

  const hasPreview = !!(
    iframelyData.embedHtml ||
    (iframelyData.thumbnails && iframelyData.thumbnails.length > 0)
  );

  // Apply animation styles from props if provided
  const animationStyles = props.animationStyle || {};
  const animationClass = props.className || '';
  const contentAnimation = props.contentAnimation;

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
            className={`block w-full ${buttonStyle} p-4 transition-all duration-300`}
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
                    color: themeAccent,
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
                  setShowPreview(prev => !prev);
                }}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              >
                {showPreview ? (
                  <ChevronUp className="w-5 h-5" style={{ color: themeAccent }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: themeAccent }} />
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
            background: showPreview ? themeEmbedBackground : 'transparent',
            transform: 'translateZ(0)',
          }}
          onPointerEnter={() => {
            if (typeof props.registerClicks === 'function') {
              props.registerClicks();
            }
          }}
        >
          <div ref={previewRef}>
            {isPreviewLoaded && hasPreview && (
              <RichMediaPreview
                link={iframelyData}
                embedBackground={themeEmbedBackground}
                contentAnimation={contentAnimation}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkCard;
