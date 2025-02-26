import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import { prepareTemplateData } from '@/lib/template-utils';
import { prepareLinkData } from '@/lib/link-utils';
import { withTransaction } from '@/lib/db-utils';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    // Check if user is admin
    if (!currentUser.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Only admins can create templates' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    // Debug logging for currentUser
    console.log('Current User:', {
      id: currentUser.id,
      isAdmin: currentUser.isAdmin,
      settings: {
        linksLocation: currentUser.linksLocation,
        themePalette: currentUser.themePalette,
        buttonStyle: currentUser.buttonStyle,
        profileNameFontSize: currentUser.profileNameFontSize,
        bioFontSize: currentUser.bioFontSize,
        linkTitleFontSize: currentUser.linkTitleFontSize,
        profileImageSize: currentUser.profileImageSize,
        socialIconSize: currentUser.socialIconSize,
        faviconSize: currentUser.faviconSize,
        frameTemplate: currentUser.frameTemplate,
        frameColor: currentUser.frameColor,
        frameThickness: currentUser.frameThickness,
        frameRotation: currentUser.frameRotation,
        pictureRotation: currentUser.pictureRotation,
        syncRotation: currentUser.syncRotation,
        frameAnimation: currentUser.frameAnimation,
        headToPicturePadding: currentUser.headToPicturePadding,
        pictureToNamePadding: currentUser.pictureToNamePadding,
        betweenCardsPadding: currentUser.betweenCardsPadding,
        linkCardHeight: currentUser.linkCardHeight,
      },
    });

    // Get current user's links
    const userLinks = await db.link.findMany({
      where: {
        userId: currentUser.id,
        archived: false,
      },
    });

    // Prepare template data
    const templateData = prepareTemplateData(currentUser, name, description);

    // Create template in a transaction
    const template = await withTransaction(async (prisma) => {
      return await prisma.template.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          isPublic: templateData.isPublic,
          linksLocation: templateData.linksLocation,
          themePalette: templateData.themePalette,
          buttonStyle: templateData.buttonStyle,
          profileNameFontSize: templateData.profileNameFontSize,
          bioFontSize: templateData.bioFontSize,
          linkTitleFontSize: templateData.linkTitleFontSize,
          profileImageSize: templateData.profileImageSize,
          socialIconSize: templateData.socialIconSize,
          faviconSize: templateData.faviconSize,
          frameTemplate: templateData.frameTemplate,
          frameColor: templateData.frameColor,
          frameThickness: templateData.frameThickness,
          frameRotation: templateData.frameRotation,
          pictureRotation: templateData.pictureRotation,
          syncRotation: templateData.syncRotation,
          frameAnimation: templateData.frameAnimation,
          headToPicturePadding: templateData.headToPicturePadding,
          pictureToNamePadding: templateData.pictureToNamePadding,
          betweenCardsPadding: templateData.betweenCardsPadding,
          linkCardHeight: templateData.linkCardHeight,
          createdBy: {
            connect: {
              id: currentUser.id,
            },
          },
          links: {
            connect: userLinks.map((link) => ({ id: link.id })),
          },
        },
        include: {
          links: true,
          createdBy: true,
        },
      });
    });

    console.log('Template created successfully:', template.id);
    return res.status(201).json(template);
  } catch (error) {
    console.error('Save Template Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      meta: error.meta,
    });

    return res.status(500).json({
      error: 'Failed to save template',
      details: error.message,
    });
  }
}
