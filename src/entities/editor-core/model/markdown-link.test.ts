import {
  buildEditorLinkInsertion,
  createMarkdownLink,
} from '@/entities/editor-core/model/markdown-link';

describe('createMarkdownLink', () => {
  it('escapes brackets in the label so the link stays valid', () => {
    expect(createMarkdownLink('a]b', 'https://example.com')).toBe('[a\\]b](https://example.com/)');
  });

  it('wraps a destination containing parentheses in angle brackets', () => {
    expect(createMarkdownLink('Wiki', 'https://en.wikipedia.org/wiki/Foo_(bar)')).toBe(
      '[Wiki](<https://en.wikipedia.org/wiki/Foo_(bar)>)',
    );
  });

  it('escapes an existing backslash in the label so it is not mis-escaped', () => {
    // Label text is literally `a\]b`; both the backslash and the bracket escape.
    expect(createMarkdownLink('a\\]b', 'https://example.com')).toBe(
      '[a\\\\\\]b](https://example.com/)',
    );
  });

  it('escapes double quotes in the title', () => {
    expect(createMarkdownLink('Docs', 'https://example.com', 'a"b')).toBe(
      '[Docs](https://example.com/ "a\\"b")',
    );
  });
});

describe('buildEditorLinkInsertion', () => {
  it('links a pasted URL over selected text', () => {
    expect(
      buildEditorLinkInsertion({ clipboardText: 'https://example.com', selectedText: 'site' }),
    ).toEqual({
      text: '[site](https://example.com/)',
      type: 'link',
    });
  });

  it('extracts a "label url" clipboard value on a single line', () => {
    expect(
      buildEditorLinkInsertion({
        clipboardText: 'OpenAI https://openai.com',
        selectedText: '',
      }),
    ).toEqual({
      text: '[OpenAI](https://openai.com/)',
      type: 'link',
    });
  });

  it('does not build a link when the label would span multiple lines', () => {
    expect(
      buildEditorLinkInsertion({
        clipboardText: 'line1\nlabel https://example.com/a',
        selectedText: '',
      }),
    ).toBeNull();
  });
});
