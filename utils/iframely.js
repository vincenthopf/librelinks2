const IFRAMELY_API_KEY = process.env.NEXT_PUBLIC_IFRAMELY_API_KEY;
const IFRAMELY_BASE_URL = 'https://iframe.ly/api/iframely';

/**
 * Fetches rich media data from Iframely API for a given URL
 * @param {string} url - The URL to fetch rich media data for
 * @returns {Promise<Object|null>} The Iframely response data or null if there's an error
 */
export async function fetchIframelyData(url) {
  try {
    const response = await fetch(
      `${IFRAMELY_BASE_URL}?url=${encodeURIComponent(
        url
      )}&api_key=${IFRAMELY_API_KEY}`
    );

    if (!response.ok) {
      console.error('Iframely API error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Iframely fetch error:', error);
    return null;
  }
}

/**
 * Processes the raw Iframely response into a standardized format
 * @param {Object} iframelyData - The raw Iframely API response
 * @returns {Object} Processed and standardized rich media data
 */
export function processIframelyResponse(iframelyData) {
  if (!iframelyData) {
    return {
      type: 'link',
      title: null,
      description: null,
      thumbnails: null,
      embedHtml: null,
      iframelyMeta: null,
    };
  }

  const thumbnails = iframelyData.links?.thumbnail || [];
  const html = iframelyData.html;

  // Process HTML to ensure it's responsive and fits our container
  let processedHtml = html;
  if (html) {
    // Add responsive wrapper and sizing
    processedHtml = html
      .replace(/width="\d+"/, 'width="100%"')
      .replace(/height="\d+"/, 'height="100%"');
  }

  return {
    type: iframelyData.meta?.medium || iframelyData.type || 'link',
    title: iframelyData.meta?.title,
    description: iframelyData.meta?.description,
    providerName: iframelyData.meta?.site,
    authorName: iframelyData.meta?.author,
    authorUrl: iframelyData.meta?.author_url,
    thumbnails: thumbnails.length > 0 ? thumbnails : null,
    embedHtml: processedHtml,
    iframelyMeta: iframelyData.meta || null,
  };
}
