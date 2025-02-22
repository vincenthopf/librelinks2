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

/**
 * Sanitize and parse a URL for icon detection
 * @param {string} url - The URL to process
 * @returns {UrlComponents} Parsed URL components
 */
const parseUrlForIcon = (url) => {
  try {
    // Handle relative URLs or URLs without protocol
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);
    
    return {
      domain: getApexDomain(normalizedUrl),
      path: urlObj.pathname,
      fullIdentifier: `${urlObj.hostname}${urlObj.pathname}`.toLowerCase()
    };
  } catch (error) {
    // Fallback for malformed URLs
    return {
      domain: getApexDomain(url),
      path: '',
      fullIdentifier: url.toLowerCase()
    };
  }
};

/**
 * Clean and normalize a service name for comparison
 * @param {string} name - The service name to normalize
 * @returns {string} Normalized service name
 */
const normalizeServiceName = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/\s+/g, '');      // Remove spaces
};

/**
 * @typedef {'svg' | 'favicon'} IconServiceType
 */

/**
 * @typedef {Object} IconService
 * @property {IconServiceType} type - The type of icon service to use
 * @property {string} identifier - The service identifier or domain
 */

/**
 * Detect the appropriate icon service for a URL
 * @param {UrlComponents} urlComponents - The parsed URL components
 * @returns {IconService} The detected icon service
 */
const detectIconService = (urlComponents) => {
  // First try matching against the full URL (including path)
  const normalizedFullPath = normalizeServiceName(urlComponents.fullIdentifier);
  const serviceFromPath = SVG_SUPPORTED_SERVICES.find(
    service => normalizedFullPath.includes(service)
  );

  if (serviceFromPath) {
    return {
      type: 'svg',
      identifier: serviceFromPath
    };
  }

  // Then try matching just the domain
  const normalizedDomain = normalizeServiceName(urlComponents.domain);
  const serviceFromDomain = SVG_SUPPORTED_SERVICES.find(
    service => normalizedDomain.includes(service)
  );

  if (serviceFromDomain) {
    return {
      type: 'svg',
      identifier: serviceFromDomain
    };
  }

  // Fallback to favicon
  return {
    type: 'favicon',
    identifier: urlComponents.domain
  };
};

export const SocialCards = ({ url, title, color, registerClicks }) => {
  const validColor = removeHashFromHexColor(color);
  const { data: currentUser } = useCurrentUser();
  const iconSize = currentUser?.socialIconSize || 30;

  // Parse URL and detect service
  const urlComponents = parseUrlForIcon(url);
  const iconService = detectIconService(urlComponents);

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
      }, 1000);
    } else {
      // Switch to Google Favicon
      setRetryState(prev => ({
        ...prev,
        svgAttempts: 3,
        googleAttempts: 0
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

  /**
   * Get the current icon URL based on service and state
   * @returns {string} The icon URL
   */
  const getIconUrl = () => {
    // If SVG service is detected and hasn't failed, use it
    if (iconService.type === 'svg' && retryState.svgAttempts < 3) {
      return getSvgUrl(iconService.identifier, validColor);
    }
    // Otherwise use Google Favicon
    return getGoogleFaviconUrl(urlComponents.domain, retryState.currentSize);
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
      <img
        loading="lazy"
        src={getIconUrl()}
        onError={iconService.type === 'svg' && retryState.svgAttempts < 3 ? handleSvgError : handleGoogleError}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
        }}
        alt={title}
      />
    </a>
  );
};
