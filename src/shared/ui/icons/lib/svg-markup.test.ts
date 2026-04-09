import { normalizeSvgMarkup, scopeSvgMarkupIds } from '@/shared/ui/icons/lib/svg-markup';

describe('svg markup helpers', () => {
  it('Under repeated inline SVG ids, scopeSvgMarkupIds must rewrite local ids and url() references per instance', () => {
    const markup = [
      '<svg width="24" height="24" viewBox="0 0 24 24">',
      '<g clip-path="url(#clip0_403_3386)">',
      '<path d="M0 0h24v24H0z" fill="currentColor" />',
      '</g>',
      '<defs><clipPath id="clip0_403_3386"><rect width="24" height="24" /></clipPath></defs>',
      '</svg>',
    ].join('');

    const firstScopedMarkup = scopeSvgMarkupIds(markup, 'quote-a');
    const secondScopedMarkup = scopeSvgMarkupIds(markup, 'quote-b');

    expect(firstScopedMarkup).toContain('url(#quote-a-0-clip0_403_3386)');
    expect(firstScopedMarkup).toContain('id="quote-a-0-clip0_403_3386"');
    expect(secondScopedMarkup).toContain('url(#quote-b-0-clip0_403_3386)');
    expect(secondScopedMarkup).toContain('id="quote-b-0-clip0_403_3386"');
    expect(firstScopedMarkup).not.toContain('url(#clip0_403_3386)');
    expect(secondScopedMarkup).not.toContain('url(#clip0_403_3386)');
  });

  it('Under raw SVG markup, normalizeSvgMarkup must remove fixed dimensions and preserve currentColor behavior', () => {
    const normalizedMarkup = normalizeSvgMarkup(
      '<svg width="24" height="24"><path fill="currentColor" stroke="#111" /></svg>',
    );

    expect(normalizedMarkup).toContain('width="100%"');
    expect(normalizedMarkup).toContain('height="100%"');
    expect(normalizedMarkup).toContain('fill="currentColor"');
    expect(normalizedMarkup).not.toContain('stroke="#111"');
  });
});
