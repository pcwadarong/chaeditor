import type React from 'react';

import type { EditorContentType } from '@/entities/editor/model/editor-types';
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
  backgroundColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  headingPopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
  linkEmbedPopover?: (props: LinkEmbedPopoverRenderProps) => React.ReactNode;
  textColorPopover?: (props: TextColorPopoverRenderProps) => React.ReactNode;
  togglePopover?: (props: ToolbarTokenPopoverProps) => React.ReactNode;
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

export type TextColorPopoverRenderProps = {
  labels?: Partial<ColorStylePopoverLabels>;
  onApply: (colorHex: string, closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
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
