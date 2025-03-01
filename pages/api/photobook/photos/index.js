import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { db } from '@/lib/db';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if userId is provided in query params (for public profiles)
    const { userId } = req.query;

    if (userId) {
      // Public access - fetch photos for the specified user
      const photos = await db.photoBookImage.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });

      return res.status(200).json(photos);
    }

    // If no userId provided, require authentication (for admin panel)
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all photo book images for the user
    const photos = await db.photoBookImage.findMany({
      where: { userId: user.id },
      orderBy: { order: 'asc' },
    });

    return res.status(200).json(photos);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
