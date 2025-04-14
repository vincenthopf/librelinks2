import { getSession } from 'next-auth/react';
import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    // Only handle PATCH requests
    if (req.method !== 'PATCH') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate the user
    const { currentUser } = await serverAuth(req, res);

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, duration, delay, staggered, staggerAmount } = req.body;

    // Create the animation settings as a JSON object
    const animationSettings = {
      type,
      duration,
      delay,
      staggered,
      staggerAmount,
      enabled: type !== 'none',
    };

    // Update user's frameAnimation field to store our animation settings
    // This is a workaround until we can add a proper animations field to the schema
    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        frameAnimation: animationSettings,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('ANIMATIONS API ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
