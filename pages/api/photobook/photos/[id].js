import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req, res) {
  const { id } = req.query;

  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: 'Image ID is required' });
  }

  try {
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

    // Find the image and verify ownership
    const image = await db.photoBookImage.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Handle PATCH request (update image metadata)
    if (req.method === 'PATCH') {
      const { title, description, order } = req.body;

      const updatedImage = await db.photoBookImage.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(order !== undefined && { order }),
        },
      });

      return res.status(200).json(updatedImage);
    }

    // Handle DELETE request
    if (req.method === 'DELETE') {
      // Delete from Cloudinary first
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }

      // Delete from database
      await db.photoBookImage.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Image deleted successfully' });
    }

    // If not PATCH or DELETE
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
