/* eslint-disable @next/next/no-img-element */
import { getApexDomain, removeHashFromHexColor } from '@/utils/helpers';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useState } from 'react';

/**
 * @typedef {Object} RetryState
 * @property {number} svgAttempts - Number of SVG service retry attempts
 * @property {number} googleAttempts - Number of Google Favicon retry attempts
 * @property {number} currentSize - Current icon size being used
 */

export const SocialCards = ({ url, title, color, registerClicks }) => {
  const validColor = removeHashFromHexColor(color);
  const { data: currentUser } = useCurrentUser();
  const iconSize = currentUser?.socialIconSize || 30;

  const [retryState, setRetryState] = useState({
    svgAttempts: 0,
    googleAttempts: 0,
    currentSize: iconSize
  });

  // checking for website aliases: adding more soon
  const specialCases = {
    x: 'twitter',
    fb: 'facebook',
    pin: 'pinterest',
    discordapp: 'discord',
    t: 'telegram',
  };

  const getSocialMediaName = (url) => {
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
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
        className="hover:scale-125 transition-all rounded-full px-2"
      >
        <img
          loading="lazy"
          src={`https://s2.svgbox.net/social.svg?color=${validColor}&ic=${socialIcon}`}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
          alt={title}
        />
      </a>
    </>
  );
};
