type MarkdownInlineDirective =
  | {
      type: 'background';
      value: string;
    }
  | {
      type: 'color';
      value: string;
    }
  | {
      background?: string;
      color?: string;
      type: 'style';
    }
  | {
      formula: string;
      type: 'math';
    }
  | {
      type: 'spoiler';
    }
  | {
      type: 'underline';
    };

/**
 * Decodes an inline directive encoded in a markdown link href.
 */
export const parseMarkdownInlineDirective = (href?: string): MarkdownInlineDirective | null => {
  if (!href) return null;

  if (href.startsWith('#md-color:')) {
    return {
      type: 'color',
      value: href.slice('#md-color:'.length),
    };
  }

  if (href.startsWith('#md-bg:')) {
    return {
      type: 'background',
      value: href.slice('#md-bg:'.length),
    };
  }

  if (href.startsWith('#md-style:')) {
    const payload = href.slice('#md-style:'.length);
    const searchParams = new URLSearchParams(payload.replace(/;/g, '&'));
    const color = searchParams.get('color') ?? undefined;
    const background = searchParams.get('background') ?? undefined;

    return {
      background,
      color,
      type: 'style',
    };
  }

  if (href === '#md-spoiler:') {
    return { type: 'spoiler' };
  }

  if (href === '#md-underline:') {
    return { type: 'underline' };
  }

  if (href.startsWith('#md-math:')) {
    try {
      return {
        formula: decodeURIComponent(href.slice('#md-math:'.length)),
        type: 'math',
      };
    } catch {
      return null;
    }
  }

  return null;
};
