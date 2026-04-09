import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';

describe('collectMarkdownImages', () => {
  it('Under markdown content, collectMarkdownImages must extract images in order', () => {
    const markdown = [
      '![First](https://example.com/one.png)',
      '',
      'Text',
      '',
      '![Second](https://example.com/two.png "title")',
    ].join('\n');

    expect(collectMarkdownImages(markdown)).toEqual([
      {
        alt: 'First',
        sourceOffset: 0,
        src: 'https://example.com/one.png',
        viewerId: 'markdown-image-0',
      },
      {
        alt: 'Second',
        sourceOffset: 45,
        src: 'https://example.com/two.png',
        viewerId: 'markdown-image-1',
      },
    ]);
  });

  it('Under an empty image src, collectMarkdownImages must exclude the image', () => {
    expect(collectMarkdownImages('![]( )')).toEqual([]);
  });

  it('Under a leading gallery block, collectMarkdownImages must assign viewer ids only to regular markdown images', () => {
    const markdown = [
      ':::gallery',
      '![Gallery First](https://example.com/gallery-one.png)',
      '![Gallery Second](https://example.com/gallery-two.png)',
      ':::',
      '',
      '![Content Image](https://example.com/standalone.png)',
    ].join('\n');

    expect(collectMarkdownImages(markdown)).toEqual([
      {
        alt: 'Content Image',
        sourceOffset: 125,
        src: 'https://example.com/standalone.png',
        viewerId: 'markdown-image-0',
      },
    ]);
  });
});
