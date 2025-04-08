import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

// Define section keys matching the frontend APPLY_SECTIONS
const SECTION_KEYS = {
  PROFILE_INFO: 'PROFILE_INFO',
  STYLING: 'STYLING',
  PROFILE_IMAGE: 'PROFILE_IMAGE',
  BACKGROUND_IMAGE: 'BACKGROUND_IMAGE',
  LINKS: 'LINKS',
  PHOTO_BOOK: 'PHOTO_BOOK',
};

export default async function handler(req, res) {
  try {
    console.log('Template Apply API: Started');
    const { currentUser } = await serverAuth(req, res);
    console.log('Template Apply API: Authenticated user', { userId: currentUser.id });

    if (req.method !== 'POST') {
      console.log('Template Apply API: Method not allowed', { method: req.method });
      return res.status(405).end();
    }

    const { templateId, sectionsToApply } = req.body;
    if (!templateId || !Array.isArray(sectionsToApply)) {
      console.error('Template Apply API: Missing templateId or sectionsToApply', req.body);
      return res.status(400).json({ error: 'Bad request: Missing templateId or sectionsToApply' });
    }
    console.log('Template Apply API: Request body', { templateId, sectionsToApply });

    // Get the template
    const template = await db.template.findUnique({
      where: { id: templateId },
      // No include needed here, we fetch links separately if needed
    });

    if (!template) {
      console.log('Template Apply API: Template not found', { templateId });
      return res.status(404).json({ error: 'Template not found' });
    }

    console.log('Template Apply API: Found template', {
      templateId: template.id,
      name: template.name,
      fields: Object.keys(template),
    });

    // Check if user has access to this template
    if (!template.isPublic && !currentUser.isAdmin) {
      console.log('Template Apply API: Access denied', {
        isPublic: template.isPublic,
        isAdmin: currentUser.isAdmin,
      });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update template usage count (consider doing this after successful application?)
    await db.template.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
    console.log('Template Apply API: Updated usage count');

    // Prepare the update data for core user fields
    const updateData = {};

    // Section: PROFILE_INFO
    if (sectionsToApply.includes(SECTION_KEYS.PROFILE_INFO)) {
      console.log('Template Apply API: Applying PROFILE_INFO');
      if (template.profileName !== undefined) updateData.name = template.profileName;
      if (template.profileHandle !== undefined) updateData.handle = template.profileHandle;
      if (template.profileBio !== undefined) updateData.bio = template.profileBio;
    }

    // Section: PROFILE_IMAGE
    if (sectionsToApply.includes(SECTION_KEYS.PROFILE_IMAGE)) {
      console.log('Template Apply API: Applying PROFILE_IMAGE');
      if (template.profileImageUrl !== undefined) updateData.image = template.profileImageUrl;
    }

    // Section: BACKGROUND_IMAGE
    if (sectionsToApply.includes(SECTION_KEYS.BACKGROUND_IMAGE)) {
      console.log('Template Apply API: Applying BACKGROUND_IMAGE');
      if (template.backgroundImage !== undefined)
        updateData.backgroundImage = template.backgroundImage;
    }

    // Section: STYLING
    if (sectionsToApply.includes(SECTION_KEYS.STYLING)) {
      console.log('Template Apply API: Applying STYLING');
      // --- Add all styling fields here ---
      if (template.linksLocation !== undefined) updateData.linksLocation = template.linksLocation;
      if (template.themePalette !== undefined) updateData.themePalette = template.themePalette;
      if (template.buttonStyle !== undefined) updateData.buttonStyle = template.buttonStyle;
      if (template.textCardButtonStyle !== undefined)
        updateData.textCardButtonStyle = template.textCardButtonStyle;
      if (template.profileNameFontFamily !== undefined)
        updateData.profileNameFontFamily = template.profileNameFontFamily;
      if (template.bioFontFamily !== undefined) updateData.bioFontFamily = template.bioFontFamily;
      if (template.linkTitleFontFamily !== undefined)
        updateData.linkTitleFontFamily = template.linkTitleFontFamily;
      if (template.profileNameFontSize !== undefined)
        updateData.profileNameFontSize = template.profileNameFontSize;
      if (template.bioFontSize !== undefined) updateData.bioFontSize = template.bioFontSize;
      if (template.linkTitleFontSize !== undefined)
        updateData.linkTitleFontSize = template.linkTitleFontSize;
      if (template.profileImageSize !== undefined)
        updateData.profileImageSize = template.profileImageSize;
      if (template.socialIconSize !== undefined)
        updateData.socialIconSize = template.socialIconSize;
      if (template.faviconSize !== undefined) updateData.faviconSize = template.faviconSize;
      // --- Padding fields ---
      if (template.headToPicturePadding !== undefined)
        updateData.headToPicturePadding = template.headToPicturePadding;
      if (template.pictureToNamePadding !== undefined)
        updateData.pictureToNamePadding = template.pictureToNamePadding;
      if (template.nameToBioPadding !== undefined)
        updateData.nameToBioPadding = template.nameToBioPadding;
      if (template.bioToSocialPadding !== undefined)
        updateData.bioToSocialPadding = template.bioToSocialPadding;
      if (template.betweenCardsPadding !== undefined)
        updateData.betweenCardsPadding = template.betweenCardsPadding;
      if (template.linkCardHeight !== undefined)
        updateData.linkCardHeight = template.linkCardHeight;
      if (template.pageHorizontalMargin !== undefined)
        updateData.pageHorizontalMargin = template.pageHorizontalMargin;
      // --- End Padding fields ---
      if (template.frameTemplate !== undefined) updateData.frameTemplate = template.frameTemplate;
      if (template.frameColor !== undefined) updateData.frameColor = template.frameColor;
      if (template.frameThickness !== undefined)
        updateData.frameThickness = template.frameThickness;
      if (template.frameRotation !== undefined) updateData.frameRotation = template.frameRotation;
      if (template.pictureRotation !== undefined)
        updateData.pictureRotation = template.pictureRotation;
      if (template.syncRotation !== undefined) updateData.syncRotation = template.syncRotation;
      if (template.frameAnimation !== undefined)
        updateData.frameAnimation = template.frameAnimation;
      if (template.frameCornerStyle !== undefined)
        updateData.frameCornerStyle = template.frameCornerStyle;
      if (template.frameBorderRadius !== undefined)
        updateData.frameBorderRadius = template.frameBorderRadius;
      if (template.frameAllCorners !== undefined)
        updateData.frameAllCorners = template.frameAllCorners;
      if (template.frameTopLeftRadius !== undefined)
        updateData.frameTopLeftRadius = template.frameTopLeftRadius;
      if (template.frameTopRightRadius !== undefined)
        updateData.frameTopRightRadius = template.frameTopRightRadius;
      if (template.frameBottomLeftRadius !== undefined)
        updateData.frameBottomLeftRadius = template.frameBottomLeftRadius;
      if (template.frameBottomRightRadius !== undefined)
        updateData.frameBottomRightRadius = template.frameBottomRightRadius;
      if (template.frameWidth !== undefined) updateData.frameWidth = template.frameWidth;
      if (template.frameHeight !== undefined) updateData.frameHeight = template.frameHeight;
      if (template.photoBookLayout !== undefined)
        updateData.photoBookLayout = template.photoBookLayout;
      if (template.photoBookOrder !== undefined)
        updateData.photoBookOrder = template.photoBookOrder;
      if (template.linkExpansionStates !== undefined)
        updateData.linkExpansionStates = template.linkExpansionStates;

      // Log padding values specifically being applied
      console.log('Template Apply API: Padding values being applied:', {
        headToPicturePadding: updateData.headToPicturePadding,
        pictureToNamePadding: updateData.pictureToNamePadding,
        nameToBioPadding: updateData.nameToBioPadding,
        bioToSocialPadding: updateData.bioToSocialPadding,
        betweenCardsPadding: updateData.betweenCardsPadding,
        linkCardHeight: updateData.linkCardHeight,
        pageHorizontalMargin: updateData.pageHorizontalMargin,
      });
    }

    console.log('Template Apply API: Prepared user update data', {
      updateFields: Object.keys(updateData),
    });

    // Update core user profile data if needed
    if (Object.keys(updateData).length > 0) {
      try {
        console.log('Template Apply API: Updating user profile');
        await db.user.update({
          where: { id: currentUser.id },
          data: updateData,
        });
        console.log('Template Apply API: User profile updated successfully', {
          updatedFieldsCount: Object.keys(updateData).length,
        });
      } catch (updateError) {
        console.error('Template Apply API: User update error', {
          error: updateError.message,
          code: updateError.code,
          meta: updateError.meta,
          stack: updateError.stack,
        });
        // Return specific error if update fails
        return res
          .status(500)
          .json({ error: 'Failed to update user profile', details: updateError.message });
      }
    } else {
      console.log('Template Apply API: No core user fields to update based on selection.');
    }

    // --- Handle sections that involve related data ---
    let newlyCreatedLinks = []; // Keep track of newly created links for expansion state mapping

    // Section: LINKS (Replace existing or create new)
    if (sectionsToApply.includes(SECTION_KEYS.LINKS)) {
      console.log('Template Apply API: Processing LINKS section');
      const templateLinksData =
        template.templateLinksData && Array.isArray(template.templateLinksData)
          ? template.templateLinksData
          : [];

      if (templateLinksData.length > 0) {
        console.log('Template Apply API: Found link data in template', {
          count: templateLinksData.length,
        });

        // Delete existing links for the user before adding new ones
        try {
          console.log('Template Apply API: Deleting existing links for user', {
            userId: currentUser.id,
          });
          await db.link.deleteMany({ where: { userId: currentUser.id } });
          console.log('Template Apply API: Successfully deleted existing links');
        } catch (deleteError) {
          console.error('Template Apply API: Error deleting existing links', {
            error: deleteError.message,
            stack: deleteError.stack,
          });
          // Log error, but proceed to try creating new ones
        }

        // Prepare data for new links
        const newLinksToCreate = templateLinksData.map(linkData => ({
          ...linkData, // Spread the snapshot data (title, url, order, etc.)
          userId: currentUser.id, // Assign to the current user
          // Defaults for fields not in snapshot
          archived: false,
          clicks: 0,
          // Do NOT set alwaysExpandEmbed here initially, handle after creation
        }));

        // Create the new links
        try {
          console.log('Template Apply API: Creating new links from template data');
          // Create links one by one to get their IDs back for expansion state mapping
          for (const linkToCreate of newLinksToCreate) {
            const createdLink = await db.link.create({ data: linkToCreate });
            newlyCreatedLinks.push(createdLink);
          }
          console.log('Template Apply API: Created new links successfully', {
            count: newlyCreatedLinks.length,
          });
        } catch (linkCreateError) {
          console.error('Template Apply API: Error creating new links', {
            error: linkCreateError.message,
            stack: linkCreateError.stack,
          });
          // Log error but don't fail the whole request for this section
        }
      } else {
        console.log('Template Apply API: No link data found in the template to apply.');
        // Optionally delete existing links if template has none and LINKS section is selected?
        // await db.link.deleteMany({ where: { userId: currentUser.id } });
      }
    }

    // Section: PHOTO_BOOK (Replace existing)
    if (sectionsToApply.includes(SECTION_KEYS.PHOTO_BOOK)) {
      console.log('Template Apply API: Processing PHOTO_BOOK section');
      if (template.photoBookImageData && Array.isArray(template.photoBookImageData)) {
        console.log('Template Apply API: Applying photo book images', {
          imagesCount: template.photoBookImageData.length,
        });
        try {
          // Delete existing photos first
          await db.photoBookImage.deleteMany({ where: { userId: currentUser.id } });
          console.log('Template Apply API: Deleted existing photo book images');

          // Create new photos from template data
          const photoBookImages = template.photoBookImageData.map(image => ({
            ...image,
            userId: currentUser.id,
          }));

          await db.photoBookImage.createMany({ data: photoBookImages });
          console.log('Template Apply API: Created new photo book images', {
            count: photoBookImages.length,
          });
        } catch (photoError) {
          console.error('Template Apply API: Photo book update error', {
            error: photoError.message,
            stack: photoError.stack,
          });
          // Log error but don't fail the whole request
        }
      } else {
        console.log('Template Apply API: No photo book image data in template to apply');
      }
    }

    // Apply link expansion states (Only if LINKS section was applied and STYLING section was also selected)
    if (
      sectionsToApply.includes(SECTION_KEYS.LINKS) &&
      sectionsToApply.includes(SECTION_KEYS.STYLING) &&
      newlyCreatedLinks.length > 0
    ) {
      const expansionStates =
        template.linkExpansionStates && Array.isArray(template.linkExpansionStates)
          ? template.linkExpansionStates
          : [];
      console.log('Template Apply API: Mapping and applying link expansion states', {
        statesCount: expansionStates.length,
        newLinksCount: newlyCreatedLinks.length,
      });

      if (expansionStates.length > 0) {
        try {
          // Map originalLinkIds from template state to newly created link IDs
          // This assumes the order of links in templateLinksData matches the order of newlyCreatedLinks
          const updatePromises = [];
          for (let i = 0; i < expansionStates.length; i++) {
            const state = expansionStates[i];
            // Find the corresponding new link (this relies on order preservation)
            if (i < newlyCreatedLinks.length) {
              const newLinkId = newlyCreatedLinks[i].id;
              console.log(
                `Mapping expansion state for original index ${i} to new link ID: ${newLinkId}`
              );
              updatePromises.push(
                db.link.update({
                  where: { id: newLinkId }, // Update the NEW link
                  data: { alwaysExpandEmbed: state.expanded || false },
                })
              );
            } else {
              console.warn(`Expansion state at index ${i} could not be mapped to a new link.`);
            }
          }

          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
            console.log('Template Apply API: Successfully applied mapped link expansion states', {
              updatedCount: updatePromises.length,
            });
          } else {
            console.log('Template Apply API: No link expansion states could be mapped or applied.');
          }
        } catch (linkExpansionError) {
          console.error('Template Apply API: Error applying mapped link expansion states', {
            error: linkExpansionError.message,
            stack: linkExpansionError.stack,
          });
        }
      } else {
        console.log('Template Apply API: No link expansion states found in template.');
      }
    } else if (sectionsToApply.includes(SECTION_KEYS.STYLING)) {
      console.log(
        'Template Apply API: Not applying expansion states (LINKS section not applied or no new links created)'
      );
    }

    console.log('Template Apply API: Template sections applied successfully');
    return res.status(200).json({ message: 'Template sections applied successfully' });
  } catch (error) {
    console.error('Template Apply API Error (Outer Catch):', {
      message: error.message,
      name: error.name,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    return res.status(500).json({
      error: 'Failed to apply template',
      details: error.message,
    });
  }
}
