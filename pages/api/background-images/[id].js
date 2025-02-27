import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

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

  // Only admins can delete background images
  if (!user.isAdmin) {
    return res
      .status(403)
      .json({ message: 'Only admins can delete background images' });
  }

  const { id } = req.query;

  // DELETE - Delete a background image
  if (req.method === 'DELETE') {
    try {
      // Find the background image
      const backgroundImage = await db.backgroundImage.findUnique({
        where: { id },
      });

      if (!backgroundImage) {
        return res.status(404).json({ message: 'Background image not found' });
      }

      // Extract Cloudinary public ID from the URL
      const urlParts = backgroundImage.imageUrl.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];
      const folder = urlParts[urlParts.length - 2];
      const fullPublicId = `${folder}/${publicId}`;

      // Delete image from Cloudinary
      try {
        await cloudinary.uploader.destroy(fullPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }

      // Delete background image from database
      await db.backgroundImage.delete({
        where: { id },
      });

      // Update any users who were using this background image
      await db.user.updateMany({
        where: { backgroundImage: backgroundImage.imageUrl },
        data: { backgroundImage: null },
      });

      return res
        .status(200)
        .json({ message: 'Background image deleted successfully' });
    } catch (error) {
      console.error('Error deleting background image:', error);
      return res.status(500).json({
        message: 'Failed to delete background image',
        error: error.message,
      });
    }
  }

  // If not DELETE
  return res.status(405).json({ message: 'Method not allowed' });
}
