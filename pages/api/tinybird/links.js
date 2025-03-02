import axios from 'axios';
import { db } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const { handle } = req.query;

    if (!handle || typeof handle !== 'string') {
      return res.status(400).json({ error: 'Handle is required' });
    }

    // For link clicks, we'll use the database since Tinybird doesn't track this by default
    // Get the user ID from the handle
    const user = await db.user.findUnique({
      where: { handle },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the user's links with click data
    const links = await db.link.findMany({
      where: {
        userId: user.id,
        archived: false,
      },
      select: {
        id: true,
        title: true,
        url: true,
        clicks: true,
      },
      orderBy: {
        clicks: 'desc',
      },
    });

    // Format the data
    const formattedData = links.map(link => ({
      title: link.title || 'Unknown Link',
      url: link.url || '#',
      clicks: link.clicks || 0,
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch link analytics data' });
  }
}
