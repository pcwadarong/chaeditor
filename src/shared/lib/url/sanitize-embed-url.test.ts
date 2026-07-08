import { sanitizeEmbedResourceUrl } from '@/shared/lib/url/sanitize-embed-url';

describe('sanitizeEmbedResourceUrl', () => {
  it('keeps absolute http(s) URLs', () => {
    expect(sanitizeEmbedResourceUrl('https://example.com/a.pdf')).toBe('https://example.com/a.pdf');
    expect(sanitizeEmbedResourceUrl('http://example.com/a.pdf')).toBe('http://example.com/a.pdf');
  });

  it('keeps root-relative paths', () => {
    expect(sanitizeEmbedResourceUrl('/storage/a.pdf')).toBe('/storage/a.pdf');
  });

  it('rejects unsafe schemes', () => {
    expect(sanitizeEmbedResourceUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeEmbedResourceUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeEmbedResourceUrl('vbscript:msgbox(1)')).toBeNull();
    expect(sanitizeEmbedResourceUrl('file:///etc/passwd')).toBeNull();
  });

  it('rejects protocol-relative URLs', () => {
    expect(sanitizeEmbedResourceUrl('//evil.example.com/a.pdf')).toBeNull();
  });

  it('rejects empty and whitespace-only input', () => {
    expect(sanitizeEmbedResourceUrl('')).toBeNull();
    expect(sanitizeEmbedResourceUrl('   ')).toBeNull();
    expect(sanitizeEmbedResourceUrl(null)).toBeNull();
    expect(sanitizeEmbedResourceUrl(undefined)).toBeNull();
  });

  it('ignores leading and trailing whitespace before validating the scheme', () => {
    expect(sanitizeEmbedResourceUrl('  javascript:alert(1)  ')).toBeNull();
    expect(sanitizeEmbedResourceUrl('  https://example.com/a.pdf  ')).toBe(
      'https://example.com/a.pdf',
    );
  });
});
