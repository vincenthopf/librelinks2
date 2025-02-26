import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const { templateId } = req.body;

    // Get the template
    const template = await db.template.findUnique({
      where: { id: templateId },
      include: {
        links: true,
      },
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
        headToPicturePadding: template.headToPicturePadding || 40,
        pictureToNamePadding: template.pictureToNamePadding || 16,
        betweenCardsPadding: template.betweenCardsPadding || 16,
        linkCardHeight: template.linkCardHeight || 16,
      },
    });

    // Get user's existing links
    const existingLinks = await db.link.findMany({
      where: {
        userId: currentUser.id,
        archived: false,
      },
    });

    // Only create new links if the user has no existing links
    if (existingLinks.length === 0 && template.links.length > 0) {
      // Create new links from template
      const templateLinks = template.links.map((link) => ({
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
      }));

      // Create links one by one to avoid empty array issues
      for (const linkData of templateLinks) {
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
