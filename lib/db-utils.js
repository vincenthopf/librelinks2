import { db } from './db';

/**
 * Executes database operations in a transaction
 * @param {Function} operations - Async function containing database operations
 * @returns {Promise} Result of the operations
 */
export const withTransaction = async (operations) => {
  try {
    const result = await db.$transaction(async (prisma) => {
      return await operations(prisma);
    });
    return result;
  } catch (error) {
    console.error('Transaction Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
    });
    throw error;
  }
};
