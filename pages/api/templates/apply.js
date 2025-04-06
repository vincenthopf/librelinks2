import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const { templateId } = req.body;

    // Get the template, including the new linkExpansionStates field
    const template = await db.template.findUnique({
      where: { id: templateId },
      include: {
        links: true, // Keep this to potentially copy links if user has none
      },
      // Select linkExpansionStates explicitly if needed (depends on Prisma version/setup)
      // If include doesn't bring it, add: select: { ..., linkExpansionStates: true }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if user has access to this template
    if (!template.isPublic && !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update template usage count
    await db.template.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });

    // Update user's profile with template settings
    await db.user.update({
      where: { id: currentUser.id },
      data: {
        linksLocation: template.linksLocation,
        themePalette: template.themePalette,
        buttonStyle: template.buttonStyle,
        profileNameFontFamily: template.profileNameFontFamily,
        bioFontFamily: template.bioFontFamily,
        linkTitleFontFamily: template.linkTitleFontFamily,
        profileNameFontSize: template.profileNameFontSize,
        bioFontSize: template.bioFontSize,
        linkTitleFontSize: template.linkTitleFontSize,
        profileImageSize: template.profileImageSize,
        socialIconSize: template.socialIconSize,
        faviconSize: template.faviconSize,
        frameTemplate: template.frameTemplate,
        frameColor: template.frameColor,
        frameThickness: template.frameThickness,
        frameRotation: template.frameRotation,
        pictureRotation: template.pictureRotation,
        syncRotation: template.syncRotation,
        frameAnimation: template.frameAnimation,
        headToPicturePadding: template.headToPicturePadding,
        pictureToNamePadding: template.pictureToNamePadding,
        nameToBioPadding: template.nameToBioPadding,
        bioToSocialPadding: template.bioToSocialPadding,
        betweenCardsPadding: template.betweenCardsPadding,
        linkCardHeight: template.linkCardHeight,
        frameCornerStyle: template.frameCornerStyle,
        frameBorderRadius: template.frameBorderRadius,
        frameAllCorners: template.frameAllCorners,
        frameTopLeftRadius: template.frameTopLeftRadius,
        frameTopRightRadius: template.frameTopRightRadius,
        frameBottomLeftRadius: template.frameBottomLeftRadius,
        frameBottomRightRadius: template.frameBottomRightRadius,
        frameWidth: template.frameWidth,
        frameHeight: template.frameHeight,
        backgroundImage: template.backgroundImage,
        photoBookLayout: template.photoBookLayout,
        photoBookOrder: template.photoBookOrder,
        pageHorizontalMargin: template.pageHorizontalMargin,
      },
    });

    // Apply link expansion states
    if (template.linkExpansionStates && Array.isArray(template.linkExpansionStates)) {
      const updates = template.linkExpansionStates.map(state =>
        db.link.updateMany({
          where: {
            id: state.linkId, // Target the specific link
            userId: currentUser.id, // Ensure it belongs to the current user
          },
          data: {
            alwaysExpandEmbed: state.expanded,
          },
        })
      );
      // Execute all updates concurrently
      await Promise.all(updates);
    }

    // Get user's existing links (can be fetched again or reused if already fetched)
    const existingLinks = await db.link.findMany({
      where: {
        userId: currentUser.id,
        archived: false,
      },
      select: { id: true }, // Only need IDs here
    });

    // Only create new links if the user has no existing links
    if (existingLinks.length === 0 && template.links.length > 0) {
      // Create new links from template
      const templateLinksData = template.links.map(link => ({
        // Ensure all necessary fields are copied
        title: link.title,
        url: link.url,
        isSocial: link.isSocial,
        order: link.order,
        userId: currentUser.id,
        type: link.type,
        providerName: link.providerName,
        embedHtml: link.embedHtml,
        thumbnails: link.thumbnails,
        authorName: link.authorName,
        authorUrl: link.authorUrl,
        iframelyMeta: link.iframelyMeta,
        // IMPORTANT: Set alwaysExpandEmbed based on the saved state for this link ID
        alwaysExpandEmbed:
          template.linkExpansionStates?.find(s => s.linkId === link.id)?.expanded || false,
      }));

      // Create links (consider using createMany if applicable)
      for (const linkData of templateLinksData) {
        await db.link.create({
          data: linkData,
        });
      }
    }

    return res.status(200).json({ message: 'Template applied successfully' });
  } catch (error) {
    console.error('Template Apply API Error:', error);
    return res.status(500).json({
      error: 'Failed to apply template',
      details: error.message,
    });
  }
}
