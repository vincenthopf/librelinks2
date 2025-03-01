import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prismadb';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Text ID is required' });
  }

  try {
    // Find the text to verify ownership
    const text = await prisma.text.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    // Verify the user is the owner of the text
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow users to manage their own texts unless they're an admin
    if (text.userId !== currentUser.id && !currentUser.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // GET /api/texts/[id]
    if (req.method === 'GET') {
      const fullText = await prisma.text.findUnique({
        where: { id },
      });

      return res.status(200).json(fullText);
    }

    // PUT /api/texts/[id]
    if (req.method === 'PUT') {
      const { title, content, archived } = req.body;

      // Validation
      if (!title && title !== undefined) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }

      // Prepare update data
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (archived !== undefined) updateData.archived = archived;

      // Update the text
      const updatedText = await prisma.text.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(updatedText);
    }

    // DELETE /api/texts/[id]
    if (req.method === 'DELETE') {
      await prisma.text.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Text deleted successfully' });
    }

    // Return 405 Method Not Allowed for other HTTP methods
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(`Error handling text ${id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
