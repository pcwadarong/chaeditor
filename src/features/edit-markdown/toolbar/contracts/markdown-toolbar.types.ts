import type React from 'react';

import type { EditorContentType, MarkdownEditorHostAdapters } from '@/entities/editor-core';
import type {
  MarkdownToolbarPresetItemKey,
  MarkdownToolbarSectionKey,
} from '@/entities/editor-core/model/toolbar-preset';
import type { FileEmbedApplyPayload } from '@/features/edit-markdown/file';
import type { ColorStylePopoverLabels } from '@/features/edit-markdown/formatting';
import type { ImageEmbedApplyPayload } from '@/features/edit-markdown/image';
import type { LinkEmbedMode, LinkEmbedPopoverLabels } from '@/features/edit-markdown/link';
import type { MathEmbedApplyPayload } from '@/features/edit-markdown/math';
import type {
  ToolbarTokenPopoverLabels,
  ToolbarTokenPopoverProps,
} from '@/features/edit-markdown/toolbar/ui/toolbar-token-popover';
import type { VideoEmbedApplyPayload } from '@/features/edit-markdown/video';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import type { MarkdownPrimitiveRegistry } from '@/shared/ui/primitive-registry/markdown-primitive-contract';

/**
 * Minimal contract required by the markdown toolbar.
 *
 * @property contentType Current editor content type.
 * @property onChange Callback that applies the next textarea value.
 * @property primitiveRegistry Optional host primitive overrides applied to the toolbar subtree.
 * @property textareaRef Ref for the active textarea element.
 * @property uiRegistry Optional UI registry for labels and primitive overrides.
 */
export type MarkdownToolbarProps = {
  contentType: EditorContentType;
  /**
   * Optional host adapters for uploads and renderer overrides.
   *
   * When omitted, upload-oriented helpers should disable the related action instead of
   * assuming a built-in backend exists.
   */
  adapters?: MarkdownEditorHostAdapters;
  /** Applies the next editor value after a toolbar action finishes. */
  onChange: (value: string) => void;
  /** Optional primitive registry applied to the toolbar subtree. */
  primitiveRegistry?: MarkdownPrimitiveRegistry;
  /** Active textarea ref used by selection-based toolbar commands. */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  /** Optional UI registry for labels and built-in popover replacements. */
  uiRegistry?: MarkdownToolbarUiRegistry;
};

/**
 * Label overrides for built-in toolbar popovers.
 */
export type MarkdownToolbarUiLabels = {
  /** Label overrides for the text background color popover. */
  backgroundColorPopover?: Partial<ColorStylePopoverLabels>;
  /** Label overrides for the grouped heading token popover. */
  headingPopover?: Partial<ToolbarTokenPopoverLabels>;
  /** Label overrides for the link embed popover. */
  linkEmbedPopover?: Partial<LinkEmbedPopoverLabels>;
  /** Label overrides for the text color popover. */
  textColorPopover?: Partial<ColorStylePopoverLabels>;
  /** Label overrides for the grouped toggle token popover. */
  togglePopover?: Partial<ToolbarTokenPopoverLabels>;
};

/**
 * Render registry for replacing built-in toolbar popovers.
 *
 * Each renderer receives the same contract as the built-in helper so host applications
 * can replace only the UI shell while keeping the existing toolbar behavior.
 */
export type MarkdownToolbarPopoverRegistry = {
  alignPopover?: (props: AlignPopoverRenderProps) => React.ReactNode;
  backgroundColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  fileEmbedPopover?: (props: FileEmbedPopoverRenderProps) => React.ReactNode;
  headingPopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
  imageEmbedModal?: (props: ImageEmbedModalRenderProps) => React.ReactNode;
  linkEmbedPopover?: (props: LinkEmbedPopoverRenderProps) => React.ReactNode;
  mathEmbedPopover?: (props: MathEmbedPopoverRenderProps) => React.ReactNode;
  textColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  togglePopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
  videoEmbedModal?: (props: VideoEmbedModalRenderProps) => React.ReactNode;
};

/**
 * Toolbar UI customization entry point.
 *
 * Use this registry to override labels only, replace selected popovers, or do both.
 */
export type MarkdownToolbarUiRegistry = {
  labels?: MarkdownToolbarUiLabels;
  popovers?: MarkdownToolbarPopoverRegistry;
};

/**
 * Props passed to a custom link embed popover renderer.
 */
export type LinkEmbedPopoverRenderProps = {
  /** Optional label overrides merged into the built-in defaults. */
  labels?: Partial<LinkEmbedPopoverLabels>;
  /** Applies the selected link mode and URL to the active editor selection. */
  onApply: (url: string, mode: LinkEmbedMode, closePopover?: ClosePopover) => void;
  /** Mouse-down hook used to preserve textarea focus before opening the helper. */
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional class name for the trigger button wrapper. */
  triggerClassName?: string;
};

/**
 * Props passed to a custom align popover renderer.
 */
export type AlignPopoverRenderProps = {
  /** Applies the selected block alignment. */
  onApply: (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Props passed to a custom math embed popover renderer.
 */
export type MathEmbedPopoverRenderProps = {
  /** Inserts the provided math formula into the editor. */
  onApply: (payload: MathEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Props passed to a custom color popover renderer.
 */
export type TextColorPopoverRenderProps = {
  labels?: Partial<ColorStylePopoverLabels>;
  /** Applies the selected color token or hex value. */
  onApply: (colorHex: string, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Props passed to a custom file embed popover renderer.
 */
export type FileEmbedPopoverRenderProps = {
  /** Current editor content type forwarded to the upload adapter. */
  contentType: EditorContentType;
  /** Inserts the uploaded attachment into the editor. */
  onApply: (attachment: FileEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional upload adapter. When omitted, upload-specific actions should be disabled. */
  onUploadFile?: MarkdownEditorHostAdapters['uploadFile'];
  triggerClassName?: string;
};

/**
 * Props passed to a custom image embed modal renderer.
 */
export type ImageEmbedModalRenderProps = {
  /** Current editor content type forwarded to the upload adapter. */
  contentType: EditorContentType;
  /** Inserts one or more image references into the editor. */
  onApply: (payload: ImageEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional framework-specific image renderer override for previews. */
  renderImage?: MarkdownEditorHostAdapters['renderImage'];
  /** Optional upload adapter. When omitted, upload-specific actions should be disabled. */
  onUploadImage?: MarkdownEditorHostAdapters['uploadImage'];
  triggerClassName?: string;
};

/**
 * Props passed to a custom video embed modal renderer.
 */
export type VideoEmbedModalRenderProps = {
  /** Current editor content type forwarded to the upload adapter. */
  contentType: EditorContentType;
  /** Inserts either an uploaded video or a YouTube reference into the editor. */
  onApply: (payload: VideoEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  /** Optional upload adapter. When omitted, upload-specific actions should be disabled. */
  onUploadVideo?: MarkdownEditorHostAdapters['uploadVideo'];
  triggerClassName?: string;
};

export type { LinkEmbedMode as LinkMode };

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
