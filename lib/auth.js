import { getSession } from 'next-auth/react';

export const isAdmin = async () => {
  const session = await getSession();
  return session?.user?.isAdmin || false;
};

export const requireAdmin = async () => {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
};

export const withAdminProtection = (handler) => async (req, res) => {
  try {
    await requireAdmin();
    return handler(req, res);
  } catch (error) {
    return res
      .status(403)
      .json({ error: 'Unauthorized: Admin access required' });
  }
};
