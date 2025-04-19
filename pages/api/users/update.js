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

    // Get update data from request body
    const updateData = req.body;

    // Perform the update
    const user = await db.user.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        handle: true,
        bio: true,
        stackView: true,
        links: {
          select: {
            id: true,
            title: true,
            url: true,
            order: true,
            archived: true,
            isSocial: true,
            alwaysExpandEmbed: true,
          },
        },
      },
    });

    // Send response
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in user update API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
