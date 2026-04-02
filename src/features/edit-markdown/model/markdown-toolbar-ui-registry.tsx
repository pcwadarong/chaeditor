'use client';

import React from 'react';

import type {
  AlignPopoverRenderProps,
  FileEmbedPopoverRenderProps,
  ImageEmbedModalRenderProps,
  LinkEmbedPopoverRenderProps,
  MarkdownToolbarPopoverRegistry,
  MarkdownToolbarUiRegistry,
  MathEmbedPopoverRenderProps,
  TextColorPopoverRenderProps,
  VideoEmbedModalRenderProps,
} from '@/features/edit-markdown/model/markdown-toolbar.types';
import { AlignPopover } from '@/features/edit-markdown/ui/align-popover';
import { FileEmbedPopover } from '@/features/edit-markdown/ui/file-embed-popover';
import { ImageEmbedModal } from '@/features/edit-markdown/ui/image-embed-modal';
import { LinkEmbedPopover } from '@/features/edit-markdown/ui/link-embed-popover';
import { MathEmbedPopover } from '@/features/edit-markdown/ui/math-embed-popover';
import { TextBackgroundColorPopover } from '@/features/edit-markdown/ui/text-background-color-popover';
import { TextColorPopover } from '@/features/edit-markdown/ui/text-color-popover';
import { ToolbarTokenPopover } from '@/features/edit-markdown/ui/toolbar-token-popover';
import { VideoEmbedModal } from '@/features/edit-markdown/ui/video-embed-modal';

type ResolvedMarkdownToolbarUiRegistry = {
  renderAlignPopover: (props: AlignPopoverRenderProps) => React.ReactNode;
  renderBackgroundColorPopover: (props: TextColorPopoverRenderProps) => React.ReactNode;
  renderFileEmbedPopover: (props: FileEmbedPopoverRenderProps) => React.ReactNode;
  renderHeadingPopover: (
    props: React.ComponentProps<typeof ToolbarTokenPopover>,
  ) => React.ReactNode;
  renderImageEmbedModal: (props: ImageEmbedModalRenderProps) => React.ReactNode;
  renderLinkEmbedPopover: (props: LinkEmbedPopoverRenderProps) => React.ReactNode;
  renderMathEmbedPopover: (props: MathEmbedPopoverRenderProps) => React.ReactNode;
  renderTextColorPopover: (props: TextColorPopoverRenderProps) => React.ReactNode;
  renderTogglePopover: (props: React.ComponentProps<typeof ToolbarTokenPopover>) => React.ReactNode;
  renderVideoEmbedModal: (props: VideoEmbedModalRenderProps) => React.ReactNode;
};

/**
 * Creates the built-in toolbar UI registry used by the editor package.
 */
export const createDefaultMarkdownToolbarUiRegistry = (): MarkdownToolbarPopoverRegistry => ({
  alignPopover: props => <AlignPopover {...props} />,
  backgroundColorPopover: props => <TextBackgroundColorPopover {...props} />,
  fileEmbedPopover: props => <FileEmbedPopover {...props} />,
  headingPopover: props => <ToolbarTokenPopover {...props} />,
  imageEmbedModal: props => <ImageEmbedModal {...props} />,
  linkEmbedPopover: props => <LinkEmbedPopover {...props} />,
  mathEmbedPopover: props => <MathEmbedPopover {...props} />,
  textColorPopover: props => <TextColorPopover {...props} />,
  togglePopover: props => <ToolbarTokenPopover {...props} />,
  videoEmbedModal: props => <VideoEmbedModal {...props} />,
});

/**
 * Resolves the toolbar UI registry by merging host overrides with built-in implementations.
 */
export const resolveMarkdownToolbarUiRegistry = (
  uiRegistry?: MarkdownToolbarUiRegistry,
): ResolvedMarkdownToolbarUiRegistry => {
  const defaultRegistry = createDefaultMarkdownToolbarUiRegistry();
  const hostRegistry = uiRegistry?.popovers;

  return {
    renderAlignPopover: props =>
      (hostRegistry?.alignPopover ?? defaultRegistry.alignPopover)?.(props),
    renderBackgroundColorPopover: props =>
      (hostRegistry?.backgroundColorPopover ?? defaultRegistry.backgroundColorPopover)?.(props),
    renderFileEmbedPopover: props =>
      (hostRegistry?.fileEmbedPopover ?? defaultRegistry.fileEmbedPopover)?.(props),
    renderHeadingPopover: props =>
      (hostRegistry?.headingPopover ?? defaultRegistry.headingPopover)?.(props),
    renderImageEmbedModal: props =>
      (hostRegistry?.imageEmbedModal ?? defaultRegistry.imageEmbedModal)?.(props),
    renderLinkEmbedPopover: props =>
      (hostRegistry?.linkEmbedPopover ?? defaultRegistry.linkEmbedPopover)?.(props),
    renderMathEmbedPopover: props =>
      (hostRegistry?.mathEmbedPopover ?? defaultRegistry.mathEmbedPopover)?.(props),
    renderTextColorPopover: props =>
      (hostRegistry?.textColorPopover ?? defaultRegistry.textColorPopover)?.(props),
    renderTogglePopover: props =>
      (hostRegistry?.togglePopover ?? defaultRegistry.togglePopover)?.(props),
    renderVideoEmbedModal: props =>
      (hostRegistry?.videoEmbedModal ?? defaultRegistry.videoEmbedModal)?.(props),
  };
};
