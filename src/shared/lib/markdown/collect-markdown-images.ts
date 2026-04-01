export type MarkdownImageViewerItem = {
  alt: string;
  src: string;
  viewerId: string;
};

const markdownImagePattern =
  /!\[(?<alt>[^\]]*)\]\((?<src>[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/g;
const galleryStartPattern = /^:::gallery\s*$/;
const galleryEndPattern = /^:::\s*$/;

/**
 * Collects markdown image nodes into a viewer-friendly item list.
 */
export const collectMarkdownImages = (markdown: string): MarkdownImageViewerItem[] => {
  const items: MarkdownImageViewerItem[] = [];
  let imageIndex = 0;
  let isInsideGallery = false;

  for (const line of markdown.split('\n')) {
    if (galleryStartPattern.test(line)) {
      isInsideGallery = true;
      continue;
    }

    if (isInsideGallery && galleryEndPattern.test(line)) {
      isInsideGallery = false;
      continue;
    }

    if (isInsideGallery) continue;

    for (const matched of line.matchAll(markdownImagePattern)) {
      const alt = matched.groups?.alt?.trim() ?? '';
      const src = matched.groups?.src?.trim() ?? '';

      if (!src) continue;

      items.push({
        alt,
        src,
        viewerId: `markdown-image-${imageIndex}`,
      });
      imageIndex += 1;
    }
  }

  return items;
};
