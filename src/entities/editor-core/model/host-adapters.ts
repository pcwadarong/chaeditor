import type React from 'react';

import type { EditorAttachment } from '@/entities/editor/model/editor-attachment';
import type { EditorContentType } from '@/entities/editor/model/editor-types';
import type { EditorImageUploadKind } from '@/shared/lib/image/image-upload-kind';
import type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';

export type PreviewImageSource = string | { src: string };

export type HostImageRenderProps = {
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  src: PreviewImageSource;
};

export type HostImageRenderer = (props: HostImageRenderProps) => React.ReactNode;

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
 * Uploads an editor image and returns the final public URL.
 */
export type UploadEditorImage = (payload: {
  contentType: EditorContentType;
  file: File;
  imageKind: EditorImageUploadKind;
}) => Promise<string>;

/**
 * Uploads an editor attachment and returns the uploaded file metadata.
 */
export type UploadEditorFile = (payload: {
  contentType: EditorContentType;
  file: File;
}) => Promise<EditorAttachment>;

/**
 * Uploads an editor video and returns the final public URL.
 */
export type UploadEditorVideo = (payload: {
  contentType: EditorContentType;
  file: File;
  onProgress?: (percentage: number) => void;
  signal?: AbortSignal;
}) => Promise<string>;

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
  renderImage?: HostImageRenderer;
  resolveAttachmentHref?: ResolveAttachmentHref;
};

/**
 * Host-level adapters used by the editor toolbar, embed modals, and renderer.
 */
export type MarkdownEditorHostAdapters = MarkdownRendererHostAdapters & {
  uploadFile?: UploadEditorFile;
  uploadImage?: UploadEditorImage;
  uploadVideo?: UploadEditorVideo;
};
