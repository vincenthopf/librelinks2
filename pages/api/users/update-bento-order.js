import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API route to update the order of items in Bento view
 *
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @returns {object} JSON response with success status
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the session to verify the user
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { items } = req.body;

    // Validate items array
    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Invalid items format. Must be an array of items with id and order properties.',
      });
    }

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Start a transaction to update multiple items
    const result = await prisma.$transaction(async prisma => {
      // Create an array of update promises
      const updatePromises = items.map(async item => {
        // Skip items without id or order
        if (!item.id || item.order === undefined) return null;

        // Determine the type of item (link or text)
        if (item.type === 'link') {
          return prisma.link.updateMany({
            where: {
              id: item.id,
              userId: user.id,
            },
            data: {
              order: item.order,
            },
          });
        } else if (item.type === 'text') {
          return prisma.text.updateMany({
            where: {
              id: item.id,
              userId: user.id,
            },
            data: {
              order: item.order,
            },
          });
        } else if (item.type === 'photo') {
          return prisma.photoBookImage.updateMany({
            where: {
              id: item.id,
              userId: user.id,
            },
            data: {
              order: item.order,
            },
          });
        }

        return null;
      });

      // Execute all updates in parallel
      return Promise.all(updatePromises);
    });

    return res.status(200).json({
      message: 'Item order updated successfully',
      updated: result.filter(Boolean).length,
    });
  } catch (error) {
    console.error('Error updating bento order:', error);
    return res.status(500).json({
      message: 'An error occurred while updating item order',
    });
  } finally {
    await prisma.$disconnect();
  }
}
