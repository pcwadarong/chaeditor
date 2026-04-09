import {
  normalizeMarkdownHtmlAliases,
  preprocessMarkdownInlineSyntax,
} from '@/entities/editor-core/model/markdown-inline';

describe('rich-markdown inline utils', () => {
  it('Under Enter after a br alias, normalizeMarkdownHtmlAliases must preserve both the hard break and the next line separation', () => {
    expect(normalizeMarkdownHtmlAliases(['First line<br/>', 'Second line'].join('\n'))).toBe(
      'First line  \n\nSecond line',
    );
  });

  it('Under inline math syntax outside a code fence, preprocessMarkdownInlineSyntax must convert the math tag to a markdown inline directive link', () => {
    expect(preprocessMarkdownInlineSyntax('The sum is <Math>a^2 + b^2</Math> done')).toBe(
      'The sum is [a^2 + b^2](#md-math:a%5E2%20%2B%20b%5E2) done',
    );
  });

  it('Under a fenced code block, preprocessMarkdownInlineSyntax must keep custom inline syntax unchanged', () => {
    expect(
      preprocessMarkdownInlineSyntax(
        ['```ts', 'const raw = "<Math>a^2</Math>";', '```'].join('\n'),
      ),
    ).toBe(['```ts', 'const raw = "<Math>a^2</Math>";', '```'].join('\n'));
  });
});
