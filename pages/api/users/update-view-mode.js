import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';

/**
 * API route to update the user's view mode
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {object} JSON response with updated view mode
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
    const { viewMode } = req.body;

    // Validate view mode
    if (!['normal', 'stacked', 'bento'].includes(viewMode)) {
      return res
        .status(400)
        .json({ message: 'Invalid view mode. Must be "normal", "stacked", or "bento".' });
    }

    // Update the user's view mode
    const updatedUser = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        viewMode,
      },
      select: {
        id: true,
        viewMode: true,
      },
    });

    return res.status(200).json({
      message: 'View mode updated successfully',
      viewMode: updatedUser.viewMode,
    });
  } catch (error) {
    console.error('Error updating view mode:', error);
    return res.status(500).json({ message: 'An error occurred while updating view mode' });
  }
}
