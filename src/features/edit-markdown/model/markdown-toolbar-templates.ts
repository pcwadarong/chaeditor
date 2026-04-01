const escapeMarkdownAltText = (value: string) => value.replaceAll(']', '\\]');

/**
 * Escapes a markdown link destination so it stays valid inside inline markdown syntax.
 *
 * @param value Raw link destination.
 * @returns A normalized link destination string.
 */
const escapeMarkdownLinkDestination = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('<', '%3C')
    .replaceAll('>', '%3E');

const normalizeMathFormula = (value: string) => value.trim().replaceAll(/\s*\n+\s*/g, ' ');
const escapeJsxAttribute = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export {
  createUploadedVideoEmbedMarkdown,
  createVideoEmbedMarkdown,
  createYoutubeEmbedMarkdown,
  extractVideoEmbedReference,
  extractYoutubeId,
} from '@/entities/editor-core/model/video-embed';

/**
 * Builds markdown image syntax for a single image.
 *
 * @param altText Image alt text.
 * @param url Image URL.
 * @returns A markdown image string.
 */
export const createImageEmbedMarkdown = (altText: string, url: string) =>
  `![${escapeMarkdownAltText(altText)}](${escapeMarkdownLinkDestination(url)})`;

/**
 * Builds multiple standalone markdown image blocks.
 *
 * @param items Image entries.
 * @returns Markdown image blocks joined by blank lines.
 */
export const createImageEmbedMarkdownGroup = (items: Array<{ altText: string; url: string }>) =>
  items.map(item => createImageEmbedMarkdown(item.altText, item.url)).join('\n\n');

/**
 * Builds a gallery block from multiple image entries.
 *
 * @param items Image entries for the gallery.
 * @returns A gallery block string.
 */
export const createImageGalleryMarkdown = (items: Array<{ altText: string; url: string }>) =>
  [
    ':::gallery',
    ...items.map(item => createImageEmbedMarkdown(item.altText, item.url)),
    ':::',
  ].join('\n');

/**
 * Builds the custom Attachment markdown tag.
 *
 * @param contentType Attachment MIME type.
 * @param fileName Attachment file name.
 * @param fileSize Attachment size in bytes.
 * @param url Attachment URL.
 * @returns A custom Attachment markdown string.
 */
export const createAttachmentEmbedMarkdown = ({
  contentType,
  fileName,
  fileSize,
  url,
}: {
  contentType: string;
  fileName: string;
  fileSize: number;
  url: string;
}) =>
  `<Attachment href="${escapeJsxAttribute(url)}" name="${escapeJsxAttribute(fileName)}" size="${String(fileSize)}" type="${escapeJsxAttribute(contentType)}" />`;

/**
 * Builds the custom Math markdown tag.
 *
 * @param formula LaTeX formula string.
 * @param isBlock Whether the formula should be rendered as a block.
 * @returns A custom Math markdown string.
 */
export const createMathEmbedMarkdown = ({
  formula,
  isBlock,
}: {
  formula: string;
  isBlock: boolean;
}) => {
  const normalizedFormula = normalizeMathFormula(formula);
  if (isBlock) {
    return `\n<Math block="true">${normalizedFormula}</Math>\n`;
  }

  return `<Math>${normalizedFormula}</Math>`;
};

/**
 * Builds an align block template and its default cursor position.
 *
 * @param align Alignment direction.
 * @returns The align block text and cursor offset.
 */
export const createAlignBlockMarkdown = (align: 'center' | 'left' | 'right') => {
  const before = `:::align ${align}\n`;

  return {
    cursorOffset: before.length,
    text: `${before}Text\n:::`,
  };
};

/**
 * Builds a toggle block template and its default cursor position.
 *
 * @param level Heading level used in the toggle title.
 * @param selectedText Selected title text.
 * @returns The toggle block text and cursor offset.
 */
export const createToggleBlockMarkdown = (level: 1 | 2 | 3 | 4, selectedText: string) => {
  const headingPrefix = '#'.repeat(level);

  if (!selectedText) {
    const prefix = `:::toggle ${headingPrefix} `;

    return {
      cursorOffset: prefix.length,
      text: `${prefix}\n:::`,
    };
  }

  return {
    cursorOffset: `:::toggle ${headingPrefix} `.length + selectedText.length,
    text: `:::toggle ${headingPrefix} ${selectedText}\nContent\n:::`,
  };
};
