import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increased to handle multiple images
    },
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Only POST method is supported for bulk upload
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if user is admin
  if (!user.isAdmin) {
    return res.status(403).json({ message: 'Only admins can upload background images' });
  }

  try {
    const { images, description, isPublic } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Process each image
    const results = [];
    const errors = [];

    // Sequential upload to avoid overloading Cloudinary
    for (const image of images) {
      try {
        // Validate file size on server side
        const base64Size = Buffer.from(image.imageData.split(',')[1], 'base64').length;
        if (base64Size > 10 * 1024 * 1024) {
          errors.push({ name: image.name, error: 'File size exceeds 10MB limit' });
          continue;
        }

        // Generate a name if not provided
        const name = image.name || `Background_${Date.now()}_${results.length + 1}`;

        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image.imageData, {
          folder: `librelinks/background_images`,
          public_id: `background_${Date.now()}_${results.length + 1}`,
          transformation: [
            { width: 2560, height: 1440, crop: 'limit', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          resource_type: 'image',
        });

        // Create background image in database
        const backgroundImage = await db.backgroundImage.create({
          data: {
            name,
            description,
            imageUrl: uploadResult.secure_url,
            isPublic: isPublic !== undefined ? isPublic : true,
            userId: user.id,
          },
        });

        results.push(backgroundImage);
      } catch (error) {
        console.error('Error processing image:', error);
        errors.push({ name: image.name, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully uploaded ${results.length} images${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return res.status(500).json({
      message: 'Failed to upload background images',
      error: error.message,
    });
  }
}
