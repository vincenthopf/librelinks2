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

  // GET - Fetch all background images
  if (req.method === 'GET') {
    try {
      // If user is admin, get all images, otherwise only public ones
      const backgroundImages = await db.backgroundImage.findMany({
        where: user.isAdmin ? {} : { isPublic: true },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(200).json(backgroundImages);
    } catch (error) {
      console.error('Error fetching background images:', error);
      return res
        .status(500)
        .json({ message: 'Failed to fetch background images' });
    }
  }

  // POST - Create a new background image (admin only)
  if (req.method === 'POST') {
    // Check if user is admin
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Only admins can create background images' });
    }

    try {
      const { name, description, isPublic, imageData } = req.body;

      if (!name || !imageData) {
        return res.status(400).json({ message: 'Name and image are required' });
      }

      // Validate file size on server side
      const base64Size = Buffer.from(imageData.split(',')[1], 'base64').length;
      if (base64Size > 4 * 1024 * 1024) {
        return res.status(400).json({ message: 'File size exceeds 4MB limit' });
      }

      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(imageData, {
        folder: `librelinks/background_images`,
        public_id: `background_${Date.now()}`,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit', quality: 'auto' },
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

      return res.status(201).json(backgroundImage);
    } catch (error) {
      console.error('Error creating background image:', error);
      return res.status(500).json({
        message: 'Failed to create background image',
        error: error.message,
      });
    }
  }

  // If not GET or POST
  return res.status(405).json({ message: 'Method not allowed' });
}
