import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prismadb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET /api/texts
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      // Verify the user is requesting their own texts or is an admin
      const currentUser = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only allow users to see their own texts unless they're an admin
      if (userId !== currentUser.id && !currentUser.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const texts = await prisma.text.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          order: 'asc',
        },
      });

      return res.status(200).json(texts);
    } catch (error) {
      console.error('Error fetching texts:', error);
      return res.status(500).json({ error: 'Failed to fetch texts' });
    }
  }

  // POST /api/texts
  if (req.method === 'POST') {
    try {
      const { title, content, order } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newText = await prisma.text.create({
        data: {
          title,
          content: content || '',
          order,
          userId: currentUser.id,
        },
      });

      return res.status(201).json(newText);
    } catch (error) {
      console.error('Error creating text:', error);
      return res.status(500).json({ error: 'Failed to create text' });
    }
  }

  // PUT /api/texts (for batch updating text order)
  if (req.method === 'PUT') {
    try {
      const { texts } = req.body;

      if (!texts || !Array.isArray(texts)) {
        return res.status(400).json({ error: 'Texts array is required' });
      }

      const currentUser = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify all texts belong to the current user
      for (const text of texts) {
        const textRecord = await prisma.text.findUnique({
          where: { id: text.id },
          select: { userId: true },
        });

        if (!textRecord || textRecord.userId !== currentUser.id) {
          return res.status(403).json({
            error: 'You can only update your own texts',
          });
        }
      }

      // Update each text's order
      const updates = texts.map((text) =>
        prisma.text.update({
          where: { id: text.id },
          data: { order: text.order },
        })
      );

      await prisma.$transaction(updates);

      return res
        .status(200)
        .json({ message: 'Texts order updated successfully' });
    } catch (error) {
      console.error('Error updating text order:', error);
      return res.status(500).json({ error: 'Failed to update text order' });
    }
  }

  // Return 405 Method Not Allowed for other HTTP methods
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
