'use client';

import React from 'react';

import type {
  MarkdownToolbarProps,
  ToolbarActionItem,
  ToolbarCustomItem,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import {
  createMarkdownToolbarSections,
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
import { createMarkdownToolbarItemRegistry } from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-item-registry';
import { resolveMarkdownToolbarUiRegistry } from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-ui-registry';
import {
  useAlignHandler,
  useAttachmentHandler,
  useBackgroundColorHandler,
  useImageHandler,
  useLinkHandler,
  useMarkdownToolbarEditingHelpers,
  useMathHandler,
  useTextColorHandler,
  useToggleHandler,
  useVideoHandler,
} from '@/features/edit-markdown/toolbar/shell/use-markdown-toolbar-handlers';

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
  const {
    applyHeading,
    applyPrefix,
    applyTemplate,
    applyTextTransform,
    applyWrap,
    getSelectedText,
  } = useMarkdownToolbarEditingHelpers({
    onChange,
    textareaRef,
  });
  const handleAlignApply = useAlignHandler({
    applyTemplate,
    applyWrap,
    getSelectedText,
  });
  const handleLinkApply = useLinkHandler({
    applyTextTransform,
    getSelectedText,
  });
  const handleImageApply = useImageHandler({
    applyTextTransform,
  });
  const handleAttachmentApply = useAttachmentHandler({
    applyTemplate,
  });
  const handleMathApply = useMathHandler({
    applyTemplate,
  });
  const handleTextColorApply = useTextColorHandler({
    applyWrap,
  });
  const handleBackgroundColorApply = useBackgroundColorHandler({
    applyWrap,
  });
  const handleVideoApply = useVideoHandler({
    applyTemplate,
  });
  const handleToggleApply = useToggleHandler({
    applyTemplate,
    getSelectedText,
    textareaRef,
  });

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
        itemRegistry: createMarkdownToolbarItemRegistry({
          adapters,
          blockSyntaxActions,
          embedItems,
          headingPopoverOptions,
          highlightItems,
          inlineFormatActions,
          popoverTriggerClassName,
          textStructureActions,
          togglePopoverOptions,
          toolbarLabels,
          toolbarUiRegistry,
        }),
      }),
    [
      adapters,
      blockSyntaxActions,
      embedItems,
      headingPopoverOptions,
      highlightItems,
      inlineFormatActions,
      popoverTriggerClassName,
      textStructureActions,
      toolbarLabels,
      togglePopoverOptions,
      toolbarUiRegistry,
    ],
  );

  return {
    toolbarSections,
  };
};
