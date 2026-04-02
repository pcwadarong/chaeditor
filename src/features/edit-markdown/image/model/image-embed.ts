/**
 * Represents a single image item selected for markdown insertion.
 */
export type ImageEmbedItem = {
  altText: string;
  url: string;
};

/**
 * Describes the image insertion payload produced by the image embed modal.
 */
export type ImageEmbedApplyPayload = {
  items: ImageEmbedItem[];
  mode: 'gallery' | 'individual';
};
