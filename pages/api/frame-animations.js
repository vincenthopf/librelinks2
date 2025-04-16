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

    const { type, enabled, config } = req.body;

    // Create the frame animation settings as a JSON object
    const frameAnimationSettings = {
      type,
      enabled: enabled !== false,
      config: config || {},
    };

    // Update user's frameAnimation field
    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        frameAnimation: frameAnimationSettings,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('FRAME ANIMATIONS API ERROR:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
