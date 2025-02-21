/**
 * Configuration for embed scaling
 */
export const SCALING_CONFIG = {
  padding: {
    desktop: 16, // 1rem
    mobile: 12, // 0.75rem
  },
  transition: {
    duration: 300,
    easing: 'ease-in-out',
  },
  providers: {
    Instagram: {
      defaultWidth: 550,
      defaultHeight: 550,
    },
    Spotify: {
      defaultWidth: 380,
      defaultHeight: 380,
    },
  },
};

/**
 * Parse dimensions from embed HTML
 * @param {string} html - Embed HTML string
 * @returns {Object} Parsed dimensions
 */
export function parseEmbedDimensions(html) {
  if (!html) return null;

  // Try to extract width/height from attributes
  const widthMatch = html.match(/width=["'](\d+)["']/);
  const heightMatch = html.match(/height=["'](\d+)["']/);

  // Try to extract from inline styles
  const styleMatch = html.match(/style=["']([^"']+)["']/);
  let styleWidth, styleHeight;

  if (styleMatch) {
    const style = styleMatch[1];
    styleWidth = style.match(/width:\s*(\d+)px/);
    styleHeight = style.match(/height:\s*(\d+)px/);
  }

  return {
    width: parseInt(widthMatch?.[1] || styleWidth?.[1] || 0),
    height: parseInt(heightMatch?.[1] || styleHeight?.[1] || 0),
  };
}

/**
 * Calculate scaling dimensions
 * @param {Object} params - Scaling parameters
 * @returns {Object} Calculated dimensions and scaling
 */
export function calculateScaling({
  containerWidth,
  embedHtml,
  providerName,
  isMobile = false,
}) {
  // Get padding based on viewport
  const padding = isMobile
    ? SCALING_CONFIG.padding.mobile
    : SCALING_CONFIG.padding.desktop;

  // Available width after padding
  const availableWidth = containerWidth - padding * 2;

  // Get original dimensions
  let dimensions = parseEmbedDimensions(embedHtml);

  // Use provider defaults if parsing fails
  if (!dimensions?.width || !dimensions?.height) {
    dimensions = SCALING_CONFIG.providers[providerName] || {
      width: availableWidth,
      height: availableWidth,
    };
  }

  // Calculate scaling ratio
  const ratio = availableWidth / dimensions.width;

  // Calculate new dimensions
  const newDimensions = {
    width: availableWidth,
    height: Math.round(dimensions.height * ratio),
  };

  return {
    dimensions: newDimensions,
    ratio,
    padding,
  };
}

/**
 * Generate scaling styles
 * @param {Object} scaling - Scaling calculations
 * @returns {Object} CSS styles object
 */
export function getScalingStyles(scaling) {
  return {
    width: `${scaling.dimensions.width}px`,
    height: `${scaling.dimensions.height}px`,
    padding: `${scaling.padding}px`,
    transition: `all ${SCALING_CONFIG.transition.duration}ms ${SCALING_CONFIG.transition.easing}`,
  };
}
