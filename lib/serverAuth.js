import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { db } from './db';

const serverAuth = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    throw new Error('Not signed in');
  }

  const currentUser = await db.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      name: true,
      handle: true,
      bio: true,
      image: true,
      isAdmin: true,
      linksLocation: true,
      themePalette: true,
      buttonStyle: true,
      profileNameFontSize: true,
      bioFontSize: true,
      linkTitleFontSize: true,
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
      headToPicturePadding: true,
      pictureToNamePadding: true,
      betweenCardsPadding: true,
      linkCardHeight: true,
      photoBookLayout: true,
      photoBookOrder: true,
      accounts: true,
    },
  });

  if (!currentUser) {
    throw new Error('Not signed in');
  }

  return { currentUser };
};

export default serverAuth;
