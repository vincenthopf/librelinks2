/**
 * Utility functions for working with Bento grid view
 */

// Default spans for different content types
const DEFAULT_SPANS = {
  link: 'md:col-span-1 md:row-span-1 sm:col-span-1 sm:row-span-1',
  text: 'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-1',
  photo: 'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2',
  photobook: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2',
  video: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2',
};

// Fixed span options to choose from (for UI)
export const SPAN_OPTIONS = [
  {
    id: 'small',
    label: 'Small',
    span: 'md:col-span-1 md:row-span-1 sm:col-span-1 sm:row-span-1',
    size: '1x1',
  },
  {
    id: 'medium',
    label: 'Medium',
    span: 'md:col-span-1 md:row-span-2 sm:col-span-1 sm:row-span-2',
    size: '1x2',
  },
  {
    id: 'large',
    label: 'Large',
    span: 'md:col-span-2 md:row-span-2 sm:col-span-2 sm:row-span-2',
    size: '2x2',
  },
  {
    id: 'wide',
    label: 'Wide',
    span: 'md:col-span-2 md:row-span-1 sm:col-span-2 sm:row-span-1',
    size: '2x1',
  },
  {
    id: 'tall',
    label: 'Tall',
    span: 'md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2',
    size: '1x3',
  },
  {
    id: 'featured',
    label: 'Featured',
    span: 'md:col-span-2 md:row-span-3 sm:col-span-2 sm:row-span-2',
    size: '2x3',
  },
];

/**
 * Detect the type of content to determine default styling
 * @param {Object} item - The content item
 * @returns {String} The content type ('link', 'text', 'photo', 'photobook', 'video')
 */
export const detectContentType = item => {
  if (item.type === 'photobook') return 'photobook';

  if (item.url) {
    // Check if it's a photo by URL
    if (item.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return 'photo';
    }

    // Check if it's a video by URL
    if (
      item.url.match(/\.(mp4|webm|ogg|mov)$/i) ||
      item.url.includes('youtube.com') ||
      item.url.includes('vimeo.com')
    ) {
      return 'video';
    }

    // Otherwise, it's a link
    return 'link';
  }

  // If it has content property but no URL, it's a text item
  if (item.content) {
    return 'text';
  }

  // Default to link type
  return 'link';
};

/**
 * Get appropriate gradient colors for an item based on type
 * @param {Object} item - The content item
 * @param {Object} theme - The theme settings
 * @returns {Array} Two color values for gradient
 */
export const getItemGradient = (item, theme) => {
  const type = item.type || detectContentType(item);

  switch (type) {
    case 'text':
      return [theme.accent, theme.neutral];
    case 'link':
      return [theme.neutral, theme.secondary];
    case 'photo':
    case 'photobook':
      return [theme.primary, theme.secondary];
    case 'video':
      return [theme.accent, theme.primary];
    default:
      return [theme.primary, theme.secondary];
  }
};

/**
 * Convert links, texts, and photos to a bento-compatible format
 * @param {Array} links - User links
 * @param {Array} texts - User texts
 * @param {Array} photos - User photos
 * @param {Array} userBentoSettings - User's stored bento grid settings (structure)
 * @param {Object} theme - Theme colors
 * @param {number | null} photoBookOrder - Position for the photobook (deprecated if using userBentoSettings)
 * @returns {Array} Formatted items for bento grid
 */
export const mapContentToBentoItems = (
  links = [],
  texts = [],
  photos = [],
  userBentoSettings = [],
  theme,
  photoBookOrder
) => {
  // If userBentoSettings exists and is valid, use it as the primary structure
  if (userBentoSettings && Array.isArray(userBentoSettings) && userBentoSettings.length > 0) {
    return userBentoSettings
      .map(setting => {
        let contentItem = null;
        let itemType = setting.type;

        // Find the corresponding content based on ID and type
        if (itemType === 'link') {
          contentItem = links.find(l => l.id === setting.id && !l.archived);
        } else if (itemType === 'text') {
          contentItem = texts.find(t => t.id === setting.id && !t.archived);
        } else if (itemType === 'photo') {
          contentItem = photos.find(p => p.id === setting.id);
        } else if (itemType === 'photobook') {
          // Handle photobook placeholder if defined in settings
          contentItem = { id: 'photobook', type: 'photobook', title: 'Photo Gallery' };
        }

        // If content not found for a setting, skip it (or provide a placeholder)
        if (!contentItem) {
          // Optionally return a placeholder for missing items
          // return { id: setting.id, type: 'placeholder', span: setting.span || DEFAULT_SPANS.link, order: setting.order };
          return null; // Or simply skip
        }

        const contentType = contentItem.type || detectContentType(contentItem);
        const spanClass = setting.span || DEFAULT_SPANS[contentType] || DEFAULT_SPANS.link;
        const gradient = getItemGradient(contentItem, theme);

        return {
          ...contentItem, // Spread the actual content data
          id: setting.id, // Ensure ID from setting is used
          type: contentType, // Ensure correct type
          span: spanClass,
          gradient,
          order: setting.order, // Use order from settings
          desc: contentItem.content || contentItem.description || '',
          fontFamily: contentItem.fontFamily,
          fontSize: contentItem.fontSize,
          // Ensure URL is included for favicon generation
          url: contentItem.url || '',
          // Include embedHtml for rich content detection
          embedHtml: contentItem.embedHtml || '',
        };
      })
      .filter(item => item !== null); // Remove null items (where content wasn't found)
  }

  // --- Fallback logic if userBentoSettings is empty or invalid ---
  // This part creates a default layout if no user settings exist
  const allContent = [
    ...(links?.filter(link => !link.isSocial && !link.archived) || []).map(l => ({
      ...l,
      type: 'link',
    })),
    ...(texts?.filter(text => !text.archived) || []).map(t => ({ ...t, type: 'text' })),
    ...(photos || []).map(p => ({
      id: p.id,
      type: 'photo',
      title: p.title || 'Photo',
      desc: p.description || '',
      url: p.url,
      order: p.order,
    })),
  ].sort((a, b) => a.order - b.order); // Sort by original content order

  return allContent.map((item, index) => {
    const contentType = item.type || detectContentType(item);
    const spanClass = DEFAULT_SPANS[contentType] || DEFAULT_SPANS.link;
    const gradient = getItemGradient(item, theme);

    return {
      ...item,
      span: spanClass,
      gradient,
      order: index, // Assign order based on the combined list
      desc: item.content || item.description || '',
      // Ensure URL is included for favicon generation
      url: item.url || '',
      // Include embedHtml for rich content detection
      embedHtml: item.embedHtml || '',
    };
  });
};

/**
 * Update the span setting for a specific bento item
 * @param {Array} bentoItems - Current bento item settings
 * @param {String} itemId - ID of the item to update
 * @param {String} span - New span class string
 * @returns {Array} Updated bento items array
 */
export const updateBentoItemSpan = (bentoItems, itemId, span) => {
  // Find existing item
  const existingIndex = bentoItems.findIndex(item => item.id === itemId);

  if (existingIndex >= 0) {
    // Update existing item
    const newItems = [...bentoItems];
    newItems[existingIndex] = {
      ...newItems[existingIndex],
      span,
    };
    return newItems;
  } else {
    // Add new item
    return [...bentoItems, { id: itemId, span }];
  }
};

export default {
  mapContentToBentoItems,
  updateBentoItemSpan,
  detectContentType,
  getItemGradient,
  SPAN_OPTIONS,
  DEFAULT_SPANS,
};
