import {
  parseAttachmentStoragePath,
  resolveAttachmentDownloadHref,
} from '@/shared/lib/storage/attachment-download-path';

const SUPABASE_URL = 'https://project.supabase.co';
const publicBase = `${SUPABASE_URL}/storage/v1/object/public`;

describe('parseAttachmentStoragePath', () => {
  it('parses a valid public attachment URL', () => {
    expect(
      parseAttachmentStoragePath(`${publicBase}/article/attachments/report.pdf`, SUPABASE_URL),
    ).toEqual({ bucketName: 'article', filePath: 'report.pdf' });
  });

  it('decodes percent-encoded attachment paths', () => {
    expect(
      parseAttachmentStoragePath(`${publicBase}/article/attachments/my%20report.pdf`, SUPABASE_URL),
    ).toEqual({ bucketName: 'article', filePath: 'my report.pdf' });
  });

  it('rejects path traversal hidden behind percent-encoded separators', () => {
    // `%2F` survives URL normalization and decodes to `/`, so `..%2F..` becomes `../..`.
    expect(
      parseAttachmentStoragePath(
        `${publicBase}/article/attachments/..%2F..%2Fsecret.pdf`,
        SUPABASE_URL,
      ),
    ).toBeNull();
  });

  it('rejects URLs from a different origin', () => {
    expect(
      parseAttachmentStoragePath(
        'https://evil.example.com/storage/v1/object/public/article/attachments/x.pdf',
        SUPABASE_URL,
      ),
    ).toBeNull();
  });

  it('rejects an unknown storage bucket', () => {
    expect(
      parseAttachmentStoragePath(`${publicBase}/photo/attachments/x.pdf`, SUPABASE_URL),
    ).toBeNull();
  });

  it('returns null when no Supabase base URL is available', () => {
    expect(
      parseAttachmentStoragePath(`${publicBase}/article/attachments/x.pdf`, undefined),
    ).toBeNull();
  });
});

describe('resolveAttachmentDownloadHref', () => {
  it('rewrites a recognized Supabase URL to the internal download route', () => {
    expect(
      resolveAttachmentDownloadHref({
        fileName: 'report.pdf',
        href: `${publicBase}/article/attachments/report.pdf`,
        supabaseBaseUrl: SUPABASE_URL,
      }),
    ).toBe(
      '/api/attachments/download?bucket=article&fileName=report.pdf&path=attachments%2Freport.pdf',
    );
  });

  it('returns the original href when it is not a recognized Supabase URL', () => {
    expect(
      resolveAttachmentDownloadHref({
        fileName: 'x.pdf',
        href: 'https://cdn.example.com/x.pdf',
        supabaseBaseUrl: SUPABASE_URL,
      }),
    ).toBe('https://cdn.example.com/x.pdf');
  });
});
