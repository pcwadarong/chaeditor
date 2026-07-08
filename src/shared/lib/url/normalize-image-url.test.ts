import { normalizeImageUrl } from '@/shared/lib/url/normalize-image-url';

describe('normalizeImageUrl', () => {
  it('keeps http(s) image URLs', () => {
    expect(normalizeImageUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
  });

  it('keeps inline data:image URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    expect(normalizeImageUrl(dataUrl)).toBe(dataUrl);
  });

  it('rejects unsafe schemes', () => {
    expect(normalizeImageUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeImageUrl('file:///etc/passwd')).toBeNull();
    expect(normalizeImageUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  it('unwraps a Google image search redirect only for the exact /search path', () => {
    expect(
      normalizeImageUrl('https://www.google.com/search?q=https%3A%2F%2Fexample.com%2Fa.png'),
    ).toBe('https://example.com/a.png');
    // A path that merely starts with "/search" must not be treated as a redirect wrapper.
    expect(normalizeImageUrl('https://www.google.com/searchresults?q=not-a-url')).toBe(
      'https://www.google.com/searchresults?q=not-a-url',
    );
  });

  it('never leaks an unsafe scheme when a Google search redirect wraps one', () => {
    // The wrapped target is unsafe, so unwrapping fails and it falls back to the
    // (safe, http) Google URL itself — the javascript: target must not leak out.
    const result = normalizeImageUrl('https://www.google.com/search?q=javascript%3Aalert(1)');
    expect(result).not.toMatch(/^javascript:/u);
    expect(result).toMatch(/^https:\/\/www\.google\.com\//u);
  });

  it('returns null for empty input', () => {
    expect(normalizeImageUrl('')).toBeNull();
    expect(normalizeImageUrl(null)).toBeNull();
  });
});
