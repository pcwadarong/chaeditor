import type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';

export type MarkdownImageViewerLabels = {
  actionBarAriaLabel: string;
  closeAriaLabel: string;
  fitToScreenAriaLabel: string;
  imageViewerAriaLabel?: string;
  locateSourceAriaLabel: string;
  nextAriaLabel: string;
  openAriaLabel: string;
  previousAriaLabel: string;
  selectForFrameAriaLabel: string;
  selectForFrameLabel: string;
  thumbnailListAriaLabel: string;
  zoomInAriaLabel: string;
  zoomOutAriaLabel: string;
};

/**
 * Resolves the final attachment href in the host application.
 */
export type ResolveAttachmentHref = (payload: { fileName: string; href: string }) => string | null;

/**
 * Fetches metadata used by link preview cards.
 */
export type FetchLinkPreviewMeta = (
  url: string,
  signal?: AbortSignal,
) => Promise<LinkEmbedData | null>;

/**
 * Host-level adapters used by the markdown renderer and related UI.
 */
export type MarkdownRendererHostAdapters = {
  fetchLinkPreviewMeta?: FetchLinkPreviewMeta;
  imageViewerLabels?: Partial<MarkdownImageViewerLabels>;
  resolveAttachmentHref?: ResolveAttachmentHref;
};
