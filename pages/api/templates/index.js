import { db } from '@/lib/db';
import { withAdminProtection } from '@/lib/auth';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method === 'GET') {
      // If admin, return all templates. If user, return only public templates
      const templates = await db.template.findMany({
        where: currentUser.isAdmin ? {} : { isPublic: true },
        include: {
          links: true,
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(templates);
    }

    if (req.method === 'POST') {
      // Only admins can create templates
      if (!currentUser.isAdmin) {
        return res
          .status(403)
          .json({ error: 'Only admins can create templates' });
      }

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

      const template = await db.template.create({
        data: {
          name,
          description,
          isPublic,
          userId: currentUser.id,
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
      });

      return res.status(201).json(template);
    }

    return res.status(405).end();
  } catch (error) {
    console.error('Template API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
