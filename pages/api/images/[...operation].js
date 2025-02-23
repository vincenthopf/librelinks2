import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req, res) {
  const { operation } = req.query;

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Get current user
  const currentUser = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!currentUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  switch (operation[0]) {
    case 'list':
      return handleList(req, res, currentUser);
    case 'delete':
      return handleDelete(req, res, currentUser);
    case 'status':
      return handleStatus(req, res, currentUser);
    default:
      return res.status(400).json({ message: 'Invalid operation' });
  }
}

// List user images with optional filtering
async function handleList(req, res, currentUser) {
  try {
    const { isActive } = req.query;
    const where = {
      userId: currentUser.id,
      ...(isActive !== undefined && { isActive: isActive === 'true' })
    };

    const images = await db.userImage.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });

    return res.status(200).json(images);
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ message: 'Failed to fetch images' });
  }
}

// Delete image (hard delete from both DB and Cloudinary)
async function handleDelete(req, res, currentUser) {
  try {
    const { imageId } = req.query;
    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    const image = await db.userImage.findFirst({
      where: {
        id: imageId,
        userId: currentUser.id
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from database
    await db.userImage.delete({
      where: { id: imageId }
    });

    // If this was the user's profile image, clear it
    if (currentUser.image === image.url) {
      await db.user.update({
        where: { id: currentUser.id },
        data: { image: null }
      });
    }

    return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Failed to delete image' });
  }
}

// Update image status (active/inactive)
async function handleStatus(req, res, currentUser) {
  try {
    const { imageId } = req.query;
    const { isActive } = req.body;

    if (!imageId) {
      return res.status(400).json({ message: 'Image ID is required' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const image = await db.userImage.findFirst({
      where: {
        id: imageId,
        userId: currentUser.id
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const updatedImage = await db.userImage.update({
      where: { id: imageId },
      data: { isActive }
    });

    return res.status(200).json(updatedImage);
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ message: 'Failed to update image status' });
  }
} 