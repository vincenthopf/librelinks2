import serverAuth from '@/lib/serverAuth';
import { db } from '@/lib/db';
import { fetchIframelyData, processIframelyResponse } from '@/utils/iframely';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).end();
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

      return res.status(200).json(link);
    }

    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid userId' });
      }

      // Add debug logging
      console.log('Fetching links for userId:', userId);

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

      // Add debug logging
      console.log('Links fetched:', links.length);
      console.log('Sample link data (first link):', links[0]);

      return res.status(200).json(links);
    }

    if (req.method === 'PUT') {
      const { links } = req.body;
      console.log('links', links);

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
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
