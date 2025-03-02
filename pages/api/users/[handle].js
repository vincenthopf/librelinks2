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
        backgroundImage: true,
        headToPicturePadding: true,
        pictureToNamePadding: true,
        betweenCardsPadding: true,
        linkCardHeight: true,
        nameToBioPadding: true,
        photoBookLayout: true,
        photoBookOrder: true,
        links: true,
      },
    });

    res.status(200).json({ ...existingUser });
    return;
  } catch (error) {
    res.status(400).end();
    return;
  }
}
