import ccTLDs from './constants/ccltds';
import { SECOND_LEVEL_DOMAINS, SPECIAL_APEX_DOMAINS } from './constants';
import ms from 'ms';

export const getApexDomain = url => {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    return '';
  }
  // special apex domains (e.g. youtu.be)
  if (SPECIAL_APEX_DOMAINS[domain]) return SPECIAL_APEX_DOMAINS[domain];

  const parts = domain.split('.');
  if (parts.length > 2) {
    // if this is a second-level TLD (e.g. co.uk, .com.ua, .org.tt), we need to return the last 3 parts
    if (SECOND_LEVEL_DOMAINS.has(parts[parts.length - 2]) && ccTLDs.has(parts[parts.length - 1])) {
      return parts.slice(-3).join('.');
    }
    // otherwise, it's a subdomain (e.g. dub.vercel.app), so we return the last 2 parts
    return parts.slice(-2).join('.');
  }
  // if it's a normal domain (e.g. dub.sh), we return the domain
  return domain;
};

// Verify the URL entered by user
export const validDomainRegex = new RegExp(
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
);

// Get time link was added
export const timeAgo = timestamp => {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 60000) {
    // less than 1 second
    return 'Just now';
  } else if (diff > 82800000) {
    // more than 23 hours – similar to how Twitter displays timestamps
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }
  return ms(diff);
};

/**
 * Ensures a URL has https:// prefix if no protocol is specified
 * @param {string} url - The URL to process
 * @returns {string} The processed URL with https:// if needed
 */
export const ensureHttps = url => {
  if (!url) return url;

  // If URL already has a protocol, return as is
  if (url.match(/^[a-zA-Z]+:\/\//)) {
    return url;
  }

  // Add https:// prefix
  return `https://${url}`;
};

/**
 * Verify if the URL is valid, adding https:// if needed
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = url => {
  try {
    new URL(ensureHttps(url));
    return true;
  } catch (e) {
    return false;
  }
};

// courtesy of chatgpt
export const getInitials = name => {
  const words = name.split(' ');
  const initials = words.map(word => word.charAt(0).toUpperCase());
  return initials.join('');
};

/**
 * Signals iframes to update content based on the specified type
 * @param {string} type - The type of update to signal:
 *   - 'refresh': Full refresh (use sparingly, may cause performance issues)
 *   - 'update_links': Only update link-related content
 *   - 'update_user': Only update user-related content
 *   - 'update_dimensions': Update frame dimensions without full refresh
 *   - 'update_image': Update image content without full refresh
 * @param {Object} data - Optional data to send with the message
 */
export const signalIframe = (type = 'refresh', data = {}) => {
  // Use requestAnimationFrame to ensure this doesn't block the UI
  requestAnimationFrame(() => {
    try {
      // Validate type
      if (typeof type !== 'string') {
        console.error('Invalid type passed to signalIframe:', type);
        type = 'refresh';
      }

      // For backward compatibility & specific use cases like immediate refresh:
      // Use string message for standard types, object message for others.
      const isStandardType = ['refresh', 'update_links', 'update_user'].includes(type);
      const message = isStandardType ? type : { type, ...data };

      // Refresh desktop preview
      const iframe = document.getElementById('preview');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*');
      }

      // Refresh mobile preview
      const mobileIframe = document.getElementById('preview-mobile');
      if (mobileIframe && mobileIframe.contentWindow) {
        mobileIframe.contentWindow.postMessage(message, '*');
      }
    } catch (error) {
      // Silent failure
      console.error('Error in signalIframe:', error);
    }
  });
};

export const removeHashFromHexColor = hexColor => {
  // Use a regular expression to match the # symbol at the beginning
  return hexColor.replace(/^#/, '');
};

export const getCurrentBaseURL = () => {
  if (typeof window !== 'undefined') {
    const baseURL = window.location.origin;
    return baseURL;
  }
};
