/**
 * Extract Cloudinary public ID from URL
 */
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' but before file extension
    const publicIdParts = urlParts.slice(uploadIndex + 1);
    const publicId = publicIdParts.join('/').split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Get Cloudinary cloud name from environment
 */
export const getCloudName = () => {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}; 