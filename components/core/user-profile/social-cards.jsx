/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { getApexDomain, removeHashFromHexColor } from '@/utils/helpers';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';

export const SocialCards = ({ url, title, color, socialIconSize, registerClicks }) => {
  const validColor = removeHashFromHexColor(color);
  const iconSize = socialIconSize || 30;
  const [svgLoadError, setSvgLoadError] = useState(false);

  // checking for website aliases: adding more soon
  const specialCases = {
    x: 'twitter',
    fb: 'facebook',
    pin: 'pinterest',
    discordapp: 'discord',
    t: 'telegram',
  };

  const getSocialMediaName = url => {
    const domainURL = getApexDomain(url);
    // Use a regular expression to match only the site name
    const siteName = domainURL.match(/^[^.]+/);

    if (siteName && !(siteName in specialCases)) {
      return siteName[0];
    } else {
      return specialCases[siteName[0]];
    }
  };

  const socialIcon = getSocialMediaName(url);

  return (
    <>
      <a
        onClick={registerClicks}
        target="_blank"
        href={url}
        className="hover:scale-125 transition-all rounded-full px-2"
      >
        <div
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
            display: '-webkit-flex',
            display: 'flex',
            WebkitAlignItems: 'center',
            alignItems: 'center',
            WebkitJustifyContent: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            loading="lazy"
            src={
              svgLoadError
                ? `${GOOGLE_FAVICON_URL}${getApexDomain(url)}`
                : `https://s2.svgbox.net/social.svg?color=${validColor}&ic=${socialIcon}`
            }
            onError={() => {
              console.warn(`SVG icon failed to load for ${url}, falling back to favicon`);
              setSvgLoadError(true);
            }}
            style={{
              width: '100%',
              height: '100%',
              WebkitObjectFit: 'contain',
              objectFit: 'contain',
            }}
            alt={title}
          />
        </div>
      </a>
    </>
  );
};
