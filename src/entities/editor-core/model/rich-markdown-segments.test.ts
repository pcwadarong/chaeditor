import {
  parseRichMarkdownSegments,
  parseToggleTitle,
} from '@/entities/editor-core/model/rich-markdown-segments';

describe('rich-markdown segment parser', () => {
  it('Under a toggle title with a heading prefix, parseToggleTitle must split the heading level and display title', () => {
    expect(parseToggleTitle('### Toggle Title')).toEqual({
      headingLevel: 3,
      title: 'Toggle Title',
    });
  });

  it('Under mixed custom syntax blocks, parseRichMarkdownSegments must preserve the markdown and custom segment order', () => {
    expect(
      parseRichMarkdownSegments(
        [
          'Leading paragraph',
          ':::gallery',
          '![First](https://example.com/one.png)',
          '![Second](https://example.com/two.png)',
          ':::',
          '<Video provider="youtube" id="dQw4w9WgXcQ" />',
          '<Attachment href="https://example.com/resume.pdf" name="resume.pdf" size="2048" type="application/pdf" />',
          '<Math block="true">a^2 + b^2 = c^2</Math>',
          '-# Subtext',
        ].join('\n'),
      ),
    ).toEqual([
      {
        markdown: 'Leading paragraph',
        type: 'markdown',
      },
      {
        items: [
          {
            alt: 'First',
            sourceOffset: 0,
            src: 'https://example.com/one.png',
            viewerId: 'markdown-image-0',
          },
          {
            alt: 'Second',
            sourceOffset: 38,
            src: 'https://example.com/two.png',
            viewerId: 'markdown-image-1',
          },
        ],
        type: 'gallery',
      },
      {
        provider: 'youtube',
        src: undefined,
        type: 'video',
        videoId: 'dQw4w9WgXcQ',
      },
      {
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        fileSize: 2048,
        href: 'https://example.com/resume.pdf',
        type: 'attachment',
      },
      {
        formula: 'a^2 + b^2 = c^2',
        isBlock: true,
        type: 'math',
      },
      {
        content: 'Subtext',
        type: 'subtext',
      },
    ]);
  });

  it('Under custom syntax inside a fenced code block, parseRichMarkdownSegments must keep the whole block as plain markdown', () => {
    expect(
      parseRichMarkdownSegments(
        ['```md', '<Video provider="youtube" id="dQw4w9WgXcQ" />', '```'].join('\n'),
      ),
    ).toEqual([
      {
        markdown: ['```md', '<Video provider="youtube" id="dQw4w9WgXcQ" />', '```'].join('\n'),
        type: 'markdown',
      },
    ]);
  });

  it('Under ::: inside fenced code within toggle content, parseRichMarkdownSegments must keep the fenced block and parse the toggle to the end', () => {
    expect(
      parseRichMarkdownSegments(
        [
          ':::toggle ## Title',
          '```ts',
          "const marker = ':::';",
          '```',
          'Actual content',
          ':::',
        ].join('\n'),
      ),
    ).toEqual([
      {
        content: ['```ts', "const marker = ':::';", '```', 'Actual content'].join('\n'),
        headingLevel: 2,
        title: 'Title',
        type: 'toggle',
      },
    ]);
  });
});
