/** @vitest-environment node */

import {
  createAlignBlockMarkdown,
  createAttachmentEmbedMarkdown,
  createImageEmbedMarkdown,
  createImageEmbedMarkdownGroup,
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  createToggleBlockMarkdown,
} from '@/entities/editor-core/model/markdown-templates';

describe('markdown-toolbar template helpers', () => {
  it('Under image markdown input, createImageEmbedMarkdown must preserve selected whitespace and escape special characters', () => {
    expect(createImageEmbedMarkdown('  alt] text  ', 'https://example.com/image).png')).toBe(
      '![  alt\\] text  ](https://example.com/image\\).png)',
    );
  });

  it('Under multiple image items, createImageGalleryMarkdown must wrap them in gallery block syntax', () => {
    expect(
      createImageGalleryMarkdown([
        { altText: 'Image 1', url: 'https://example.com/one.png' },
        { altText: 'Image 2', url: 'https://example.com/two.png' },
      ]),
    ).toBe(
      [
        ':::gallery',
        '![Image 1](https://example.com/one.png)',
        '![Image 2](https://example.com/two.png)',
        ':::',
      ].join('\n'),
    );
  });

  it('Under multiple image items, createImageEmbedMarkdownGroup must join them with blank lines', () => {
    expect(
      createImageEmbedMarkdownGroup([
        { altText: 'Image 1', url: 'https://example.com/one.png' },
        { altText: 'Image 2', url: 'https://example.com/two.png' },
      ]),
    ).toBe(
      ['![Image 1](https://example.com/one.png)', '![Image 2](https://example.com/two.png)'].join(
        '\n\n',
      ),
    );
  });

  it('Under an alignment request, createAlignBlockMarkdown must return the block text and cursor offset', () => {
    expect(createAlignBlockMarkdown('left')).toEqual({
      cursorOffset: ':::align left\n'.length,
      text: ':::align left\nText\n:::',
    });
    expect(createAlignBlockMarkdown('center')).toEqual({
      cursorOffset: ':::align center\n'.length,
      text: ':::align center\nText\n:::',
    });
    expect(createAlignBlockMarkdown('right')).toEqual({
      cursorOffset: ':::align right\n'.length,
      text: ':::align right\nText\n:::',
    });
  });

  it('Under an empty toggle title, createToggleBlockMarkdown must return the default empty template', () => {
    expect(createToggleBlockMarkdown(4, '')).toEqual({
      cursorOffset: 15,
      text: ':::toggle #### \n:::',
    });
  });

  it('Under a selected toggle title, createToggleBlockMarkdown must include the body placeholder', () => {
    expect(createToggleBlockMarkdown(2, 'Title')).toEqual({
      cursorOffset: 18,
      text: ':::toggle ## Title\nContent\n:::',
    });
  });

  it('Under attachment metadata, createAttachmentEmbedMarkdown must escape attributes and include size and type', () => {
    expect(
      createAttachmentEmbedMarkdown({
        contentType: 'application/pdf',
        fileName: 'resume "v2".pdf',
        fileSize: 2048,
        url: 'https://example.com/resume.pdf',
      }),
    ).toBe(
      '<Attachment href="https://example.com/resume.pdf" name="resume &quot;v2&quot;.pdf" size="2048" type="application/pdf" />',
    );
  });

  it('Under math markdown input, createMathEmbedMarkdown must distinguish inline and block output and flatten line breaks', () => {
    expect(
      createMathEmbedMarkdown({
        formula: 'a^2 + b^2 = c^2',
        isBlock: false,
      }),
    ).toBe('<Math>a^2 + b^2 = c^2</Math>');
    expect(
      createMathEmbedMarkdown({
        formula: '\\begin{cases}\n x, &x \\ge 0 \\\\\n -x, &x < 0\n\\end{cases}',
        isBlock: true,
      }),
    ).toBe(
      '\n<Math block="true">\\begin{cases} x, &x \\ge 0 \\\\ -x, &x < 0 \\end{cases}</Math>\n',
    );
  });
});
