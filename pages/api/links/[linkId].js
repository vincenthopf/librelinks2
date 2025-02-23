import { db } from '@/lib/db';
import { fetchIframelyData, processIframelyResponse } from '@/utils/iframely';

export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).end();
  }

  try {
    const { linkId } = req.query;

    if (!linkId || typeof linkId !== 'string') {
      throw new Error('Invalid ID');
    }

    if (req.method === 'PATCH') {
      const { newTitle, newUrl, archived } = req.body;

      // Get current link data to check if URL changed
      const currentLink = await db.link.findUnique({
        where: { id: linkId },
      });

      if (!currentLink) {
        return res.status(404).json({ error: 'Link not found' });
      }

      // Only fetch new Iframely data if URL changed
      let iframelyData = null;
      if (newUrl && newUrl !== currentLink.url) {
        console.log('URL changed, fetching new Iframely data for:', newUrl);
        iframelyData = await fetchIframelyData(newUrl);
      }

      const processedData = iframelyData
        ? processIframelyResponse(iframelyData)
        : null;

      const updatedLink = await db.link.update({
        where: {
          id: linkId,
        },
        data: {
          title: newTitle,
          url: newUrl,
          archived: archived,
          // Only update Iframely data if we have new data
          ...(processedData && {
            type: processedData.type,
            providerName: processedData.providerName,
            embedHtml: processedData.embedHtml,
            thumbnails: processedData.thumbnails,
            authorName: processedData.authorName,
            authorUrl: processedData.authorUrl,
            iframelyMeta: processedData.iframelyMeta,
          }),
        },
      });

      return res.status(200).json(updatedLink);
    } else if (req.method === 'DELETE') {
      await db.link.delete({
        where: {
          id: linkId,
        },
      });

      return res.status(204).end();
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(400).json({ error: error.message || 'Bad Request' });
  }
}
