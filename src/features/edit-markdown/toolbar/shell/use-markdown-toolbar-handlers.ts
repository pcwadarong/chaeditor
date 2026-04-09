'use client';

import React from 'react';

import { createMarkdownLinkByMode } from '@/entities/editor-core';
import {
  createAlignBlockMarkdown,
  createAttachmentEmbedMarkdown,
  createImageEmbedMarkdownGroup,
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  createToggleBlockMarkdown,
  createUploadedVideoEmbedMarkdown,
  createYoutubeEmbedMarkdown,
} from '@/entities/editor-core/model/markdown-templates';
import {
  applyTextareaTransform,
  insertTemplate,
  prefixLine,
  toggleHeadingLine,
  wrapSelection,
} from '@/entities/editor-core/model/selection-utils';
import type { FileEmbedApplyPayload } from '@/features/edit-markdown/file';
import type { ImageEmbedApplyPayload } from '@/features/edit-markdown/image';
import type { LinkEmbedMode } from '@/features/edit-markdown/link';
import type { MathEmbedApplyPayload } from '@/features/edit-markdown/math';
import type { VideoEmbedApplyPayload } from '@/features/edit-markdown/video';
import type { ClosePopover } from '@/shared/ui/popover/popover';

type ToolbarTextareaArgs = {
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
};

type ToolbarEditingHelpers = ToolbarTextareaArgs & {
  applyHeading: (level: 1 | 2 | 3 | 4) => void;
  applyPrefix: (prefix: string) => void;
  applyTemplate: (template: string, cursorOffset?: number) => void;
  applyTextTransform: (transform: (textarea: HTMLTextAreaElement) => string) => void;
  applyWrap: (before: string, after: string, placeholder?: string) => void;
  getSelectedText: () => string;
};

/**
 * Builds textarea editing helpers shared by toolbar handlers and action groups.
 */
export const useMarkdownToolbarEditingHelpers = ({
  onChange,
  textareaRef,
}: ToolbarTextareaArgs): ToolbarEditingHelpers => {
  const getSelectedText = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return '';

    return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  }, [textareaRef]);

  const applyTextTransform = React.useCallback(
    (transform: (textarea: HTMLTextAreaElement) => string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      applyTextareaTransform(textarea, onChange, transform);
    },
    [onChange, textareaRef],
  );

  const applyTemplate = React.useCallback(
    (template: string, cursorOffset?: number) => {
      applyTextTransform(textarea => insertTemplate(textarea, template, cursorOffset));
    },
    [applyTextTransform],
  );

  const applyWrap = React.useCallback(
    (before: string, after: string, placeholder?: string) => {
      applyTextTransform(textarea => wrapSelection(textarea, before, after, placeholder));
    },
    [applyTextTransform],
  );

  const applyPrefix = React.useCallback(
    (prefix: string) => {
      applyTextTransform(textarea => prefixLine(textarea, prefix));
    },
    [applyTextTransform],
  );

  const applyHeading = React.useCallback(
    (level: 1 | 2 | 3 | 4) => {
      applyTextTransform(textarea => toggleHeadingLine(textarea, level));
    },
    [applyTextTransform],
  );

  return {
    applyHeading,
    applyPrefix,
    applyTemplate,
    applyTextTransform,
    applyWrap,
    getSelectedText,
    onChange,
    textareaRef,
  };
};

/**
 * Applies aligned block markdown from the toolbar.
 */
export const useAlignHandler = ({
  applyTemplate,
  applyWrap,
  getSelectedText,
}: Pick<ToolbarEditingHelpers, 'applyTemplate' | 'applyWrap' | 'getSelectedText'>) => {
  const applyAlign = React.useCallback(
    (align: 'center' | 'left' | 'right') => {
      const selectedText = getSelectedText();

      if (selectedText) {
        applyWrap(`:::align ${align}\n`, '\n:::', 'Text');
        return;
      }

      const alignBlock = createAlignBlockMarkdown(align);

      applyTemplate(alignBlock.text, alignBlock.cursorOffset);
    },
    [applyTemplate, applyWrap, getSelectedText],
  );

  return React.useCallback(
    (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => {
      applyAlign(align);
      closePopover?.({ restoreFocus: false });
    },
    [applyAlign],
  );
};

/**
 * Applies link markdown from the toolbar.
 */
export const useLinkHandler = ({
  applyTextTransform,
  getSelectedText,
}: Pick<ToolbarEditingHelpers, 'applyTextTransform' | 'getSelectedText'>) =>
  React.useCallback(
    (url: string, mode: LinkEmbedMode, closePopover?: ClosePopover) => {
      const selectedText = getSelectedText();
      const nextValue = createMarkdownLinkByMode({
        label: selectedText || url,
        mode,
        url,
      });

      applyTextTransform(currentTextarea =>
        insertTemplate(currentTextarea, nextValue, nextValue.length),
      );
      closePopover?.({ restoreFocus: false });
    },
    [applyTextTransform, getSelectedText],
  );

/**
 * Applies image markdown from the toolbar.
 */
export const useImageHandler = ({
  applyTextTransform,
}: Pick<ToolbarEditingHelpers, 'applyTextTransform'>) =>
  React.useCallback(
    (payload: ImageEmbedApplyPayload, closePopover?: ClosePopover) => {
      if (!payload?.items || payload.items.length === 0) {
        closePopover?.({ restoreFocus: false });
        return;
      }

      const nextValue =
        payload.mode === 'gallery'
          ? createImageGalleryMarkdown(payload.items)
          : createImageEmbedMarkdownGroup(payload.items);

      applyTextTransform(currentTextarea =>
        insertTemplate(currentTextarea, nextValue, nextValue.length),
      );
      closePopover?.({ restoreFocus: false });
    },
    [applyTextTransform],
  );

/**
 * Applies file attachment markdown from the toolbar.
 */
export const useAttachmentHandler = ({
  applyTemplate,
}: Pick<ToolbarEditingHelpers, 'applyTemplate'>) =>
  React.useCallback(
    (attachment: FileEmbedApplyPayload, closePopover?: ClosePopover) => {
      applyTemplate(createAttachmentEmbedMarkdown(attachment));
      closePopover?.({ restoreFocus: false });
    },
    [applyTemplate],
  );

/**
 * Applies math markdown from the toolbar.
 */
export const useMathHandler = ({ applyTemplate }: Pick<ToolbarEditingHelpers, 'applyTemplate'>) =>
  React.useCallback(
    (payload: MathEmbedApplyPayload, closePopover?: ClosePopover) => {
      applyTemplate(
        createMathEmbedMarkdown({
          formula: payload.formula,
          isBlock: payload.isBlock,
        }),
      );
      closePopover?.({ restoreFocus: false });
    },
    [applyTemplate],
  );

/**
 * Applies inline text color markup from the toolbar.
 */
export const useTextColorHandler = ({ applyWrap }: Pick<ToolbarEditingHelpers, 'applyWrap'>) =>
  React.useCallback(
    (colorHex: string, closePopover?: ClosePopover) => {
      applyWrap(`<span style="color:${colorHex}">`, '</span>', 'Text');
      closePopover?.({ restoreFocus: false });
    },
    [applyWrap],
  );

/**
 * Applies inline background color markup from the toolbar.
 */
export const useBackgroundColorHandler = ({
  applyWrap,
}: Pick<ToolbarEditingHelpers, 'applyWrap'>) =>
  React.useCallback(
    (colorHex: string, closePopover?: ClosePopover) => {
      applyWrap(`<span style="background-color:${colorHex}">`, '</span>', 'Highlight');
      closePopover?.({ restoreFocus: false });
    },
    [applyWrap],
  );

/**
 * Applies uploaded or YouTube video markdown from the toolbar.
 */
export const useVideoHandler = ({ applyTemplate }: Pick<ToolbarEditingHelpers, 'applyTemplate'>) =>
  React.useCallback(
    (payload: VideoEmbedApplyPayload, closePopover?: ClosePopover) => {
      if (payload.provider === 'upload') {
        if (!payload.src) return;

        applyTemplate(createUploadedVideoEmbedMarkdown(payload.src));
        closePopover?.({ restoreFocus: false });
        return;
      }

      if (!payload.videoId) return;

      applyTemplate(createYoutubeEmbedMarkdown(payload.videoId));
      closePopover?.({ restoreFocus: false });
    },
    [applyTemplate],
  );

/**
 * Applies toggle block markdown from the toolbar.
 */
export const useToggleHandler = ({
  applyTemplate,
  getSelectedText,
  textareaRef,
}: Pick<ToolbarEditingHelpers, 'applyTemplate' | 'getSelectedText' | 'textareaRef'>) =>
  React.useCallback(
    (level: 1 | 2 | 3 | 4) => {
      if (!textareaRef.current) return;

      const selectedText = getSelectedText();
      const toggleBlock = createToggleBlockMarkdown(level, selectedText);

      applyTemplate(toggleBlock.text, toggleBlock.cursorOffset);
    },
    [applyTemplate, getSelectedText, textareaRef],
  );
