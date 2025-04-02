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
      return res.status(403).json({ error: 'Only admins can create templates' });
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

    // Get current user's links, including the alwaysExpandEmbed status
    const userLinks = await db.link.findMany({
      where: {
        userId: currentUser.id,
        archived: false,
      },
      select: {
        id: true,
        alwaysExpandEmbed: true, // Select the field
      },
    });

    // Prepare template data
    const templateData = prepareTemplateData(currentUser, name, description);

    // Prepare the linkExpansionStates JSON array
    const linkExpansionStates = userLinks.map(link => ({
      linkId: link.id,
      expanded: link.alwaysExpandEmbed || false,
    }));

    // Create template in a transaction
    const template = await withTransaction(async prisma => {
      return await prisma.template.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          isPublic: templateData.isPublic,
          linksLocation: templateData.linksLocation,
          themePalette: templateData.themePalette,
          buttonStyle: templateData.buttonStyle,
          profileNameFontFamily: templateData.profileNameFontFamily,
          bioFontFamily: templateData.bioFontFamily,
          linkTitleFontFamily: templateData.linkTitleFontFamily,
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
          nameToBioPadding: templateData.nameToBioPadding,
          bioToFirstCardPadding: templateData.bioToFirstCardPadding,
          betweenCardsPadding: templateData.betweenCardsPadding,
          linkCardHeight: templateData.linkCardHeight,
          frameCornerStyle: templateData.frameCornerStyle,
          frameBorderRadius: templateData.frameBorderRadius,
          frameAllCorners: templateData.frameAllCorners,
          frameTopLeftRadius: templateData.frameTopLeftRadius,
          frameTopRightRadius: templateData.frameTopRightRadius,
          frameBottomLeftRadius: templateData.frameBottomLeftRadius,
          frameBottomRightRadius: templateData.frameBottomRightRadius,
          frameWidth: templateData.frameWidth,
          frameHeight: templateData.frameHeight,
          backgroundImage: templateData.backgroundImage,
          photoBookLayout: templateData.photoBookLayout,
          photoBookOrder: templateData.photoBookOrder,
          linkExpansionStates: linkExpansionStates,
          createdBy: {
            connect: {
              id: currentUser.id,
            },
          },
          links: {
            connect: userLinks.map(link => ({ id: link.id })),
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
