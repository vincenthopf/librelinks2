import { db } from '@/lib/db';
import serverAuth from '@/lib/serverAuth';

export default async function handler(req, res) {
  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const { templateId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating value' });
    }

    // Get the template
    const template = await db.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Calculate new rating
    const newRatingCount = template.ratingCount + 1;
    const newRating =
      (template.rating * template.ratingCount + rating) / newRatingCount;

    // Update template rating
    await db.template.update({
      where: { id: templateId },
      data: {
        rating: newRating,
        ratingCount: newRatingCount,
      },
    });

    return res.status(200).json({
      rating: newRating,
      ratingCount: newRatingCount,
    });
  } catch (error) {
    console.error('Template Rating API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
