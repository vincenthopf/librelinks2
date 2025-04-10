import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);
    const { id } = req.query;

    if (!currentUser.isAdmin) {
      return res.status(403).json({ message: 'Only admins can manage background images' });
    }

    // --- GET (Optional, for fetching single image details if needed) ---
    if (req.method === 'GET') {
      const backgroundImage = await db.backgroundImage.findUnique({
        where: { id },
      });
      if (!backgroundImage) {
        return res.status(404).json({ message: 'Background image not found' });
      }
      return res.status(200).json(backgroundImage);
    }

    // --- PUT (Update Name, Description, Public Status) ---
    if (req.method === 'PUT') {
      const { name, description, isPublic } = req.body;

      // Basic validation: require name if provided
      if (name !== undefined && !name.trim()) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }

      const dataToUpdate = {};
      if (name !== undefined) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (isPublic !== undefined) dataToUpdate.isPublic = isPublic;

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
      }

      const updatedImage = await db.backgroundImage.update({
        where: { id },
        data: dataToUpdate,
      });

      return res.status(200).json(updatedImage);
    }

    // --- DELETE ---
    if (req.method === 'DELETE') {
      const imageToDelete = await db.backgroundImage.findUnique({
        where: { id },
        select: { imageUrl: true }, // Only select the URL needed for Cloudinary deletion
      });

      if (!imageToDelete) {
        return res.status(404).json({ message: 'Background image not found' });
      }

      // Attempt to delete from Cloudinary
      try {
        // Extract public_id. This assumes a structure like: .../folder/public_id.ext
        const urlParts = imageToDelete.imageUrl.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/'); // e.g., 'folder/public_id.jpg'
        const publicId = publicIdWithExtension.substring(
          0,
          publicIdWithExtension.lastIndexOf('.') || publicIdWithExtension.length
        );

        if (publicId) {
          console.log(`Attempting to delete from Cloudinary: ${publicId}`);
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          console.log(`Successfully deleted from Cloudinary: ${publicId}`);
        } else {
          console.warn(
            `Could not reliably extract public_id for Cloudinary deletion for image ID: ${id}. URL: ${imageToDelete.imageUrl}`
          );
        }
      } catch (cloudinaryError) {
        console.error(
          `Cloudinary deletion failed for image ID: ${id}. Error: ${cloudinaryError.message}. Proceeding with DB deletion.`
        );
        // Log the error but continue to delete from DB
      }

      // Delete from database
      await db.backgroundImage.delete({
        where: { id },
      });

      return res.status(204).end(); // No content on successful delete
    }

    // --- Method Not Allowed ---
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Background Image API [/api/background-images/[id]] Error:', error);
    return res.status(500).json({
      message: 'Internal server error managing background image',
      error: error.message,
    });
  }
}
