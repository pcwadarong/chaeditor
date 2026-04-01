import { createImageViewerUrl } from '@/shared/ui/image-viewer/model/create-image-viewer-url';

describe('createImageViewerUrl', () => {
  it('Under a download query, createImageViewerUrl must remove it from the image view URL', () => {
    const result = createImageViewerUrl(
      'https://example.com/storage/v1/object/sign/images/demo.jpg?token=abc&download=file.jpg',
    );

    expect(result).toBe('https://example.com/storage/v1/object/sign/images/demo.jpg?token=abc');
  });

  it('Under a relative path, createImageViewerUrl must safely resolve it against the baseUrl', () => {
    const result = createImageViewerUrl('/images/demo.jpg?download=1', 'https://chaen.dev');

    expect(result).toBe('https://chaen.dev/images/demo.jpg');
  });

  it('Under an unparsable URL, createImageViewerUrl must return the original string', () => {
    const result = createImageViewerUrl('https://[invalid-url', 'https://chaen.dev');

    expect(result).toBe('https://[invalid-url');
  });

  it('Under a relative path without a baseUrl, createImageViewerUrl must return the input string', () => {
    const result = createImageViewerUrl('/images/demo.jpg?download=1');

    expect(result).toBe('/images/demo.jpg?download=1');
  });
});
