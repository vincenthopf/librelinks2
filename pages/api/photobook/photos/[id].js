import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req, res) {
  const { id } = req.query;

  // Check if ID is provided
  if (!id) {
    res.status(400).json({ message: 'Image ID is required' });
    return;
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Find the image and verify ownership
    const image = await db.photoBookImage.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
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

      res.status(200).json(updatedImage);
      return;
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

      res.status(200).json({ message: 'Image deleted successfully' });
      return;
    }

    // If not PATCH or DELETE
    res.status(405).json({ message: 'Method not allowed' });
    return;
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}
