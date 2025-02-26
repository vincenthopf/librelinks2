import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (!currentUser.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Only admins can upload template thumbnails' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Check if template exists and user has access
    const template = await db.template.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: 'librelinks/template_thumbnails',
      public_id: `template_${template.id}_${Date.now()}`,
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
    });

    // Update template with new thumbnail URL
    await db.template.update({
      where: { id },
      data: { thumbnailUrl: uploadResult.secure_url },
    });

    return res.status(200).json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error('Template thumbnail upload error:', error);
    return res.status(500).json({
      message: 'Failed to upload thumbnail',
      error: error.message,
    });
  }
}
