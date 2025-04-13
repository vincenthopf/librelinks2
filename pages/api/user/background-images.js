import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import cloudinary from '@/lib/cloudinary';
import { z } from 'zod';
import { db } from '@/lib/db';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Input validation schema
const uploadSchema = z.object({
  file: z.string().refine(
    file => file.startsWith('data:image/'), // Basic check for image data URI
    { message: 'Invalid file format. Only image data URIs are allowed.' }
  ),
  // Optional: Add other fields like title/description if needed later
  // title: z.string().optional(),
  // description: z.string().optional(),
});

export default async function handler(req, res) {
  // Get session and verify auth
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Handle GET request - fetch user's custom background images
  if (req.method === 'GET') {
    try {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
          customBackgroundImages: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the array (or an empty array if null/undefined)
      return res.status(200).json(user.customBackgroundImages || []);
    } catch (error) {
      console.error('API GET error:', error);
      return res.status(500).json({
        message: 'Internal server error',
        error: error.message || 'Unknown error',
      });
    }
  }

  // Handle POST request - upload new background image
  if (req.method === 'POST') {
    try {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate input
      const validationResult = uploadSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid input',
          errors: validationResult.error.errors,
        });
      }

      const { file } = validationResult.data;

      // Validate file size from base64 string
      // Estimate size: base64 length * 3/4
      const base64Data = file.split(',')[1];
      if (!base64Data) {
        return res.status(400).json({ message: 'Invalid base64 file data' });
      }
      const estimatedSize = base64Data.length * (3 / 4);
      if (estimatedSize > MAX_FILE_SIZE) {
        return res.status(400).json({
          message: `File size exceeds the 10MB limit. Estimated size: ${(estimatedSize / (1024 * 1024)).toFixed(2)}MB`,
        });
      }

      // Upload to Cloudinary
      let uploadResult;
      try {
        uploadResult = await cloudinary.uploader.upload(file, {
          folder: `librelinks/user_backgrounds/${user.id}`, // User-specific folder
          public_id: `user_${user.id}_bg_${Date.now()}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'], // Match ALLOWED_TYPES
          transformation: [
            // Add any desired transformations, e.g., optimization
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1920, crop: 'limit' }, // Limit width for sanity
          ],
          // Cloudinary will validate format and potentially size again
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          message: 'Failed to upload image to Cloudinary',
          error: cloudinaryError.message || 'Unknown Cloudinary error',
        });
      }

      // Update user's custom background images array
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          customBackgroundImages: {
            push: uploadResult.secure_url,
          },
        },
        select: {
          customBackgroundImages: true,
        },
      });

      return res.status(200).json({
        message: 'Background image uploaded successfully',
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        updatedCustomImages: updatedUser.customBackgroundImages,
      });
    } catch (error) {
      console.error('API route error:', error);
      // Handle JSON parsing errors separately
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Invalid JSON body' });
      }

      return res.status(500).json({
        message: 'Internal server error',
        error: error.message || 'Unknown error',
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
