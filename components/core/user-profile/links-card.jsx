import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RichMediaPreview from './rich-media-preview';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import { getApexDomain } from '@/utils/helpers';
import useCurrentUser from '@/hooks/useCurrentUser';

const LinkCard = props => {
  const [showPreview, setShowPreview] = useState(props.alwaysExpandEmbed || false);
  const { data: currentUser } = useCurrentUser();
  const isTransparent = props.buttonStyle.includes('bg-transparent');
  const hasShadowProp = props.buttonStyle.includes('shadow');
  const isHorizontalOnly = props.buttonStyle.includes('horizontal-only');
  const isBottomOnly = props.buttonStyle.includes('bottom-only');
  const faviconSize = currentUser?.faviconSize || 32;

  // Update showPreview state when alwaysExpandEmbed prop changes
  useEffect(() => {
    if (props.alwaysExpandEmbed !== undefined) {
      setShowPreview(props.alwaysExpandEmbed);
    }
  }, [props.alwaysExpandEmbed]);

  const style = {
    background: isTransparent ? 'transparent' : props.theme.secondary,
    display: props.archived ? 'none' : 'flex',
    border: isHorizontalOnly || isBottomOnly ? 'none' : `1.5px solid ${props.theme.neutral}`,
    borderTop: isHorizontalOnly && !isBottomOnly ? `1.5px solid ${props.theme.neutral}` : undefined,
    borderBottom:
      isHorizontalOnly || isBottomOnly ? `1.5px solid ${props.theme.neutral}` : undefined,
    boxShadow: hasShadowProp ? `5px 5px 0 0 ${props.theme.neutral}` : '',
    minHeight: `${props.cardHeight || 40}px`,
  };

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
    <div className="w-full transition-all duration-300">
      <div className="relative">
        <a
          href={props.url}
          onClick={props.registerClicks}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full ${props.buttonStyle} p-4 transition-all duration-300`}
          style={style}
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
        className={`transition-all duration-300 bg-white rounded-lg ${showPreview ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0 '}`}
      >
        <RichMediaPreview link={iframelyData} />
      </div>
    </div>
  );
};

export default LinkCard;
