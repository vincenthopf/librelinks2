import { db } from '@/lib/db';

/**
 * Get a user's ID from their handle
 * @param {string} handle - The user's handle
 * @returns {Promise<string|null>} The user's ID or null if not found
 */
export const getUserIdFromHandle = async handle => {
  if (!handle) return null;

  try {
    // Find the user by handle
    const user = await db.user.findUnique({
      where: { handle },
      select: { id: true },
    });

    return user?.id || null;
  } catch (error) {
    console.error(`Error getting user ID from handle ${handle}:`, error);
    return null;
  }
};
