import { normalizeHttpUrl } from '@/shared/lib/url/normalize-http-url';

export type EditorLinkMode = 'card' | 'embed' | 'link' | 'preview';

type BuildEditorLinkInsertionInput = {
  clipboardText: string;
  selectedText: string;
};

type EditorLinkInsertion = {
  text: string;
  type: 'link';
};

type CreateMarkdownLinkByModeInput = {
  label: string;
  mode: EditorLinkMode;
  url: string;
};

/**
 * Combines selected text and a URL into markdown link syntax.
 */
export const createMarkdownLink = (label: string, url: string, title?: string) => {
  const normalizedUrl = normalizeHttpUrl(url);
  const normalizedLabel = label.trim();

  if (!normalizedUrl) {
    return normalizedLabel ? label : url.trim();
  }

  const resolvedLabel = normalizedLabel ? label : normalizedUrl;
  // Escape characters that would otherwise break the link syntax. Backslash is
  // escaped alongside the brackets/quotes (in one pass) so a label or title that
  // already contains a backslash is not mis-escaped.
  const escapedLabel = resolvedLabel.replace(/([\\[\]])/gu, '\\$1');
  const destination = /[()\s]/u.test(normalizedUrl) ? `<${normalizedUrl}>` : normalizedUrl;
  const serializedTitle = title ? ` "${title.replace(/([\\"])/gu, '\\$1')}"` : '';

  return `[${escapedLabel}](${destination}${serializedTitle})`;
};

/**
 * Creates markdown link syntax for the selected editor link mode.
 */
export const createMarkdownLinkByMode = ({ label, mode, url }: CreateMarkdownLinkByModeInput) => {
  if (mode === 'embed') {
    const normalizedUrl = normalizeHttpUrl(url);

    if (!normalizedUrl) {
      return label.trim() || url.trim();
    }

    return `[embed](${normalizedUrl})`;
  }

  if (mode === 'preview' || mode === 'card') {
    return createMarkdownLink(label, url, mode);
  }

  return createMarkdownLink(label, url);
};

/**
 * Extracts markdown link data from a pasted "text + URL" value.
 */
const extractLabelAndUrl = (clipboardText: string) => {
  const match = clipboardText.trim().match(/^(?<label>.+?)\s+(?<url>https?:\/\/\S+)$/u);
  const label = match?.groups?.label?.trim() ?? '';
  const url = normalizeHttpUrl(match?.groups?.url);

  if (!label || !url) return null;

  return { label, url };
};

/**
 * Resolves markdown insertion text from clipboard input and the current selection.
 */
export const buildEditorLinkInsertion = ({
  clipboardText,
  selectedText,
}: BuildEditorLinkInsertionInput): EditorLinkInsertion | null => {
  const normalizedUrl = normalizeHttpUrl(clipboardText);
  const hasSelectedText = selectedText.trim().length > 0;

  if (normalizedUrl && hasSelectedText) {
    return {
      text: createMarkdownLink(selectedText, normalizedUrl),
      type: 'link',
    };
  }

  if (normalizedUrl) {
    return {
      text: createMarkdownLink(normalizedUrl, normalizedUrl),
      type: 'link',
    };
  }

  const extracted = extractLabelAndUrl(clipboardText);
  if (!extracted) return null;

  return {
    text: createMarkdownLink(extracted.label, extracted.url),
    type: 'link',
  };
};
