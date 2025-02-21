import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RichMediaPreview from './rich-media-preview';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import { getApexDomain } from '@/utils/helpers';

const LinkCard = (props) => {
  const [showPreview, setShowPreview] = useState(false);
  const isTransparent = props.buttonStyle.includes('bg-transparent');
  const hasShadowProp = props.buttonStyle.includes('shadow');

  const style = {
    background: isTransparent ? 'transparent' : props.theme.secondary,
    display: props.archived ? 'none' : 'flex',
    border: `1.5px solid ${props.theme.neutral}`,
    boxShadow: hasShadowProp ? `5px 5px 0 0 ${props.theme.neutral}` : '',
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

  const hasPreview = iframelyData.embedHtml || (iframelyData.thumbnails && iframelyData.thumbnails.length > 0);

  return (
    <div className="w-full mb-4 transition-all duration-300">
      <div className="relative">
        <a
          href={props.url}
          onClick={props.registerClicks}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full rounded-lg p-4 ${props.buttonStyle} transition-all duration-300`}
          style={style}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 flex-grow pr-8">
              <div className="h-8 w-8">
                <img
                  src={`${GOOGLE_FAVICON_URL}${getApexDomain(props.url)}`}
                  alt={props.title}
                  className="h-8 w-8 rounded-full"
                  loading="lazy"
                />
              </div>
              <h2 className="font-medium">{props.title}</h2>
            </div>
          </div>
          {hasPreview && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPreview(!showPreview);
              }}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}
        </a>
      </div>
      
      <div className={`transition-all duration-300 ${showPreview ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <RichMediaPreview link={iframelyData} />
      </div>
    </div>
  );
};

export default LinkCard;
