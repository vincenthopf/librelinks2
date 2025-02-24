import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';
import cloudinary, { validateFile, getUploadParams } from '@/lib/cloudinary';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb'
        }
    }
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

        const { file } = req.body;
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

        try {
            const uploadResult = await cloudinary.uploader.upload(file, {
                folder: `librelinks/user_images/${user.id}`,
                public_id: `user_${user.id}_${Date.now()}`,
                transformation: [
                    { width: 800, height: 800, crop: 'limit', quality: 'auto' },
                    { fetch_format: 'auto' }
                ],
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                resource_type: 'image'
            });

            await db.user.update({
                where: { id: user.id },
                data: { image: uploadResult.secure_url }
            });

            return res.status(200).json({
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(500).json({
                message: 'Failed to upload image to Cloudinary',
                error: cloudinaryError.message
            });
        }
    } catch (error) {
        console.error('Upload handler error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}