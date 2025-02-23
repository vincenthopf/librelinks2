import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';
import { isValidFrameType, isValidHexColor } from '@/utils/frame-helpers';
import { CustomizationResponse, CustomizationError } from '@/types/components';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CustomizationResponse>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only PATCH method is allowed'
      }
    });
  }

  try {
    const { currentUser } = await serverAuth(req, res);

    const { 
      profileFrameType,
      profileFrameColor,
      ...otherUpdates
    } = req.body;

    // Validate frame type if provided
    if (profileFrameType && !isValidFrameType(profileFrameType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FRAME_TYPE',
          message: 'Invalid frame type provided',
          field: 'profileFrameType'
        }
      });
    }

    // Validate frame color if provided
    if (profileFrameColor && !isValidHexColor(profileFrameColor)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLOR_FORMAT',
          message: 'Invalid color format. Please use hex color (e.g., #FF0000)',
          field: 'profileFrameColor'
        }
      });
    }

    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        ...(profileFrameType && { profileFrameType }),
        ...(profileFrameColor && { profileFrameColor }),
        ...otherUpdates
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        profileFrameType: updatedUser.profileFrameType,
        profileFrameColor: updatedUser.profileFrameColor
      }
    });
  } catch (error) {
    console.error('Customization error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while updating the profile'
      }
    });
  }
} 