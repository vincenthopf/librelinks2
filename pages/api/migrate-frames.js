import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Frame type mapping
    const frameMapping = {
      basic: 'none',
      'name-top': 'none',
      'name-bottom': 'none',
      'name-pattern': 'none',
    };

    // Find all users with old frame types
    const users = await db.user.findMany({
      where: {
        frameTemplate: { in: Object.keys(frameMapping) },
      },
    });

    // Update each user's frame settings
    const updates = users.map((user) =>
      db.user.update({
        where: { id: user.id },
        data: {
          frameTemplate: frameMapping[user.frameTemplate],
        },
      })
    );

    // Execute all updates
    await Promise.all(updates);

    return res.status(200).json({
      message: `Successfully migrated ${users.length} users to new frame templates`,
      migratedUsers: users.length,
    });
  } catch (error) {
    console.error('Error in frame migration:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
