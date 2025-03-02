import serverAuth from '@/lib/serverAuth';
import { db } from '@/lib/db';
import { fetchIframelyData, processIframelyResponse } from '@/utils/iframely';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PUT') {
    res.status(405).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { currentUser } = await serverAuth(req, res);
      const { title, url, order, isSocial } = req.body;

      // Fetch Iframely data
      const iframelyData = await fetchIframelyData(url);
      const processedData = processIframelyResponse(iframelyData);

      const link = await db.link.create({
        data: {
          title,
          url,
          order,
          userId: currentUser.id,
          isSocial,
          // Add Iframely data
          type: processedData.type,
          providerName: processedData.providerName,
          embedHtml: processedData.embedHtml,
          thumbnails: processedData.thumbnails,
          authorName: processedData.authorName,
          authorUrl: processedData.authorUrl,
          iframelyMeta: processedData.iframelyMeta,
        },
      });

      res.status(200).json(link);
      return;
    }

    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'Invalid userId' });
        return;
      }

      try {
        const links = await db.link.findMany({
          where: {
            userId,
          },
          select: {
            id: true,
            title: true,
            url: true,
            archived: true,
            order: true,
            isSocial: true,
            clicks: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            // Explicitly select Iframely fields
            type: true,
            providerName: true,
            embedHtml: true,
            thumbnails: true,
            authorName: true,
            authorUrl: true,
            iframelyMeta: true,
            // Include minimal user data
            user: {
              select: {
                id: true,
                name: true,
                handle: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        });

        // Always return an array (even if empty or undefined)
        res.status(200).json(links || []);
        return;
      } catch (dbError) {
        console.error(`Database error fetching links for userId ${userId}:`, dbError);
        res.status(500).json({
          error: 'Database error while fetching links',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        });
        return;
      }
    }

    if (req.method === 'PUT') {
      const { links } = req.body;

      if (!links || !Array.isArray(links)) {
        res.status(400).json({ error: 'Invalid links data' });
        return;
      }

      try {
        await Promise.all(
          links.map(({ id }, index) =>
            db.link.update({
              where: {
                id,
              },
              data: {
                order: index,
              },
            })
          )
        );
        res.status(200).json({ msg: 'link order updated' });
        return;
      } catch (updateError) {
        console.error('Error updating link order:', updateError);
        res.status(500).json({
          error: 'Failed to update link order',
          details: process.env.NODE_ENV === 'development' ? updateError.message : undefined,
        });
        return;
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}
