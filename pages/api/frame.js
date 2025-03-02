import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';

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
      frameTemplate,
      frameColor,
      frameRotation,
      frameAnimation,
      frameThickness,
      syncRotation,
      pictureRotation,
      frameCornerStyle,
      frameBorderRadius,
      frameAllCorners,
      frameTopLeftRadius,
      frameTopRightRadius,
      frameBottomLeftRadius,
      frameBottomRightRadius,
    } = req.body;

    const validFrameTemplates = [
      'none',
      'circle',
      'polaroid-classic',
      'polaroid-pattern',
      'rounded-corners',
    ];

    // Validate frame template if provided
    if (frameTemplate && !validFrameTemplates.includes(frameTemplate)) {
      return res.status(400).json({ error: 'Invalid frame template' });
    }

    // Validate frame color if provided
    if (frameColor && !/^#[0-9A-F]{6}$/i.test(frameColor)) {
      return res.status(400).json({ error: 'Invalid frame color format' });
    }

    // Validate frame thickness if provided
    if (frameThickness !== undefined) {
      const thickness = parseInt(frameThickness);
      if (isNaN(thickness) || thickness < 0 || thickness > 10) {
        return res.status(400).json({ error: 'Frame thickness must be between 0 and 10' });
      }
    }

    // Validate frame rotation if provided
    if (frameRotation !== undefined) {
      const rotation = parseInt(frameRotation);
      if (isNaN(rotation) || rotation < 0 || rotation > 360) {
        return res.status(400).json({ error: 'Frame rotation must be between 0 and 360 degrees' });
      }
    }

    // Validate picture rotation if provided
    if (pictureRotation !== undefined) {
      const rotation = parseInt(pictureRotation);
      if (isNaN(rotation) || rotation < 0 || rotation > 360) {
        return res.status(400).json({
          error: 'Picture rotation must be between 0 and 360 degrees',
        });
      }
    }

    // Validate frame animation if provided
    if (frameAnimation) {
      try {
        const animation =
          typeof frameAnimation === 'string' ? JSON.parse(frameAnimation) : frameAnimation;
        // Allow null type for "None" option
        if (
          typeof animation.enabled !== 'boolean' ||
          (animation.enabled && animation.type !== null && typeof animation.type !== 'string')
        ) {
          return res.status(400).json({ error: 'Invalid frame animation format' });
        }
      } catch (error) {
        return res.status(400).json({ error: 'Invalid frame animation JSON' });
      }
    }

    // Validate corner style if provided
    const validCornerStyles = [
      'notch',
      'scoop',
      'bevel',
      'diamond',
      'straight',
      'round',
      'squircle',
      'apple',
    ];
    if (frameCornerStyle && !validCornerStyles.includes(frameCornerStyle)) {
      return res.status(400).json({ error: 'Invalid corner style' });
    }

    // Validate border radius if provided
    if (frameBorderRadius !== undefined) {
      const radius = parseInt(frameBorderRadius);
      if (isNaN(radius) || radius < 4 || radius > 50) {
        return res.status(400).json({ error: 'Border radius must be between 4 and 50' });
      }
    }

    // Validate individual corner radii if provided
    const validateRadius = (radius, name) => {
      if (radius !== undefined) {
        const value = parseInt(radius);
        if (isNaN(value) || value < 4 || value > 50) {
          return `${name} must be between 4 and 50`;
        }
      }
      return null;
    };

    const topLeftError = validateRadius(frameTopLeftRadius, 'Top left radius');
    if (topLeftError) {
      return res.status(400).json({ error: topLeftError });
    }

    const topRightError = validateRadius(frameTopRightRadius, 'Top right radius');
    if (topRightError) {
      return res.status(400).json({ error: topRightError });
    }

    const bottomLeftError = validateRadius(frameBottomLeftRadius, 'Bottom left radius');
    if (bottomLeftError) {
      return res.status(400).json({ error: bottomLeftError });
    }

    const bottomRightError = validateRadius(frameBottomRightRadius, 'Bottom right radius');
    if (bottomRightError) {
      return res.status(400).json({ error: bottomRightError });
    }

    // Build update data object
    const updateData = {
      ...(frameTemplate && { frameTemplate }),
      ...(frameColor && { frameColor }),
      ...(frameRotation !== undefined && {
        frameRotation: parseInt(frameRotation, 10),
      }),
      ...(frameThickness !== undefined && {
        frameThickness: parseInt(frameThickness, 10),
      }),
      ...(pictureRotation !== undefined && {
        pictureRotation: parseInt(pictureRotation, 10),
      }),
      ...(syncRotation !== undefined && { syncRotation }),
      ...(frameAnimation && { frameAnimation }),
      ...(frameCornerStyle && { frameCornerStyle }),
      ...(frameBorderRadius !== undefined && {
        frameBorderRadius: parseInt(frameBorderRadius, 10),
      }),
      ...(frameAllCorners !== undefined && { frameAllCorners }),
      ...(frameTopLeftRadius !== undefined && {
        frameTopLeftRadius: parseInt(frameTopLeftRadius, 10),
      }),
      ...(frameTopRightRadius !== undefined && {
        frameTopRightRadius: parseInt(frameTopRightRadius, 10),
      }),
      ...(frameBottomLeftRadius !== undefined && {
        frameBottomLeftRadius: parseInt(frameBottomLeftRadius, 10),
      }),
      ...(frameBottomRightRadius !== undefined && {
        frameBottomRightRadius: parseInt(frameBottomRightRadius, 10),
      }),
    };

    // Update user
    const user = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
    });

    // Log the updated user data for debugging
    console.log('Updated user frame data:', {
      frameTemplate: user.frameTemplate,
      frameCornerStyle: user.frameCornerStyle,
      frameBorderRadius: user.frameBorderRadius,
      frameAllCorners: user.frameAllCorners,
      frameTopLeftRadius: user.frameTopLeftRadius,
      frameTopRightRadius: user.frameTopRightRadius,
      frameBottomLeftRadius: user.frameBottomLeftRadius,
      frameBottomRightRadius: user.frameBottomRightRadius,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in frame API:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
