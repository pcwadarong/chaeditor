'use client';

import React from 'react';

import type { EditorAttachment } from '@/entities/editor/model/editor-attachment';
import { createMarkdownLinkByMode } from '@/entities/editor/model/markdown-link';
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
import type {
  AlignPopoverRenderProps,
  FileEmbedPopoverRenderProps,
  ImageEmbedPopoverRenderProps,
  LinkEmbedPopoverRenderProps,
  LinkMode,
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarProps,
  MathEmbedPopoverRenderProps,
  TextColorPopoverRenderProps,
  ToolbarActionItem,
  ToolbarCustomItem,
  ToolbarSectionItem,
  VideoEmbedModalRenderProps,
} from '@/features/edit-markdown/model/markdown-toolbar.types';
import {
  createMarkdownToolbarSections,
  createToolbarActionItems,
  createToolbarCustomItem,
  createToolbarTokenOptions,
} from '@/features/edit-markdown/model/markdown-toolbar-composition';
import { resolveMarkdownToolbarUiRegistry } from '@/features/edit-markdown/model/markdown-toolbar-ui-registry';
import {
  CodeBlockIcon,
  DashIcon,
  MarkDownBoldIcon,
  MarkDownItalicIcon,
  MarkDownStrikeIcon,
  MarkDownUnderlineIcon,
  QuoteIcon,
  SpoilerIcon,
  SubtextIcon,
  TableIcon,
} from '@/shared/ui/icons/app-icons';
import type { ClosePopover } from '@/shared/ui/popover/popover';

const tableTemplate = [
  '| Heading1 | Heading2 | Heading3 |',
  '|-------|-------|-------|',
  '| Cell 1   | Cell 2   | Cell 3   |',
].join('\n');

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
    (url: string, mode: LinkMode, closePopover?: ClosePopover) => {
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
    (
      payload: {
        items: Array<{
          altText: string;
          url: string;
        }>;
        mode: 'gallery' | 'individual';
      },
      closePopover?: ClosePopover,
    ) => {
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
    (attachment: EditorAttachment, closePopover?: ClosePopover) => {
      applyTemplate(createAttachmentEmbedMarkdown(attachment));
      closePopover?.({ restoreFocus: false });
    },
    [applyTemplate],
  );

  const handleMathApply = React.useCallback(
    (formula: string, isBlock: boolean, closePopover?: ClosePopover) => {
      applyTemplate(
        createMathEmbedMarkdown({
          formula,
          isBlock,
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
    (
      payload: {
        provider: 'upload' | 'youtube';
        src?: string;
        videoId?: string;
      },
      closePopover?: ClosePopover,
    ) => {
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
    () => [
      { key: 'heading-1', label: 'Heading 1', onClick: () => applyHeading(1), token: 'H1' },
      { key: 'heading-2', label: 'Heading 2', onClick: () => applyHeading(2), token: 'H2' },
      { key: 'heading-3', label: 'Heading 3', onClick: () => applyHeading(3), token: 'H3' },
      { key: 'heading-4', label: 'Heading 4', onClick: () => applyHeading(4), token: 'H4' },
    ],
    [applyHeading],
  );

  const headingPopoverOptions = React.useMemo(
    () => createToolbarTokenOptions(headingActions),
    [headingActions],
  );

  const inlineFormatActions = React.useMemo<ToolbarActionItem[]>(
    () => [
      {
        icon: <MarkDownBoldIcon aria-hidden color="text" size="sm" />,
        key: 'bold',
        label: 'Bold',
        onClick: () => applyWrap('**', '**', 'Bold'),
      },
      {
        icon: <MarkDownItalicIcon aria-hidden color="text" size="sm" />,
        key: 'italic',
        label: 'Italic',
        onClick: () => applyWrap('*', '*', 'Italic'),
      },
      {
        icon: <MarkDownStrikeIcon aria-hidden color="text" size="sm" />,
        key: 'strike',
        label: 'Strikethrough',
        onClick: () => applyWrap('~~', '~~', 'Strikethrough'),
      },
      {
        icon: <MarkDownUnderlineIcon aria-hidden color="text" size="sm" />,
        key: 'underline',
        label: 'Underline',
        onClick: () => applyWrap('<u>', '</u>', 'Underline'),
      },
    ],
    [applyWrap],
  );

  const textStructureActions = React.useMemo<ToolbarActionItem[]>(
    () => [
      {
        icon: <SubtextIcon aria-hidden color="text" size="sm" />,
        key: 'subtext',
        label: 'Subtext',
        onClick: () => applyPrefix('-# '),
      },
    ],
    [applyPrefix],
  );

  const blockSyntaxActions = React.useMemo<ToolbarActionItem[]>(
    () => [
      {
        icon: <DashIcon aria-hidden color="text" size="sm" />,
        key: 'horizontal-rule',
        label: 'Divider',
        onClick: () => applyTemplate('\n---\n'),
      },
      {
        icon: <QuoteIcon aria-hidden color="text" size="sm" />,
        key: 'quote',
        label: 'Quote',
        onClick: () => applyPrefix('> '),
      },
      {
        icon: <CodeBlockIcon aria-hidden color="text" size="sm" />,
        key: 'code-block',
        label: 'Code block',
        onClick: () => applyWrap('```ts\n', '\n```', 'Enter code here'),
      },
      {
        icon: <TableIcon aria-hidden color="text" size="sm" />,
        key: 'table',
        label: 'Table',
        onClick: () => applyTemplate(tableTemplate, 2),
      },
      {
        icon: <SpoilerIcon aria-hidden color="text" size="sm" />,
        key: 'spoiler',
        label: 'Spoiler',
        onClick: () => applyWrap('||', '||', 'Spoiler'),
      },
    ],
    [applyPrefix, applyTemplate, applyWrap],
  );

  const toggleActions = React.useMemo<ToolbarActionItem[]>(
    () => [
      {
        key: 'toggle-1',
        label: 'Toggle Heading 1',
        onClick: () => handleToggleApply(1),
        token: 'T1',
      },
      {
        key: 'toggle-2',
        label: 'Toggle Heading 2',
        onClick: () => handleToggleApply(2),
        token: 'T2',
      },
      {
        key: 'toggle-3',
        label: 'Toggle Heading 3',
        onClick: () => handleToggleApply(3),
        token: 'T3',
      },
      {
        key: 'toggle-4',
        label: 'Toggle Heading 4',
        onClick: () => handleToggleApply(4),
        token: 'T4',
      },
    ],
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
    () => [
      createToolbarCustomItem(
        'text-color',
        toolbarUiRegistry.renderTextColorPopover({
          labels: toolbarLabels?.textColorPopover,
          onApply: handleTextColorApply,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies TextColorPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'background-color',
        toolbarUiRegistry.renderBackgroundColorPopover({
          labels: toolbarLabels?.backgroundColorPopover,
          onApply: handleBackgroundColorApply,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies TextColorPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'align',
        toolbarUiRegistry.renderAlignPopover({
          onApply: handleAlignApply,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies AlignPopoverRenderProps),
      ),
    ],
    [
      handleAlignApply,
      handleBackgroundColorApply,
      handleTextColorApply,
      popoverTriggerClassName,
      toolbarLabels?.backgroundColorPopover,
      toolbarLabels?.textColorPopover,
      toolbarUiRegistry,
    ],
  );

  const embedItems = React.useMemo<ToolbarCustomItem[]>(
    () => [
      createToolbarCustomItem(
        'math-embed',
        toolbarUiRegistry.renderMathEmbedPopover({
          onApply: handleMathApply,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies MathEmbedPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'file-embed',
        toolbarUiRegistry.renderFileEmbedPopover({
          contentType,
          onApply: handleAttachmentApply,
          onUploadFile: adapters?.uploadFile,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies FileEmbedPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'image-embed',
        toolbarUiRegistry.renderImageEmbedPopover({
          contentType,
          onApply: handleImageApply,
          renderImage: adapters?.renderImage,
          onUploadImage: adapters?.uploadImage,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies ImageEmbedPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'link-embed',
        toolbarUiRegistry.renderLinkEmbedPopover({
          labels: toolbarLabels?.linkEmbedPopover,
          onApply: handleLinkApply,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies LinkEmbedPopoverRenderProps),
      ),
      createToolbarCustomItem(
        'video-embed',
        toolbarUiRegistry.renderVideoEmbedModal({
          contentType,
          onApply: handleVideoApply,
          onUploadVideo: adapters?.uploadVideo,
          onTriggerMouseDown: event => event.preventDefault(),
          triggerClassName: popoverTriggerClassName,
        } satisfies VideoEmbedModalRenderProps),
      ),
    ],
    [
      adapters?.uploadFile,
      adapters?.renderImage,
      adapters?.uploadImage,
      adapters?.uploadVideo,
      contentType,
      handleAttachmentApply,
      handleImageApply,
      handleLinkApply,
      handleMathApply,
      handleVideoApply,
      popoverTriggerClassName,
      toolbarLabels?.linkEmbedPopover,
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
