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
import type {
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarProps,
  ToolbarActionItem,
  ToolbarCustomItem,
  ToolbarSectionItem,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import {
  createMarkdownToolbarSections,
  createToolbarActionItems,
  createToolbarCustomItem,
  createToolbarTokenOptions,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar-composition';
import {
  createBlockSyntaxActions,
  createHeadingActions,
  createInlineFormatActions,
  createTextStructureActions,
  createToggleActions,
} from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-action-groups';
import {
  createEmbedItems,
  createHighlightItems,
} from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-custom-items';
import { resolveMarkdownToolbarUiRegistry } from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-ui-registry';
import type { VideoEmbedApplyPayload } from '@/features/edit-markdown/video';
import type { ClosePopover } from '@/shared/ui/popover/popover';

/**
 * Builds textarea actions and section data for the markdown toolbar.
 */
export const useMarkdownToolbar = ({
  adapters,
  contentType,
  onChange,
  textareaRef,
  uiRegistry,
  popoverTriggerClassName,
}: MarkdownToolbarProps & {
  popoverTriggerClassName: string;
}) => {
  const toolbarLabels = uiRegistry?.labels;
  const toolbarUiRegistry = React.useMemo(
    () => resolveMarkdownToolbarUiRegistry(uiRegistry),
    [uiRegistry],
  );

  /**
   * Returns the current textarea selection without trimming whitespace.
   */
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

  const handleAlignApply = React.useCallback(
    (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => {
      applyAlign(align);
      closePopover?.({ restoreFocus: false });
    },
    [applyAlign],
  );

  const handleLinkApply = React.useCallback(
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

  const handleImageApply = React.useCallback(
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

  const handleAttachmentApply = React.useCallback(
    (attachment: FileEmbedApplyPayload, closePopover?: ClosePopover) => {
      applyTemplate(createAttachmentEmbedMarkdown(attachment));
      closePopover?.({ restoreFocus: false });
    },
    [applyTemplate],
  );

  const handleMathApply = React.useCallback(
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

  const handleTextColorApply = React.useCallback(
    (colorHex: string, closePopover?: ClosePopover) => {
      applyWrap(`<span style="color:${colorHex}">`, '</span>', 'Text');
      closePopover?.({ restoreFocus: false });
    },
    [applyWrap],
  );

  const handleBackgroundColorApply = React.useCallback(
    (colorHex: string, closePopover?: ClosePopover) => {
      applyWrap(`<span style="background-color:${colorHex}">`, '</span>', 'Highlight');
      closePopover?.({ restoreFocus: false });
    },
    [applyWrap],
  );

  const handleVideoApply = React.useCallback(
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

  const handleToggleApply = React.useCallback(
    (level: 1 | 2 | 3 | 4) => {
      if (!textareaRef.current) return;

      const selectedText = getSelectedText();
      const toggleBlock = createToggleBlockMarkdown(level, selectedText);

      applyTemplate(toggleBlock.text, toggleBlock.cursorOffset);
    },
    [applyTemplate, getSelectedText, textareaRef],
  );

  const headingActions = React.useMemo<ToolbarActionItem[]>(
    () => createHeadingActions(applyHeading),
    [applyHeading],
  );

  const headingPopoverOptions = React.useMemo(
    () => createToolbarTokenOptions(headingActions),
    [headingActions],
  );

  const inlineFormatActions = React.useMemo<ToolbarActionItem[]>(
    () => createInlineFormatActions(applyWrap),
    [applyWrap],
  );

  const textStructureActions = React.useMemo<ToolbarActionItem[]>(
    () => createTextStructureActions(applyPrefix),
    [applyPrefix],
  );

  const blockSyntaxActions = React.useMemo<ToolbarActionItem[]>(
    () =>
      createBlockSyntaxActions({
        applyPrefix,
        applyTemplate,
        applyWrap,
      }),
    [applyPrefix, applyTemplate, applyWrap],
  );

  const toggleActions = React.useMemo<ToolbarActionItem[]>(
    () => createToggleActions(handleToggleApply),
    [handleToggleApply],
  );

  const togglePopoverOptions = React.useMemo(
    () => createToolbarTokenOptions(toggleActions),
    [toggleActions],
  );

  /**
   * Resolves the token popover implementation from the host registry or defaults.
   */
  const highlightItems = React.useMemo<ToolbarCustomItem[]>(
    () =>
      createHighlightItems({
        handleAlignApply,
        handleBackgroundColorApply,
        handleTextColorApply,
        labels: toolbarLabels,
        popoverTriggerClassName,
        toolbarUiRegistry,
      }),
    [
      handleAlignApply,
      handleBackgroundColorApply,
      handleTextColorApply,
      popoverTriggerClassName,
      toolbarLabels,
      toolbarUiRegistry,
    ],
  );

  const embedItems = React.useMemo<ToolbarCustomItem[]>(
    () =>
      createEmbedItems({
        adapters,
        contentType,
        handleAttachmentApply,
        handleImageApply,
        handleLinkApply,
        handleMathApply,
        handleVideoApply,
        labels: toolbarLabels,
        popoverTriggerClassName,
        toolbarUiRegistry,
      }),
    [
      adapters,
      contentType,
      handleAttachmentApply,
      handleImageApply,
      handleLinkApply,
      handleMathApply,
      handleVideoApply,
      popoverTriggerClassName,
      toolbarLabels,
      toolbarUiRegistry,
    ],
  );

  const toolbarSections = React.useMemo(
    () =>
      createMarkdownToolbarSections({
        itemRegistry: Object.fromEntries(
          [
            createToolbarCustomItem(
              'heading-popover',
              toolbarUiRegistry.renderHeadingPopover({
                labels: {
                  panelLabel: toolbarLabels?.headingPopover?.panelLabel ?? 'Choose heading level',
                  triggerAriaLabel: toolbarLabels?.headingPopover?.triggerAriaLabel ?? 'Heading',
                  triggerTooltip: toolbarLabels?.headingPopover?.triggerTooltip ?? 'Heading',
                },
                onTriggerMouseDown: event => event.preventDefault(),
                options: headingPopoverOptions,
                triggerClassName: popoverTriggerClassName,
                triggerToken: 'H',
              }),
            ),
            ...createToolbarActionItems(textStructureActions),
            ...createToolbarActionItems(inlineFormatActions),
            ...highlightItems,
            ...createToolbarActionItems(blockSyntaxActions),
            createToolbarCustomItem(
              'toggle-popover',
              toolbarUiRegistry.renderTogglePopover({
                labels: {
                  panelLabel: toolbarLabels?.togglePopover?.panelLabel ?? 'Choose toggle level',
                  triggerAriaLabel: toolbarLabels?.togglePopover?.triggerAriaLabel ?? 'Toggle',
                  triggerTooltip: toolbarLabels?.togglePopover?.triggerTooltip ?? 'Toggle',
                },
                onTriggerMouseDown: event => event.preventDefault(),
                options: togglePopoverOptions,
                triggerClassName: popoverTriggerClassName,
                triggerToken: 'T',
              }),
            ),
            ...embedItems.filter(
              item => item.key !== 'file-embed' || Boolean(adapters?.uploadFile),
            ),
          ].map(item => [item.key as MarkdownToolbarPresetItemKey, item] as const),
        ) as Partial<Record<MarkdownToolbarPresetItemKey, ToolbarSectionItem>>,
      }),
    [
      adapters?.uploadFile,
      blockSyntaxActions,
      embedItems,
      headingPopoverOptions,
      highlightItems,
      inlineFormatActions,
      popoverTriggerClassName,
      textStructureActions,
      toolbarLabels?.headingPopover,
      toolbarLabels?.togglePopover,
      togglePopoverOptions,
      toolbarUiRegistry,
    ],
  );

  return {
    toolbarSections,
  };
};
