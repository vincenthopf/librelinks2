/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { getApexDomain, removeHashFromHexColor } from '@/utils/helpers';
import { GOOGLE_FAVICON_URL } from '@/utils/constants';
import useCurrentUser from '@/hooks/useCurrentUser';

export const SocialCards = ({ url, title, color, registerClicks }) => {
  const validColor = removeHashFromHexColor(color);
  const { data: currentUser } = useCurrentUser();
  const iconSize = currentUser?.socialIconSize || 30;

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
