import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import { isValidFrameType, isValidHexColor } from '@/utils/frame-helpers';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).end();
  }

  try {
    const { currentUser } = await serverAuth(req, res);

    const {
      profileImageSize,
      socialIconSize,
      faviconSize,
      headToPicturePadding,
      pictureToNamePadding,
      betweenCardsPadding,
      linkCardHeight,
      profileNameFontSize,
      bioFontSize,
      linkTitleFontSize,
      buttonStyle,
      themePalette,
      linksLocation,
      profileFrameType,
      profileFrameColor,
    } = req.body;

    // Validate frame type and color if provided
    if (profileFrameType && !isValidFrameType(profileFrameType)) {
      return res.status(400).json({ error: 'Invalid frame type' });
    }

    if (profileFrameColor && !isValidHexColor(profileFrameColor)) {
      return res
        .status(400)
        .json({
          error: 'Invalid color format. Please use hex color (e.g., #FF0000)',
        });
    }

    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        ...(profileImageSize !== undefined && { profileImageSize }),
        ...(socialIconSize !== undefined && { socialIconSize }),
        ...(faviconSize !== undefined && { faviconSize }),
        ...(headToPicturePadding !== undefined && { headToPicturePadding }),
        ...(pictureToNamePadding !== undefined && { pictureToNamePadding }),
        ...(betweenCardsPadding !== undefined && { betweenCardsPadding }),
        ...(linkCardHeight !== undefined && { linkCardHeight }),
        ...(profileNameFontSize !== undefined && { profileNameFontSize }),
        ...(bioFontSize !== undefined && { bioFontSize }),
        ...(linkTitleFontSize !== undefined && { linkTitleFontSize }),
        ...(buttonStyle !== undefined && { buttonStyle }),
        ...(themePalette !== undefined && { themePalette }),
        ...(linksLocation !== undefined && { linksLocation }),
        ...(profileFrameType !== undefined && { profileFrameType }),
        ...(profileFrameColor !== undefined && { profileFrameColor }),
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
