import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import type { FileEmbedApplyPayload } from '@/features/edit-markdown/file';
import type { ImageEmbedApplyPayload } from '@/features/edit-markdown/image';
import type { LinkEmbedMode } from '@/features/edit-markdown/link';
import type { MathEmbedApplyPayload } from '@/features/edit-markdown/math';
import type {
  AlignPopoverRenderProps,
  FileEmbedPopoverRenderProps,
  ImageEmbedModalRenderProps,
  LinkEmbedPopoverRenderProps,
  MarkdownToolbarUiLabels,
  MathEmbedPopoverRenderProps,
  TextColorPopoverRenderProps,
  ToolbarCustomItem,
  VideoEmbedModalRenderProps,
} from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import { createToolbarCustomItem } from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar-composition';
import type { ResolvedMarkdownToolbarUiRegistry } from '@/features/edit-markdown/toolbar/shell/markdown-toolbar-ui-registry';
import type { VideoEmbedApplyPayload } from '@/features/edit-markdown/video';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import type { MarkdownEditorHostAdapters } from '@/widgets/editor';

type TriggerMouseDown = React.MouseEventHandler<HTMLButtonElement>;

/**
 * Builds the highlight and alignment custom toolbar items.
 */
export const createHighlightItems = ({
  handleAlignApply,
  handleBackgroundColorApply,
  handleTextColorApply,
  labels,
  popoverTriggerClassName,
  toolbarUiRegistry,
}: {
  handleAlignApply: (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => void;
  handleBackgroundColorApply: (colorHex: string, closePopover?: ClosePopover) => void;
  handleTextColorApply: (colorHex: string, closePopover?: ClosePopover) => void;
  labels?: MarkdownToolbarUiLabels;
  popoverTriggerClassName: string;
  toolbarUiRegistry: ResolvedMarkdownToolbarUiRegistry;
}): ToolbarCustomItem[] => {
  const onTriggerMouseDown: TriggerMouseDown = event => event.preventDefault();

  return [
    createToolbarCustomItem(
      'text-color',
      toolbarUiRegistry.renderTextColorPopover({
        labels: labels?.textColorPopover,
        onApply: handleTextColorApply,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies TextColorPopoverRenderProps),
    ),
    createToolbarCustomItem(
      'background-color',
      toolbarUiRegistry.renderBackgroundColorPopover({
        labels: labels?.backgroundColorPopover,
        onApply: handleBackgroundColorApply,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies TextColorPopoverRenderProps),
    ),
    createToolbarCustomItem(
      'align',
      toolbarUiRegistry.renderAlignPopover({
        onApply: handleAlignApply,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies AlignPopoverRenderProps),
    ),
  ];
};

/**
 * Builds the embed-related custom toolbar items.
 */
export const createEmbedItems = ({
  adapters,
  contentType,
  handleAttachmentApply,
  handleImageApply,
  handleLinkApply,
  handleMathApply,
  handleVideoApply,
  labels,
  popoverTriggerClassName,
  toolbarUiRegistry,
}: {
  adapters?: MarkdownEditorHostAdapters;
  contentType: EditorContentType;
  handleAttachmentApply: (attachment: FileEmbedApplyPayload, closePopover?: ClosePopover) => void;
  handleImageApply: (payload: ImageEmbedApplyPayload, closePopover?: ClosePopover) => void;
  handleLinkApply: (url: string, mode: LinkEmbedMode, closePopover?: ClosePopover) => void;
  handleMathApply: (payload: MathEmbedApplyPayload, closePopover?: ClosePopover) => void;
  handleVideoApply: (payload: VideoEmbedApplyPayload, closePopover?: ClosePopover) => void;
  labels?: MarkdownToolbarUiLabels;
  popoverTriggerClassName: string;
  toolbarUiRegistry: ResolvedMarkdownToolbarUiRegistry;
}): ToolbarCustomItem[] => {
  const onTriggerMouseDown: TriggerMouseDown = event => event.preventDefault();

  return [
    createToolbarCustomItem(
      'math-embed',
      toolbarUiRegistry.renderMathEmbedPopover({
        onApply: handleMathApply,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies MathEmbedPopoverRenderProps),
    ),
    createToolbarCustomItem(
      'file-embed',
      toolbarUiRegistry.renderFileEmbedPopover({
        contentType,
        onApply: handleAttachmentApply,
        onUploadFile: adapters?.uploadFile,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies FileEmbedPopoverRenderProps),
    ),
    createToolbarCustomItem(
      'image-embed',
      toolbarUiRegistry.renderImageEmbedModal({
        contentType,
        onApply: handleImageApply,
        renderImage: adapters?.renderImage,
        onUploadImage: adapters?.uploadImage,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies ImageEmbedModalRenderProps),
    ),
    createToolbarCustomItem(
      'link-embed',
      toolbarUiRegistry.renderLinkEmbedPopover({
        labels: labels?.linkEmbedPopover,
        onApply: handleLinkApply,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies LinkEmbedPopoverRenderProps),
    ),
    createToolbarCustomItem(
      'video-embed',
      toolbarUiRegistry.renderVideoEmbedModal({
        contentType,
        onApply: handleVideoApply,
        onUploadVideo: adapters?.uploadVideo,
        onTriggerMouseDown,
        triggerClassName: popoverTriggerClassName,
      } satisfies VideoEmbedModalRenderProps),
    ),
  ];
};
