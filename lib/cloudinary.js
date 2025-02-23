import { v2 as cloudinary } from 'cloudinary';

// Validate required environment variables
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Generate a unique public ID for uploaded images
 */
export const generatePublicId = (userId) => {
  return `user_${userId}_${Date.now()}`;
};

/**
 * Get upload parameters for Cloudinary
 */
export const getUploadParams = (userId) => {
  return {
    folder: `librelinks/user_images/${userId}`,
    public_id: generatePublicId(userId),
    resource_type: 'auto',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  };
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }
  
  return true;
};

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

export default cloudinary; 