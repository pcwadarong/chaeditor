import { parseMarkdownInlineDirective } from '@/shared/lib/markdown/markdown-inline-directives';

describe('markdown-inline-directives', () => {
  it('Under a style directive href, parseMarkdownInlineDirective must decode color and background values', () => {
    expect(parseMarkdownInlineDirective('#md-style:color=%23ff0000;background=%2300ff00')).toEqual({
      background: '#00ff00',
      color: '#ff0000',
      type: 'style',
    });
  });

  it('Under a math directive href, parseMarkdownInlineDirective must decode the formula payload', () => {
    expect(parseMarkdownInlineDirective('#md-math:%5Cfrac%7Ba%7D%7Bb%7D')).toEqual({
      formula: '\\frac{a}{b}',
      type: 'math',
    });
  });

  it('Under an invalid math directive href, parseMarkdownInlineDirective must return null', () => {
    expect(parseMarkdownInlineDirective('#md-math:%E0%A4%A')).toBeNull();
  });
});
