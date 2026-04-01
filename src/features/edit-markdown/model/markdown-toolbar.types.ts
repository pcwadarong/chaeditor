import type React from 'react';

import type { EditorAttachment } from '@/entities/editor/model/editor-attachment';
import type { EditorContentType } from '@/entities/editor/model/editor-types';
import type { MarkdownEditorHostAdapters } from '@/entities/editor-core';
import type {
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarSectionKey,
} from '@/entities/editor-core/model/toolbar-preset';
import type { ColorStylePopoverLabels } from '@/features/edit-markdown/ui/color-style-popover';
import type { LinkEmbedPopoverLabels } from '@/features/edit-markdown/ui/link-embed-popover';
import type {
  ToolbarTokenPopoverLabels,
  ToolbarTokenPopoverProps,
} from '@/features/edit-markdown/ui/toolbar-token-popover';
import type { ClosePopover } from '@/shared/ui/popover/popover';

/**
 * Minimal contract required by the markdown toolbar.
 *
 * @property contentType Current editor content type.
 * @property onChange Callback that applies the next textarea value.
 * @property textareaRef Ref for the active textarea element.
 * @property uiRegistry Optional UI registry for labels and primitive overrides.
 */
export type MarkdownToolbarProps = {
  contentType: EditorContentType;
  adapters?: MarkdownEditorHostAdapters;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  uiRegistry?: MarkdownToolbarUiRegistry;
};

/**
 * Label overrides for built-in toolbar popovers.
 */
export type MarkdownToolbarUiLabels = {
  backgroundColorPopover?: Partial<ColorStylePopoverLabels>;
  headingPopover?: Partial<ToolbarTokenPopoverLabels>;
  linkEmbedPopover?: Partial<LinkEmbedPopoverLabels>;
  textColorPopover?: Partial<ColorStylePopoverLabels>;
  togglePopover?: Partial<ToolbarTokenPopoverLabels>;
};

/**
 * Render registry for replacing built-in toolbar popovers.
 */
export type MarkdownToolbarPopoverRegistry = {
  alignPopover?: (props: AlignPopoverRenderProps) => React.ReactNode;
  backgroundColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  fileEmbedPopover?: (props: FileEmbedPopoverRenderProps) => React.ReactNode;
  headingPopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
  imageEmbedPopover?: (props: ImageEmbedPopoverRenderProps) => React.ReactNode;
  linkEmbedPopover?: (props: LinkEmbedPopoverRenderProps) => React.ReactNode;
  mathEmbedPopover?: (props: MathEmbedPopoverRenderProps) => React.ReactNode;
  textColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  togglePopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
  videoEmbedModal?: (props: VideoEmbedModalRenderProps) => React.ReactNode;
};

/**
 * Toolbar UI customization entry point.
 */
export type MarkdownToolbarUiRegistry = {
  labels?: MarkdownToolbarUiLabels;
  popovers?: MarkdownToolbarPopoverRegistry;
};

export type LinkEmbedPopoverRenderProps = {
  labels?: Partial<LinkEmbedPopoverLabels>;
  onApply: (url: string, mode: LinkMode, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

export type AlignPopoverRenderProps = {
  onApply: (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

export type MathEmbedPopoverRenderProps = {
  onApply: (formula: string, isBlock: boolean, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

export type TextColorPopoverRenderProps = {
  labels?: Partial<ColorStylePopoverLabels>;
  onApply: (colorHex: string, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

export type FileEmbedPopoverRenderProps = {
  contentType: EditorContentType;
  onApply: (attachment: EditorAttachment, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onUploadFile?: MarkdownEditorHostAdapters['uploadFile'];
  triggerClassName?: string;
};

export type ImageEmbedPopoverRenderProps = {
  contentType: EditorContentType;
  onApply: (
    payload: {
      items: Array<{
        altText: string;
        url: string;
      }>;
      mode: 'gallery' | 'individual';
    },
    closePopover?: ClosePopover,
  ) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onUploadImage?: MarkdownEditorHostAdapters['uploadImage'];
  triggerClassName?: string;
};

export type VideoEmbedModalRenderProps = {
  contentType: EditorContentType;
  onApply: (
    payload: {
      provider: 'upload' | 'youtube';
      src?: string;
      videoId?: string;
    },
    closePopover?: ClosePopover,
  ) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onUploadVideo?: MarkdownEditorHostAdapters['uploadVideo'];
  triggerClassName?: string;
};

export type LinkMode = 'card' | 'link' | 'preview';

export type ToolbarActionItem = {
  icon?: React.ReactNode;
  key: string;
  label: string;
  onClick: () => void;
  token?: string;
};

export type ToolbarTokenOption = {
  key: string;
  label: string;
  onClick: () => void;
  token: string;
};

export type ToolbarCustomItem = {
  key: MarkdownToolbarPresetItemKey;
  node: React.ReactNode;
  type: 'custom';
};

export type ToolbarSectionItem =
  | {
      action: ToolbarActionItem;
      key: string;
      type: 'action';
    }
  | ToolbarCustomItem;

export type ToolbarSection = {
  items: ToolbarSectionItem[];
  key: MarkdownToolbarSectionKey;
};

export type { MarkdownToolbarPresetItemKey };
