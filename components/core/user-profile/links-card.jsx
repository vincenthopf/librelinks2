import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RichMediaPreview from './rich-media-preview';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import { getApexDomain } from '@/utils/helpers';

const LinkCard = props => {
  const [showPreview, setShowPreview] = useState(props.alwaysExpandEmbed || false);
  const isTransparent = props.buttonStyle.includes('bg-transparent');
  const hasShadowProp = props.buttonStyle.includes('shadow');
  const isHorizontalOnly = props.buttonStyle.includes('horizontal-only');
  const isBottomOnly = props.buttonStyle.includes('bottom-only');
  const faviconSize = props.faviconSize || 32;
  const richMediaContainerRef = useRef(null);

  // Update showPreview state when alwaysExpandEmbed prop changes
  useEffect(() => {
    console.log(`Link ${props.id} - alwaysExpandEmbed changed to:`, props.alwaysExpandEmbed);
    // Always set the state explicitly based on the prop value
    setShowPreview(!!props.alwaysExpandEmbed);
  }, [props.alwaysExpandEmbed, props.id]);

  // --- REMOVE Capture Phase Listener Effect ---
  // useEffect(() => { ... capture listener code ... }, [props.registerClicks, props.url]);

  // --- REMOVE Blur Listener Effect ---
  // useEffect(() => {
  //   const handleBlur = () => {
  //     // ... blur listener code ...
  //   };
  //   window.addEventListener('blur', handleBlur);
  //   return () => {
  //     window.removeEventListener('blur', handleBlur);
  //   };
  // }, [props.url, props.registerClicks]);

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

  return (
    <div
      className="w-full transition-all duration-300"
      onClick={props.registerClicks}
      style={{ cursor: 'pointer' }}
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
            console.log(
              '[Anchor Click] Stopping propagation and calling registerClicks for:',
              props.url
            );
            if (typeof props.registerClicks === 'function') {
              props.registerClicks();
            } else {
              console.warn('[Anchor Click] registerClicks is not a function');
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
                  src={`${GOOGLE_FAVICON_URL}${getApexDomain(props.url)}`}
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
        className={`transition-all duration-300 rounded-lg overflow-hidden ${
          showPreview ? 'opacity-100 mt-2' : 'opacity-0 h-0'
        }`}
        style={{
          height: showPreview ? 'auto' : '0',
          visibility: showPreview ? 'visible' : 'hidden',
          marginBottom: showPreview ? '8px' : '0',
          background: showPreview ? props.theme.embedBackground || 'transparent' : 'transparent',
        }}
        onPointerEnter={() => {
          console.log('[Pointer Enter] Embed container entered, registering click for:', props.url);
          if (typeof props.registerClicks === 'function') {
            props.registerClicks();
          } else {
            console.warn('[Pointer Enter] registerClicks is not a function');
          }
        }}
      >
        {showPreview && (
          <RichMediaPreview link={iframelyData} embedBackground={props.theme.embedBackground} />
        )}
      </div>
    </div>
  );
};

export default LinkCard;
