import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  try {
    const { handle } = req.query;

    if (!handle || typeof handle !== 'string') {
      throw new Error('Invalid Handle');
    }

    const existingUser = await db.user.findUnique({
      where: {
        handle: handle,
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        bio: true,
        image: true,
        isAdmin: true,
        totalViews: true,
        linksLocation: true,
        themePalette: true,
        buttonStyle: true,
        textCardButtonStyle: true,
        profileNameFontSize: true,
        bioFontSize: true,
        linkTitleFontSize: true,
        profileNameFontFamily: true,
        bioFontFamily: true,
        linkTitleFontFamily: true,
        profileImageSize: true,
        socialIconSize: true,
        faviconSize: true,
        frameTemplate: true,
        frameColor: true,
        frameThickness: true,
        frameRotation: true,
        pictureRotation: true,
        syncRotation: true,
        frameAnimation: true,
        frameCornerStyle: true,
        frameBorderRadius: true,
        frameAllCorners: true,
        frameTopLeftRadius: true,
        frameTopRightRadius: true,
        frameBottomLeftRadius: true,
        frameBottomRightRadius: true,
        frameWidth: true,
        frameHeight: true,
        backgroundImage: true,
        headToPicturePadding: true,
        pictureToNamePadding: true,
        betweenCardsPadding: true,
        linkCardHeight: true,
        nameToBioPadding: true,
        bioToSocialPadding: true,
        pageHorizontalMargin: true,
        photoBookLayout: true,
        photoBookOrder: true,
        linkExpansionStates: true,
        contentAnimation: true,
        stackView: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userLinks = await db.link.findMany({
      where: {
        userId: existingUser.id,
      },
      select: {
        id: true,
        alwaysExpandEmbed: true,
      },
    });

    const linkExpansionMap = {};
    userLinks.forEach(link => {
      linkExpansionMap[link.id] = link.alwaysExpandEmbed || false;
    });

    const userData = {
      ...existingUser,
      linkExpansionStates: linkExpansionMap,
    };

    res.status(200).json(userData);
    return;
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(400).json({ error: error.message || 'Bad Request' });
    return;
  }
}
