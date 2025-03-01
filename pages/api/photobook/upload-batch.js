import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increased size limit for batch uploads
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { photos } = req.body;
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ message: 'No photos provided' });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the highest order value to place new images at the end
    const highestOrderImage = await db.photoBookImage.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' },
    });

    let nextOrder = highestOrderImage ? highestOrderImage.order + 1 : 0;
    const results = [];
    const errors = [];

    // Process each photo
    for (const photoData of photos) {
      const { file, title, description } = photoData;

      if (!file) {
        errors.push({ message: 'Missing file data' });
        continue;
      }

      // Validate file size
      const base64Size = Buffer.from(file.split(',')[1], 'base64').length;
      if (base64Size > 4 * 1024 * 1024) {
        errors.push({ message: 'File size exceeds 4MB limit' });
        continue;
      }

      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file, {
          folder: `librelinks/photobook/${user.id}`,
          public_id: `photobook_${user.id}_${Date.now()}_${results.length}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          resource_type: 'image',
        });

        // Create a new photo book image in the database
        const photoBookImage = await db.photoBookImage.create({
          data: {
            userId: user.id,
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
            title: title || '',
            description: description || '',
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
            order: nextOrder++,
          },
        });

        results.push(photoBookImage);
      } catch (error) {
        console.error('Error processing photo:', error);
        errors.push({
          message: 'Failed to process photo',
          error: error.message,
        });
      }
    }

    // Return the results, including any errors
    return res.status(200).json({
      success: true,
      results,
      errors,
      message: `Successfully uploaded ${results.length} photos${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    });
  } catch (error) {
    console.error('Server error:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
}
