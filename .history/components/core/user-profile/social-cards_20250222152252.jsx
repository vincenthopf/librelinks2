/* eslint-disable @next/next/no-img-element */
import { getApexDomain, removeHashFromHexColor } from '@/utils/helpers';
import useCurrentUser from '@/hooks/useCurrentUser';
import { useState } from 'react';

/**
 * List of services supported by the SVG icon service
 * @type {readonly string[]}
 */
const SVG_SUPPORTED_SERVICES = [
  'aboutdotme', 'airbnb', 'amazon', 'angellist', 'applepodcasts', 'apple',
  'applemusic', 'applepay', 'appletv', 'appstore', 'askfm', 'behance',
  'bing', 'bitbucket', 'blogger', 'box', 'brave', 'buzzfeed',
  'codechef', 'codepen', 'coinbase', 'coursera', 'crunchbase', 'crunchyroll',
  'dailymotion', 'devdotto', 'deviantart', 'digg', 'discord', 'discourse',
  'disqus', 'dribbble', 'dropbox', 'duckduckgo', 'ebay', 'etsy',
  'eventbrite', 'evernote', 'facebook', 'fandom', 'firefox', 'fitbit',
  'flattr', 'flickr', 'foursquare', 'freelancer', 'genius', 'ghost',
  'giphy', 'github', 'glassdoor', 'gmail', 'goodreads', 'googlepodcasts',
  'google', 'googlecalendar', 'googlechrome', 'googledrive', 'googleearth',
  'googlenews', 'googlepay', 'googleplay', 'googletranslate', 'gumroad',
  'hackerone', 'hackerrank', 'imdb', 'imgur', 'instacart', 'instagram',
  'instapaper', 'itunes', 'kaggle', 'kickstarter', 'line', 'linkedin',
  'livejournal', 'lyft', 'medium', 'meetup', 'messenger', 'myspace',
  'netflix', 'nextdoor', 'opera', 'patreon', 'paypal', 'pinboard',
  'pinterest', 'pocket', 'producthunt', 'protonmail', 'quora', 'reddit',
  'rss', 'safari', 'scribd', 'signal', 'skype', 'slack',
  'slideshare', 'snapchat', 'soundcloud', 'spotify', 'stackexchange',
  'stackoverflow', 'steam', 'strava', 'telegram', 'tiktok', 'tinder',
  'tor', 'trello', 'tumblr', 'twitch', 'twitter', 'uber',
  'udacity', 'unsplash', 'upwork', 'venmo', 'viber', 'vimeo',
  'wattpad', 'wikipedia', 'wix', 'wordpress', 'ycombinator', 'yelp',
  'youtube', 'youtubemusic', 'zoom'
].map(service => service.toLowerCase().replace(/\s+/g, ''));

/**
 * @typedef {Object} RetryState
 * @property {number} svgAttempts - Number of SVG service retry attempts
 * @property {number} googleAttempts - Number of Google Favicon retry attempts
 * @property {number} currentSize - Current icon size being used
 */

/**
 * @typedef {Object} UrlComponents
 * @property {string} domain - The apex domain of the URL
 * @property {string} path - The URL path
 * @property {string} fullIdentifier - Combined hostname and path
 */

const GOOGLE_SIZES = [64, 48, 32, 24, 16];

/**
 * Get the nearest smaller Google-supported icon size
 * @param {number} currentSize - Current icon size
 * @returns {number} - Next smaller Google-supported size
 */
const getNearestSmallerGoogleSize = (currentSize) => {
  return GOOGLE_SIZES.find(size => size < currentSize) || 16;
};

/**
 * Generate SVG service URL
 * @param {string} socialIcon - Social media icon name
 * @param {string} color - Icon color
 * @returns {string} - SVG service URL
 */
const getSvgUrl = (socialIcon, color) => {
  return `https://s2.svgbox.net/social.svg?color=${color}&ic=${socialIcon}`;
};

/**
 * Generate Google Favicon URL
 * @param {string} url - Website URL
 * @param {number} size - Icon size
 * @returns {string} - Google Favicon URL
 */
const getGoogleFaviconUrl = (url, size) => {
  return `https://www.google.com/s2/favicons?domain=${url}&sz=${size}`;
};

export const SocialCards = ({ url, title, color, registerClicks }) => {
  const validColor = removeHashFromHexColor(color);
  const { data: currentUser } = useCurrentUser();
  const iconSize = currentUser?.socialIconSize || 30;

  const [retryState, setRetryState] = useState({
    svgAttempts: 0,
    googleAttempts: 0,
    currentSize: iconSize
  });

  /**
   * Handle SVG service load errors
   */
  const handleSvgError = () => {
    if (retryState.svgAttempts < 3) {
      // Retry SVG with delay
      setTimeout(() => {
        setRetryState(prev => ({
          ...prev,
          svgAttempts: prev.svgAttempts + 1
        }));
      }, 1000); // 1 second delay between retries
    } else {
      // Switch to Google Favicon
      setRetryState(prev => ({
        ...prev,
        svgAttempts: 3, // Max out
        googleAttempts: 0 // Reset Google attempts
      }));
    }
  };

  /**
   * Handle Google Favicon load errors
   */
  const handleGoogleError = () => {
    if (retryState.googleAttempts < 3) {
      const nextSize = getNearestSmallerGoogleSize(retryState.currentSize);
      setTimeout(() => {
        setRetryState(prev => ({
          ...prev,
          googleAttempts: prev.googleAttempts + 1,
          currentSize: nextSize
        }));
      }, 1000);
    }
  };

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
      {retryState.svgAttempts < 3 ? (
        // Primary SVG Icon
        <img
          loading="lazy"
          src={getSvgUrl(socialIcon, validColor)}
          onError={handleSvgError}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
          alt={title}
        />
      ) : (
        // Google Favicon Fallback
        <img
          loading="lazy"
          src={getGoogleFaviconUrl(url, retryState.currentSize)}
          onError={handleGoogleError}
          style={{
            width: `${iconSize}px`,
            height: `${iconSize}px`,
          }}
          alt={title}
        />
      )}
    </a>
  );
};
