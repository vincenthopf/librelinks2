/**
 * Utility functions for Plausible Analytics tracking with user IDs
 */

/**
 * Track a custom event with user ID
 * @param {string} eventName - Name of the event to track
 * @param {Object} userId - User ID to associate with the event
 * @param {Object} additionalProps - Additional properties to track
 * @returns {boolean} - Whether the event was successfully tracked
 */
export const trackEvent = (eventName, userId, additionalProps = {}) => {
  if (!window.plausible) {
    console.error('Plausible not loaded');
    return false;
  }

  try {
    window.plausible(eventName, {
      props: {
        userId,
        ...additionalProps,
      },
    });
    return true;
  } catch (error) {
    console.error('Error tracking Plausible event:', error);
    return false;
  }
};

/**
 * Track a page view with user ID
 * @param {string} userId - User ID to associate with the page view
 * @param {Object} additionalProps - Additional properties to track
 * @returns {boolean} - Whether the page view was successfully tracked
 */
export const trackPageView = (userId, additionalProps = {}) => {
  if (!window.plausible) {
    console.error('Plausible not loaded');
    return false;
  }

  try {
    window.plausible('pageview', {
      props: {
        userId,
        ...additionalProps,
      },
    });
    return true;
  } catch (error) {
    console.error('Error tracking Plausible page view:', error);
    return false;
  }
};

/**
 * Track a link click with user ID
 * @param {string} url - URL that was clicked
 * @param {string} userId - User ID to associate with the click
 * @param {Object} additionalProps - Additional properties to track
 * @returns {boolean} - Whether the click was successfully tracked
 */
export const trackLinkClick = (url, userId, additionalProps = {}) => {
  return trackEvent('click', userId, { url, ...additionalProps });
};

/**
 * Check if Plausible is available and initialized
 * @returns {boolean} - Whether Plausible is available
 */
export const isPlausibleAvailable = () => {
  return typeof window !== 'undefined' && !!window.plausible;
};
