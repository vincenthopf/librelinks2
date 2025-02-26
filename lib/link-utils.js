/**
 * Utility functions for link data handling
 */

/**
 * Validates and prepares link data for template creation
 * @param {Array} links - Array of user links
 * @returns {Object} Prepared link creation data
 */
export const prepareLinkData = (links = []) => {
  if (!Array.isArray(links)) {
    throw new Error('Invalid links data');
  }

  return {
    create: links.map((link, index) => {
      if (!link.title || !link.url) {
        throw new Error(`Invalid link data at index ${index}`);
      }

      return {
        title: link.title,
        url: link.url,
        isSocial: link.isSocial || false,
        order: link.order || index,
        // Optional metadata fields
        type: link.type || null,
        providerName: link.providerName || null,
        embedHtml: link.embedHtml || null,
        thumbnails: ensureJsonField(link.thumbnails, null),
        authorName: link.authorName || null,
        authorUrl: link.authorUrl || null,
        iframelyMeta: ensureJsonField(link.iframelyMeta, null),
      };
    }),
  };
};

/**
 * Ensures a value is valid JSON or returns default
 * @param {any} value - Value to check
 * @param {any} defaultValue - Default value if invalid
 * @returns {any} Valid JSON object or default value
 */
const ensureJsonField = (value, defaultValue) => {
  if (!value) return defaultValue;

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    return defaultValue;
  }
};
