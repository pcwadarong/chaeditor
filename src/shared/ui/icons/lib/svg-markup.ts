/**
 * Normalizes raw SVG markup so it behaves like a lightweight icon primitive.
 */
export const normalizeSvgMarkup = (svgMarkup: string): string =>
  svgMarkup
    .replace(/<svg\b[^>]*>/, svgTag => svgTag.replace(/\s(width|height)="[^"]*"/gi, ''))
    .replace(/\s(fill|stroke)="(?!none|currentColor)[^"]*"/gi, '')
    .replace(
      /<svg\b([^>]*)\sstyle="([^"]*)"/i,
      '<svg$1 style="$2; color: inherit; display: block;" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"',
    )
    .replace(
      /<svg\b([^>]*)>/i,
      '<svg$1 style="color: inherit; display: block;" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">',
    );

/**
 * Scopes internal SVG ids so multiple inline icons cannot collide in the same document.
 */
export const scopeSvgMarkupIds = (svgMarkup: string, scope: string): string => {
  const sanitizedScope = scope.replace(/[^a-zA-Z0-9_-]/g, '') || 'icon';
  const idMatches = Array.from(svgMarkup.matchAll(/\sid="([^"]+)"/g));

  if (idMatches.length === 0) return svgMarkup;

  let scopedMarkup = svgMarkup;

  idMatches.forEach(([_fullMatch, id], index) => {
    const scopedId = `${sanitizedScope}-${index}-${id}`;
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const idPattern = new RegExp(`id="${escapedId}"`, 'g');
    const urlPattern = new RegExp(`url\\(#${escapedId}\\)`, 'g');
    const hrefPattern = new RegExp(`([\\s:])href="#${escapedId}"`, 'g');
    const xlinkPattern = new RegExp(`xlink:href="#${escapedId}"`, 'g');

    scopedMarkup = scopedMarkup
      .replace(idPattern, `id="${scopedId}"`)
      .replace(urlPattern, `url(#${scopedId})`)
      .replace(hrefPattern, `$1href="#${scopedId}"`)
      .replace(xlinkPattern, `xlink:href="#${scopedId}"`);
  });

  return scopedMarkup;
};
