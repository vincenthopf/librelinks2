import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';

/**
 * API route to update the user's bento layout spans
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {object} JSON response with updated bento spans
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the session to verify the user
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { bentoItems } = req.body;

    // Validate bentoItems
    if (!Array.isArray(bentoItems)) {
      return res.status(400).json({ message: 'Invalid bentoItems. Must be an array.' });
    }

    // Update the user's bento spans
    const updatedUser = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        bentoItems,
      },
      select: {
        id: true,
        bentoItems: true,
      },
    });

    return res.status(200).json({
      message: 'Bento layout updated successfully',
      bentoItems: updatedUser.bentoItems,
    });
  } catch (error) {
    console.error('Error updating bento spans:', error);
    return res.status(500).json({ message: 'An error occurred while updating bento layout' });
  }
}
