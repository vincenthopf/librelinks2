import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
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

    const { file, title, description } = req.body;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Validate file size on server side as well
    const base64Size = Buffer.from(file.split(',')[1], 'base64').length;
    if (base64Size > 4 * 1024 * 1024) {
      return res.status(400).json({ message: 'File size exceeds 4MB limit' });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the highest order value to place new image at the end
    const highestOrderImage = await db.photoBookImage.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' },
    });

    const nextOrder = highestOrderImage ? highestOrderImage.order + 1 : 0;

    try {
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder: `librelinks/photobook/${user.id}`,
        public_id: `photobook_${user.id}_${Date.now()}`,
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
          order: nextOrder,
        },
      });

      return res.status(200).json(photoBookImage);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({
        message: 'Failed to upload image to Cloudinary',
        error: cloudinaryError.message,
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
