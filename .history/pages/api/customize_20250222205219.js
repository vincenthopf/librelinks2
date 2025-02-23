import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/libs/prismadb';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const {
      // Font sizes
      profileNameFontSize,
      bioFontSize,
      linkTitleFontSize,
      // Image sizes
      socialIconSize,
      faviconSize,
      // Other customization fields
      ...otherFields
    } = req.body;

    // Validate font sizes
    if (
      profileNameFontSize &&
      (profileNameFontSize < 12 || profileNameFontSize > 32)
    ) {
      return res
        .status(400)
        .json({
          message: 'Profile name font size must be between 12px and 32px',
        });
    }
    if (bioFontSize && (bioFontSize < 12 || bioFontSize > 32)) {
      return res
        .status(400)
        .json({ message: 'Bio font size must be between 12px and 32px' });
    }
    if (
      linkTitleFontSize &&
      (linkTitleFontSize < 12 || linkTitleFontSize > 32)
    ) {
      return res
        .status(400)
        .json({
          message: 'Link title font size must be between 12px and 32px',
        });
    }

    // Validate image sizes
    if (socialIconSize && (socialIconSize < 16 || socialIconSize > 64)) {
      return res
        .status(400)
        .json({ message: 'Social icon size must be between 16px and 64px' });
    }
    if (faviconSize && (faviconSize < 16 || faviconSize > 64)) {
      return res
        .status(400)
        .json({ message: 'Favicon size must be between 16px and 64px' });
    }

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        // Font sizes
        profileNameFontSize,
        bioFontSize,
        linkTitleFontSize,
        // Image sizes
        socialIconSize,
        faviconSize,
        // Other customization fields
        ...otherFields,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in customize API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
