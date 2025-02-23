import { ensureHttps, isValidUrl } from '../helpers';

describe('ensureHttps', () => {
  it('should add https:// to URLs without protocol', () => {
    expect(ensureHttps('example.com')).toBe('https://example.com');
    expect(ensureHttps('www.example.com')).toBe('https://www.example.com');
  });

  it('should preserve existing protocols', () => {
    expect(ensureHttps('http://example.com')).toBe('http://example.com');
    expect(ensureHttps('https://example.com')).toBe('https://example.com');
    expect(ensureHttps('ftp://example.com')).toBe('ftp://example.com');
  });

  it('should handle empty or null input', () => {
    expect(ensureHttps('')).toBe('');
    expect(ensureHttps(null)).toBe(null);
    expect(ensureHttps(undefined)).toBe(undefined);
  });

  it('should handle URLs with paths and query parameters', () => {
    expect(ensureHttps('example.com/path')).toBe('https://example.com/path');
    expect(ensureHttps('example.com/path?query=value')).toBe(
      'https://example.com/path?query=value'
    );
    expect(ensureHttps('http://example.com/path?query=value')).toBe(
      'http://example.com/path?query=value'
    );
  });
});

describe('isValidUrl', () => {
  it('should validate URLs with protocols', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(true);
  });

  it('should validate URLs without protocols', () => {
    expect(isValidUrl('example.com')).toBe(true);
    expect(isValidUrl('www.example.com')).toBe(true);
  });

  it('should handle invalid URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('http://')).toBe(false);
    expect(isValidUrl('https://')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });

  it('should validate URLs with paths and query parameters', () => {
    expect(isValidUrl('example.com/path')).toBe(true);
    expect(isValidUrl('example.com/path?query=value')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
  });

  it('should validate URLs with special characters', () => {
    expect(isValidUrl('https://example.com/path with spaces')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=value&other=123')).toBe(
      true
    );
    expect(isValidUrl('https://example.com/#fragment')).toBe(true);
  });
});
