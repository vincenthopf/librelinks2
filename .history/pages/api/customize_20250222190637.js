import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    const {
      buttonStyle,
      themePalette,
      profileNameFontSize,
      bioFontSize,
      linkTitleFontSize,
      profileImageSize,
      socialIconSize,
      faviconSize,
      headToPicturePadding,
      pictureToNamePadding,
      betweenCardsPadding,
      linkCardHeight,
    } = req.body;

    // Validate profile image size
    if (profileImageSize !== undefined) {
      if (
        typeof profileImageSize !== 'number' ||
        profileImageSize < 20 ||
        profileImageSize > 500
      ) {
        return res
          .status(400)
          .json({ error: 'Profile image size must be between 20px and 500px' });
      }
    }

    const updatedCustomizations = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        buttonStyle: buttonStyle,
        themePalette: themePalette,
        ...(profileNameFontSize !== undefined && { profileNameFontSize }),
        ...(bioFontSize !== undefined && { bioFontSize }),
        ...(linkTitleFontSize !== undefined && { linkTitleFontSize }),
        ...(profileImageSize !== undefined && { profileImageSize }),
        ...(socialIconSize !== undefined && { socialIconSize }),
        ...(faviconSize !== undefined && { faviconSize }),
        ...(headToPicturePadding !== undefined && { headToPicturePadding }),
        ...(pictureToNamePadding !== undefined && { pictureToNamePadding }),
        ...(betweenCardsPadding !== undefined && { betweenCardsPadding }),
        ...(linkCardHeight !== undefined && { linkCardHeight }),
      },
    });

    return res.status(200).json(updatedCustomizations);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
