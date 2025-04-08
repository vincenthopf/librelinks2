/**
 * Utility functions for template data handling
 */

/**
 * Validates and prepares template data from user settings
 * @param {Object} currentUser - The current user object
 * @param {string} name - Template name (for the template itself)
 * @param {string} description - Template description
 * @returns {Object} Prepared template data
 */
export const prepareTemplateData = (currentUser, name, description = '') => {
  if (!currentUser || !currentUser.id) {
    throw new Error('Invalid user data');
  }

  if (!name) {
    throw new Error('Template name is required');
  }

  // Ensure JSON fields are properly formatted
  const themePalette = ensureJsonField(currentUser.themePalette, {
    name: 'Light',
    palette: ['#FFFFFF', '#F2F2F2', '#1F2937', '#6170F8'],
  });

  const frameAnimation = ensureJsonField(currentUser.frameAnimation, {
    type: null,
    enabled: false,
    config: {},
  });

  const linkExpansionStates = ensureJsonField(currentUser.linkExpansionStates, null);

  return {
    // Template metadata
    name, // Name of the template itself
    description: description || '',
    isPublic: true, // Default to public, can be changed later
    createdBy: {
      connect: {
        id: currentUser.id,
      },
    },

    // Mirrored User Profile Data
    profileName: currentUser.name || null,
    profileHandle: currentUser.handle || null,
    profileBio: currentUser.bio || null,
    profileImageUrl: currentUser.image || null,

    // Styling & Layout Settings
    linksLocation: currentUser.linksLocation || 'top',
    themePalette,
    buttonStyle: currentUser.buttonStyle || 'rounded-md',
    textCardButtonStyle: currentUser.textCardButtonStyle || 'rounded-md',
    profileNameFontFamily: currentUser.profileNameFontFamily || 'Inter',
    bioFontFamily: currentUser.bioFontFamily || 'Inter',
    linkTitleFontFamily: currentUser.linkTitleFontFamily || 'Inter',
    profileNameFontSize: ensureNumber(currentUser.profileNameFontSize, 16),
    bioFontSize: ensureNumber(currentUser.bioFontSize, 14),
    linkTitleFontSize: ensureNumber(currentUser.linkTitleFontSize, 14),
    profileImageSize: ensureNumber(currentUser.profileImageSize, 70),
    socialIconSize: ensureNumber(currentUser.socialIconSize, 20),
    faviconSize: ensureNumber(currentUser.faviconSize, 32),
    headToPicturePadding: ensureNumber(currentUser.headToPicturePadding, 40),
    pictureToNamePadding: ensureNumber(currentUser.pictureToNamePadding, 16),
    nameToBioPadding: ensureNumber(currentUser.nameToBioPadding, 10),
    bioToSocialPadding: ensureNumber(currentUser.bioToSocialPadding, 16),
    betweenCardsPadding: ensureNumber(currentUser.betweenCardsPadding, 16),
    linkCardHeight: ensureNumber(currentUser.linkCardHeight, 40),
    pageHorizontalMargin: ensureNumber(currentUser.pageHorizontalMargin, 8),
    frameTemplate: currentUser.frameTemplate || 'none',
    frameColor: currentUser.frameColor || '#000000',
    frameThickness: ensureNumber(currentUser.frameThickness, 0),
    frameRotation: ensureNumber(currentUser.frameRotation, 0),
    pictureRotation: ensureNumber(currentUser.pictureRotation, 0),
    syncRotation: Boolean(currentUser.syncRotation),
    frameAnimation,
    frameCornerStyle: currentUser.frameCornerStyle || 'squircle',
    frameBorderRadius: ensureNumber(currentUser.frameBorderRadius, 20),
    frameAllCorners: Boolean(currentUser.frameAllCorners),
    frameTopLeftRadius: ensureNumber(currentUser.frameTopLeftRadius, 20),
    frameTopRightRadius: ensureNumber(currentUser.frameTopRightRadius, 20),
    frameBottomLeftRadius: ensureNumber(currentUser.frameBottomLeftRadius, 20),
    frameBottomRightRadius: ensureNumber(currentUser.frameBottomRightRadius, 20),
    frameWidth: ensureNumber(currentUser.frameWidth, 512),
    frameHeight: ensureNumber(currentUser.frameHeight, 512),
    backgroundImage: currentUser.backgroundImage || null,
    photoBookLayout: currentUser.photoBookLayout || 'grid',
    photoBookOrder: ensureNumber(currentUser.photoBookOrder, 9999),

    // Link Data (to be handled separately during creation/application)
    linkExpansionStates,
  };
};

/**
 * Prepares photo book image data for a template
 * @param {Array} photoBookImages - Array of photo book images
 * @returns {Array} Prepared photo book image data
 */
export const preparePhotoBookImageData = photoBookImages => {
  if (!photoBookImages || !Array.isArray(photoBookImages)) {
    return [];
  }

  return photoBookImages.map(image => ({
    publicId: image.publicId,
    url: image.url,
    title: image.title || null,
    description: image.description || null,
    width: image.width || null,
    height: image.height || null,
    format: image.format || null,
    bytes: image.bytes || null,
    order: image.order || 0,
  }));
};

/**
 * Ensures a value is a valid number or returns default
 * @param {any} value - Value to check
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Valid number
 */
const ensureNumber = (value, defaultValue) => {
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
};

/**
 * Ensures a value is valid JSON or returns default
 * @param {any} value - Value to check
 * @param {Object} defaultValue - Default value if invalid
 * @returns {Object} Valid JSON object
 */
const ensureJsonField = (value, defaultValue) => {
  if (!value) return defaultValue;

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (error) {
    return defaultValue;
  }
};
