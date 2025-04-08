import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import { prepareTemplateData, preparePhotoBookImageData } from '@/lib/template-utils';
import { withTransaction } from '@/lib/db-utils';

// Function to prepare link data snapshot
const prepareLinkSnapshotData = links => {
  if (!links || !Array.isArray(links)) {
    return [];
  }
  return links.map(link => ({
    title: link.title,
    url: link.url,
    order: link.order,
    isSocial: link.isSocial,
    type: link.type,
    providerName: link.providerName,
    embedHtml: link.embedHtml,
    thumbnails: link.thumbnails,
    authorName: link.authorName,
    authorUrl: link.authorUrl,
    iframelyMeta: link.iframelyMeta,
    // Note: clicks, createdAt, updatedAt, userId, id are excluded as they are specific to the original link
  }));
};

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

    console.log('Save Template API: Preparing data for user', {
      userId: currentUser.id,
      userName: currentUser.name,
    });

    // Fetch full link data for snapshot
    const userLinks = await db.link.findMany({
      where: {
        userId: currentUser.id,
        archived: false,
      },
      orderBy: {
        order: 'asc',
      },
      // No `select` needed, fetch all fields for snapshot
    });
    console.log('Save Template API: Fetched full links data', { count: userLinks.length });

    // Get current user's photo book images if they exist
    const photoBookImages = await db.photoBookImage.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        order: 'asc',
      },
    });
    console.log('Save Template API: Fetched photo book images', { count: photoBookImages.length });

    // Prepare base template data
    const templateData = prepareTemplateData(currentUser, name, description);
    console.log('Save Template API: Prepared template base data', {
      keys: Object.keys(templateData),
    });

    // Prepare link snapshot data
    const templateLinksData = prepareLinkSnapshotData(userLinks);
    console.log('Save Template API: Prepared link snapshot data');

    // Prepare link expansion states (using original link IDs)
    const linkExpansionStates = userLinks.map(link => ({
      originalLinkId: link.id, // Store original ID to map expansion state later
      expanded: link.alwaysExpandEmbed || false,
    }));
    console.log('Save Template API: Prepared link expansion states');

    // Prepare photo book image data
    const photoBookImageData = preparePhotoBookImageData(photoBookImages);
    console.log('Save Template API: Prepared photo book image data');

    // Create template in a transaction
    console.log('Save Template API: Starting transaction');
    const template = await withTransaction(async prisma => {
      console.log('Save Template API: Inside transaction - Creating template');
      // Log padding values specifically before creation
      console.log('Save Template API: Padding values being saved:', {
        headToPicturePadding: templateData.headToPicturePadding,
        pictureToNamePadding: templateData.pictureToNamePadding,
        nameToBioPadding: templateData.nameToBioPadding,
        bioToSocialPadding: templateData.bioToSocialPadding,
        betweenCardsPadding: templateData.betweenCardsPadding,
        linkCardHeight: templateData.linkCardHeight,
        pageHorizontalMargin: templateData.pageHorizontalMargin,
      });
      const createdTemplate = await prisma.template.create({
        data: {
          // Template Metadata
          name: templateData.name,
          description: templateData.description,
          isPublic: templateData.isPublic,
          createdBy: {
            connect: {
              id: currentUser.id,
            },
          },
          // Mirrored User Profile Data
          profileName: templateData.profileName,
          profileHandle: templateData.profileHandle,
          profileBio: templateData.profileBio,
          profileImageUrl: templateData.profileImageUrl,
          // Styling & Layout Settings
          linksLocation: templateData.linksLocation,
          themePalette: templateData.themePalette,
          buttonStyle: templateData.buttonStyle,
          textCardButtonStyle: templateData.textCardButtonStyle,
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
          // Padding values
          headToPicturePadding: templateData.headToPicturePadding,
          pictureToNamePadding: templateData.pictureToNamePadding,
          nameToBioPadding: templateData.nameToBioPadding,
          bioToSocialPadding: templateData.bioToSocialPadding,
          betweenCardsPadding: templateData.betweenCardsPadding,
          linkCardHeight: templateData.linkCardHeight,
          pageHorizontalMargin: templateData.pageHorizontalMargin,
          // Link Data (Stored as JSON snapshot)
          templateLinksData: templateLinksData.length > 0 ? templateLinksData : null,
          linkExpansionStates: linkExpansionStates.length > 0 ? linkExpansionStates : null,
          // Photo Book Data
          photoBookImageData: photoBookImageData.length > 0 ? photoBookImageData : null,
        },
        include: {
          createdBy: true,
        },
      });
      console.log('Save Template API: Inside transaction - Template created', {
        templateId: createdTemplate.id,
      });
      return createdTemplate;
    });
    console.log('Save Template API: Transaction finished');

    console.log('Template created successfully:', template.id);
    return res.status(201).json(template);
  } catch (error) {
    console.error('Save Template Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      meta: error.meta,
      stack: error.stack, // Include stack trace for better debugging
    });

    return res.status(500).json({
      error: 'Failed to save template',
      details: error.message,
    });
  }
}
