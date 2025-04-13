import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const {
      // Font sizes
      profileNameFontSize,
      bioFontSize,
      linkTitleFontSize,
      // Font families
      profileNameFontFamily,
      bioFontFamily,
      linkTitleFontFamily,
      // Image sizes
      socialIconSize,
      faviconSize,
      // Background image
      backgroundImage,
      // Button styles
      buttonStyle,
      textCardButtonStyle,
      // Spacing fields
      bioToSocialPadding,
      pageHorizontalMargin,
      // Other customization fields
      ...otherFields
    } = req.body;

    // Validate font sizes
    if (profileNameFontSize && (profileNameFontSize < 12 || profileNameFontSize > 64)) {
      res.status(400).json({
        message: 'Profile name font size must be between 12px and 64px',
      });
      return;
    }
    if (bioFontSize && (bioFontSize < 12 || bioFontSize > 64)) {
      res.status(400).json({ message: 'Bio font size must be between 12px and 64px' });
      return;
    }
    if (linkTitleFontSize && (linkTitleFontSize < 12 || linkTitleFontSize > 64)) {
      res.status(400).json({
        message: 'Link title font size must be between 12px and 64px',
      });
      return;
    }

    // Validate image sizes
    if (socialIconSize && (socialIconSize < 16 || socialIconSize > 64)) {
      res.status(400).json({ message: 'Social icon size must be between 16px and 64px' });
      return;
    }
    if (faviconSize && (faviconSize < 16 || faviconSize > 64)) {
      res.status(400).json({ message: 'Favicon size must be between 16px and 64px' });
      return;
    }

    // Validate pageHorizontalMargin
    if (
      pageHorizontalMargin !== undefined &&
      (typeof pageHorizontalMargin !== 'number' ||
        pageHorizontalMargin < 0 ||
        pageHorizontalMargin > 20)
    ) {
      res.status(400).json({
        message: 'Page Horizontal Margin must be a number between 0 and 20',
      });
      return;
    }

    // Validate background image if provided
    if (backgroundImage !== undefined && backgroundImage !== null && backgroundImage !== '') {
      // If it's not null or empty, verify it exists in the database OR in the user's custom list
      if (backgroundImage !== 'none') {
        // 1. Check the public/admin BackgroundImage table
        const publicBgImage = await db.backgroundImage.findFirst({
          where: {
            imageUrl: backgroundImage,
            isPublic: true, // Only check public ones here
          },
          select: { id: true }, // Select minimal data
        });

        // 2. If not found publicly, check the user's customBackgroundImages array
        let userHasCustomImage = false;
        if (!publicBgImage) {
          const userWithCustomImages = await db.user.findUnique({
            where: { email: session.user.email },
            select: { customBackgroundImages: true },
          });
          userHasCustomImage =
            userWithCustomImages?.customBackgroundImages?.includes(backgroundImage) ?? false;
        }

        // 3. If not found in public images AND not in the user's custom list, reject
        if (!publicBgImage && !userHasCustomImage) {
          console.warn(
            `Invalid background image selection attempt by ${session.user.email}: ${backgroundImage}`
          );
          res.status(400).json({ message: 'Invalid background image selection' });
          return;
        }
      }
    }

    console.log(
      `[Customize API] Attempting to update user ${session.user.email} with background:`,
      backgroundImage
    );

    try {
      const user = await db.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          // Font sizes
          profileNameFontSize,
          bioFontSize,
          linkTitleFontSize,
          // Font families
          profileNameFontFamily,
          bioFontFamily,
          linkTitleFontFamily,
          // Image sizes
          socialIconSize,
          faviconSize,
          // Background image - set to null if 'none' is selected
          backgroundImage: backgroundImage === 'none' ? null : backgroundImage,
          // Button styles
          buttonStyle,
          textCardButtonStyle,
          // Spacing fields
          bioToSocialPadding,
          pageHorizontalMargin,
          // Other customization fields
          ...otherFields,
        },
        // Select the updated field to confirm
        select: { id: true, email: true, backgroundImage: true },
      });

      console.log(
        `[Customize API] Successfully updated user ${user.email}. New background:`,
        user.backgroundImage
      );
      res.status(200).json(user);
      return;
    } catch (updateError) {
      console.error(
        `[Customize API] Error during db.user.update for ${session.user.email}:`,
        updateError
      );
      // Return a specific error for update failure
      res.status(500).json({ message: 'Database update failed', error: updateError.message });
      return;
    }
  } catch (error) {
    // General error handler for session issues, validation errors handled above
    console.error('[Customize API] General error:', error);
    // Ensure validation errors return 400, other errors return 500
    if (!res.headersSent) {
      // Avoid setting headers if already sent (e.g., by validation)
      res.status(500).json({ message: 'Internal server error' });
    }
    return; // Ensure function exits
  }
}
