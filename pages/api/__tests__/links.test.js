import { createMocks } from 'node-mocks-http';
import linkHandler from '../links/[linkId]';
import { db } from '@/lib/db';
import { fetchIframelyData } from '@/utils/iframely';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    link: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock Iframely
jest.mock('@/utils/iframely', () => ({
  fetchIframelyData: jest.fn(),
  processIframelyResponse: jest.fn((data) => data),
}));

describe('/api/links/[linkId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH', () => {
    it('should update link without Iframely data when URL is unchanged', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { linkId: '123' },
        body: {
          newTitle: 'Updated Title',
          newUrl: 'https://example.com',
        },
      });

      db.link.findUnique.mockResolvedValueOnce({
        id: '123',
        title: 'Old Title',
        url: 'https://example.com',
      });

      db.link.update.mockResolvedValueOnce({
        id: '123',
        title: 'Updated Title',
        url: 'https://example.com',
      });

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(fetchIframelyData).not.toHaveBeenCalled();
      expect(db.link.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          title: 'Updated Title',
          url: 'https://example.com',
          archived: undefined,
        },
      });
    });

    it('should update link with new Iframely data when URL is changed', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { linkId: '123' },
        body: {
          newTitle: 'Updated Title',
          newUrl: 'https://newexample.com',
        },
      });

      db.link.findUnique.mockResolvedValueOnce({
        id: '123',
        title: 'Old Title',
        url: 'https://example.com',
      });

      const mockIframelyData = {
        type: 'link',
        providerName: 'Example',
        embedHtml: '<iframe></iframe>',
        thumbnails: ['thumb.jpg'],
        authorName: 'Author',
        authorUrl: 'author.com',
        iframelyMeta: { meta: 'data' },
      };

      fetchIframelyData.mockResolvedValueOnce(mockIframelyData);

      db.link.update.mockResolvedValueOnce({
        id: '123',
        title: 'Updated Title',
        url: 'https://newexample.com',
        ...mockIframelyData,
      });

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(fetchIframelyData).toHaveBeenCalledWith('https://newexample.com');
      expect(db.link.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          title: 'Updated Title',
          url: 'https://newexample.com',
          archived: undefined,
          ...mockIframelyData,
        },
      });
    });

    it('should handle invalid linkId', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { linkId: null },
        body: {
          newTitle: 'Updated Title',
          newUrl: 'https://example.com',
        },
      });

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid ID' });
    });

    it('should handle non-existent link', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { linkId: '123' },
        body: {
          newTitle: 'Updated Title',
          newUrl: 'https://example.com',
        },
      });

      db.link.findUnique.mockResolvedValueOnce(null);

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Link not found' });
    });

    it('should handle Iframely API failure gracefully', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { linkId: '123' },
        body: {
          newTitle: 'Updated Title',
          newUrl: 'https://newexample.com',
        },
      });

      db.link.findUnique.mockResolvedValueOnce({
        id: '123',
        title: 'Old Title',
        url: 'https://example.com',
      });

      fetchIframelyData.mockResolvedValueOnce(null);

      db.link.update.mockResolvedValueOnce({
        id: '123',
        title: 'Updated Title',
        url: 'https://newexample.com',
      });

      await linkHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(db.link.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: {
          title: 'Updated Title',
          url: 'https://newexample.com',
          archived: undefined,
        },
      });
    });
  });
});
