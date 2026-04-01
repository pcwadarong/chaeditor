const htmlLineBreakPattern = /<br\s*\/?>/gi;
const htmlHorizontalRulePattern = /<hr\s*\/?>/gi;
const markdownLineBreakPlaceholder = '__MD_LINE_BREAK__';
const markdownHorizontalRulePlaceholder = '__MD_HORIZONTAL_RULE__';
const inlineStyledSpanPattern = /<span style="([^"]+)">([\s\S]*?)<\/span>/g;
const inlineUnderlinePattern = /<u>([\s\S]*?)<\/u>/g;
const inlineSpoilerPattern = /\|\|([^|]+?)\|\|/g;
const inlineMathPattern = /<Math>([\s\S]*?)<\/Math>/g;
const fenceBoundaryPattern = /^\s*(`{3,}|~{3,})/;

type FenceState = {
  delimiter: '`' | '~';
  size: number;
} | null;

/**
 * Detects whether the current line opens or closes a fenced code block.
 *
 * @param line Current markdown line.
 * @param activeFence Active fence state.
 * @returns Fence metadata or null.
 */
const getFenceBoundary = (line: string, activeFence: FenceState) => {
  const match = line.match(fenceBoundaryPattern);

  if (!match) return null;

  const delimiter = match[1][0] as '`' | '~';
  const size = match[1].length;

  if (!activeFence) {
    return {
      delimiter,
      size,
    };
  }

  if (activeFence.delimiter !== delimiter || size < activeFence.size) {
    return null;
  }

  return {
    delimiter,
    size,
  };
};

/**
 * Applies a transform only to prose outside fenced blocks and inline code.
 *
 * @param markdown Raw markdown string.
 * @param transform Transform applied to prose segments.
 * @returns Markdown with code segments preserved.
 */
export const transformMarkdownOutsideCode = (
  markdown: string,
  transform: (value: string) => string,
) => {
  const lines = markdown.split('\n');
  let activeFence: FenceState = null;

  return lines
    .map(line => {
      const fenceBoundary = getFenceBoundary(line, activeFence);

      if (fenceBoundary) {
        activeFence = activeFence ? null : fenceBoundary;
        return line;
      }

      if (activeFence) {
        return line;
      }

      let transformedLine = '';

      for (let cursor = 0; cursor < line.length; ) {
        if (line[cursor] !== '`') {
          const nextBacktickIndex = line.indexOf('`', cursor);
          const proseSegment = line.slice(
            cursor,
            nextBacktickIndex === -1 ? line.length : nextBacktickIndex,
          );

          transformedLine += transform(proseSegment);
          cursor = nextBacktickIndex === -1 ? line.length : nextBacktickIndex;
          continue;
        }

        let tickCount = 1;

        while (line[cursor + tickCount] === '`') {
          tickCount += 1;
        }

        const delimiter = '`'.repeat(tickCount);
        const codeStart = cursor;
        const codeEnd = line.indexOf(delimiter, cursor + tickCount);

        if (codeEnd === -1) {
          transformedLine += transform(line.slice(cursor));
          break;
        }

        transformedLine += line.slice(codeStart, codeEnd + tickCount);
        cursor = codeEnd + tickCount;
      }

      return transformedLine;
    })
    .join('\n');
};

/**
 * Escapes the minimum set of characters needed inside a markdown link label.
 *
 * @param value Inline directive label text.
 * @returns An escaped label string.
 */
const escapeMarkdownLinkLabel = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');

/**
 * Reads supported color tokens from an inline style string.
 *
 * @param style Raw inline style string.
 * @returns Extracted color values.
 */
const parseInlineStyle = (style: string) => {
  const declarations = style
    .split(';')
    .map(entry => entry.trim())
    .filter(Boolean);
  const styleMap = new Map<string, string>();

  declarations.forEach(entry => {
    const [property, rawValue] = entry.split(':');
    if (!property || !rawValue) return;

    styleMap.set(property.trim().toLowerCase(), rawValue.trim());
  });

  const color = styleMap.get('color');
  const background = styleMap.get('background-color');
  const colorHex = color?.match(/^#[0-9A-Fa-f]{6}$/)?.[0];
  const backgroundHex = background?.match(/^#[0-9A-Fa-f]{6}$/)?.[0];

  return {
    backgroundHex,
    colorHex,
  };
};

/**
 * Converts custom inline syntax into link-like tokens consumable by react-markdown.
 *
 * @param markdown Raw markdown string.
 * @returns Markdown with normalized inline directives.
 */
export const preprocessMarkdownInlineSyntax = (markdown: string) =>
  transformMarkdownOutsideCode(markdown, value =>
    value
      .replace(inlineStyledSpanPattern, (_, rawStyle: string, text: string) => {
        const escapedText = escapeMarkdownLinkLabel(text.trim() || 'Text');
        const { backgroundHex, colorHex } = parseInlineStyle(rawStyle);

        if (backgroundHex && colorHex) {
          return `[${escapedText}](#md-style:color=${colorHex};background=${backgroundHex})`;
        }

        if (backgroundHex) {
          return `[${escapedText}](#md-bg:${backgroundHex})`;
        }

        if (colorHex) {
          return `[${escapedText}](#md-color:${colorHex})`;
        }

        return text;
      })
      .replace(inlineUnderlinePattern, (_, text: string) => {
        const escapedText = escapeMarkdownLinkLabel(text.trim() || 'Text');

        return `[${escapedText}](#md-underline:)`;
      })
      .replace(inlineSpoilerPattern, (_, text: string) => {
        const escapedText = escapeMarkdownLinkLabel(text.trim() || 'Spoiler');

        return `[${escapedText}](#md-spoiler:)`;
      })
      .replace(inlineMathPattern, (_, formula: string) => {
        const normalizedFormula = formula.trim();
        const encodedFormula = encodeURIComponent(normalizedFormula);
        const escapedLabel = escapeMarkdownLinkLabel(normalizedFormula || 'math');

        return `[${escapedLabel}](#md-math:${encodedFormula})`;
      }),
  );

/**
 * Normalizes raw HTML aliases such as line breaks and horizontal rules into markdown equivalents.
 *
 * @param markdown Raw markdown string.
 * @returns Markdown with HTML aliases normalized.
 */
export const normalizeMarkdownHtmlAliases = (markdown: string) =>
  transformMarkdownOutsideCode(markdown, value =>
    value
      .replace(htmlHorizontalRulePattern, markdownHorizontalRulePlaceholder)
      .replace(htmlLineBreakPattern, markdownLineBreakPlaceholder),
  )
    .replace(new RegExp(markdownLineBreakPlaceholder, 'g'), '  \n')
    .replace(
      new RegExp(`(^|\n)${markdownHorizontalRulePlaceholder}(?=\n|$)`, 'g'),
      (_, prefix: string) => `${prefix}---`,
    )
    .replace(new RegExp(markdownHorizontalRulePlaceholder, 'g'), '\n---\n');
