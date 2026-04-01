import React from 'react';

import type { MarkdownRendererHostAdapters, MarkdownSegment } from '@/entities/editor-core';
import { MarkdownAttachment } from '@/shared/ui/markdown/markdown-attachment';
import { MarkdownGallery } from '@/shared/ui/markdown/markdown-gallery';
import { MarkdownMath } from '@/shared/ui/markdown/markdown-math';
import { MarkdownVideo } from '@/shared/ui/markdown/markdown-video';

type RichMarkdownCustomSegment = Extract<
  MarkdownSegment,
  { type: 'attachment' | 'gallery' | 'math' | 'video' }
>;

export type RichMarkdownSegmentRendererArgs<TSegment extends RichMarkdownCustomSegment> = {
  key: string;
  segment: TSegment;
};

export type RichMarkdownRendererRegistry = {
  attachment: (
    args: RichMarkdownSegmentRendererArgs<Extract<MarkdownSegment, { type: 'attachment' }>>,
  ) => React.ReactNode;
  gallery: (
    args: RichMarkdownSegmentRendererArgs<Extract<MarkdownSegment, { type: 'gallery' }>>,
  ) => React.ReactNode;
  math: (
    args: RichMarkdownSegmentRendererArgs<Extract<MarkdownSegment, { type: 'math' }>>,
  ) => React.ReactNode;
  video: (
    args: RichMarkdownSegmentRendererArgs<Extract<MarkdownSegment, { type: 'video' }>>,
  ) => React.ReactNode;
};

export type PartialRichMarkdownRendererRegistry = Partial<RichMarkdownRendererRegistry>;

/**
 * Returns the default custom segment renderers for rich markdown content.
 *
 * @returns The default renderer registry.
 */
export const createDefaultRichMarkdownRendererRegistry = (
  adapters?: MarkdownRendererHostAdapters,
): RichMarkdownRendererRegistry => ({
  attachment: ({ key, segment }) => (
    <MarkdownAttachment
      contentType={segment.contentType}
      fileName={segment.fileName}
      fileSize={segment.fileSize}
      href={segment.href}
      key={key}
      resolveAttachmentHref={adapters?.resolveAttachmentHref}
    />
  ),
  gallery: ({ key, segment }) => (
    <MarkdownGallery galleryId={key} items={segment.items} key={key} />
  ),
  math: ({ key, segment }) => (
    <MarkdownMath formula={segment.formula} isBlock={segment.isBlock} key={key} />
  ),
  video: ({ key, segment }) => (
    <MarkdownVideo
      key={key}
      provider={segment.provider}
      src={segment.src}
      videoId={segment.videoId}
    />
  ),
});

/**
 * Merges the default rich-markdown renderers with host overrides.
 *
 * @param overrides Partial renderer overrides from the host app.
 * @returns The merged renderer registry.
 */
export const createRichMarkdownRendererRegistry = (
  overrides?: PartialRichMarkdownRendererRegistry,
  adapters?: MarkdownRendererHostAdapters,
): RichMarkdownRendererRegistry => ({
  ...createDefaultRichMarkdownRendererRegistry(adapters),
  ...overrides,
});
