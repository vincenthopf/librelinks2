import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prismadb';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { items, photoBookOrder } = req.body;

  // Basic validation
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items array' });
  }
  // photoBookOrder can be null or a number (including 0)
  if (photoBookOrder !== null && typeof photoBookOrder !== 'number') {
    return res.status(400).json({ error: 'Invalid photoBookOrder' });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }, // Only select ID
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const linkUpdates = [];
    const textUpdates = [];

    // Prepare update operations based on item type
    items.forEach(item => {
      if (item.type === 'link' && item.id && typeof item.order === 'number') {
        linkUpdates.push(
          prisma.link.updateMany({
            // Use updateMany for efficiency and safety
            where: {
              id: item.id,
              userId: currentUser.id, // Ensure user owns the link
            },
            data: { order: item.order },
          })
        );
      } else if (item.type === 'text' && item.id && typeof item.order === 'number') {
        textUpdates.push(
          prisma.text.updateMany({
            // Use updateMany for efficiency and safety
            where: {
              id: item.id,
              userId: currentUser.id, // Ensure user owns the text
            },
            data: { order: item.order },
          })
        );
      }
      // Ignore items with missing data or unknown types
    });

    // Prepare user update for photoBookOrder (only if it's provided)
    const userUpdate = prisma.user.update({
      where: { id: currentUser.id },
      data: { photoBookOrder: photoBookOrder }, // Update with the new order (can be null)
    });

    // Execute all updates within a transaction
    await prisma.$transaction([...linkUpdates, ...textUpdates, userUpdate]);

    return res.status(200).json({ message: 'Item order updated successfully' });
  } catch (error) {
    console.error('Error updating item order:', error);
    // Check for specific Prisma errors if needed (e.g., record not found)
    if (error.code === 'P2025') {
      // Prisma code for RecordNotFound
      return res.status(404).json({ error: 'One or more items not found or not owned by user.' });
    }
    return res.status(500).json({ error: 'Failed to update item order' });
  }
}
