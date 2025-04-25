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
      emailVerified: true,
      totalViews: true,
      isAdmin: true,
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
      contentAnimation: true,
      frameCornerStyle: true,
      frameBorderRadius: true,
      frameAllCorners: true,
      frameTopLeftRadius: true,
      frameTopRightRadius: true,
      frameBottomLeftRadius: true,
      frameBottomRightRadius: true,
      frameWidth: true,
      frameHeight: true,
      stackView: true,
      viewMode: true,
      bentoItems: true,
      headToPicturePadding: true,
      pictureToNamePadding: true,
      betweenCardsPadding: true,
      linkCardHeight: true,
      nameToBioPadding: true,
      bioToSocialPadding: true,
      pageHorizontalMargin: true,
      photoBookLayout: true,
      photoBookOrder: true,
      customBackgroundImages: true,
      backgroundImage: true,
      sharePrefix: true,
      showBranding: true,
      verified: true,
      linkExpansionStates: true,
      accounts: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripePriceId: true,
      stripeCurrentPeriodEnd: true,
      stripeSubscriptionStatus: true,
    },
  });

  if (!currentUser) {
    throw new Error('Not signed in');
  }

  return { currentUser };
};

export default serverAuth;
