import { db } from '@/lib/db';
import { withAdminProtection } from '@/lib/auth';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);
    const { id } = req.query;

    if (req.method === 'GET') {
      const template = await db.template.findUnique({
        where: { id },
        include: {
          links: true,
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Check if user has access to this template
      if (!template.isPublic && !currentUser.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(template);
    }

    // All other methods require admin access
    if (!currentUser.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can modify templates' });
    }

    if (req.method === 'PUT') {
      const {
        name,
        description,
        isPublic,
        links,
        linksLocation,
        themePalette,
        buttonStyle,
        profileNameFontSize,
        bioFontSize,
        linkTitleFontSize,
        profileImageSize,
        socialIconSize,
        faviconSize,
        frameTemplate,
        frameColor,
        frameThickness,
        frameRotation,
        pictureRotation,
        syncRotation,
        frameAnimation,
      } = req.body;

      // First, delete existing links
      await db.link.deleteMany({
        where: { templateId: id },
      });

      // Update template with new data
      const updatedTemplate = await db.template.update({
        where: { id },
        data: {
          name,
          description,
          isPublic,
          links: {
            create: links,
          },
          linksLocation,
          themePalette,
          buttonStyle,
          profileNameFontSize,
          bioFontSize,
          linkTitleFontSize,
          profileImageSize,
          socialIconSize,
          faviconSize,
          frameTemplate,
          frameColor,
          frameThickness,
          frameRotation,
          pictureRotation,
          syncRotation,
          frameAnimation,
        },
        include: {
          links: true,
        },
      });

      return res.status(200).json(updatedTemplate);
    }

    if (req.method === 'DELETE') {
      // Delete template and associated links
      await db.template.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Template API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
