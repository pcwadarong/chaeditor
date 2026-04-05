import type React from 'react';

import type {
  ButtonProps,
  InputProps,
  ModalProps,
  PopoverProps,
  TextareaProps,
  TooltipProps,
} from '@/shared/ui/primitive-registry/markdown-primitive-props';

type MarkdownRefPrimitive<Element, Props> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Props> & React.RefAttributes<Element>
>;

/**
 * Host-overridable button primitive used across the editor surface.
 */
export type MarkdownButtonPrimitive = MarkdownRefPrimitive<HTMLButtonElement, ButtonProps>;

/**
 * Host-overridable single-line field primitive used across the editor surface.
 */
export type MarkdownInputPrimitive = MarkdownRefPrimitive<HTMLInputElement, InputProps>;

/**
 * Host-overridable modal primitive used across the editor surface.
 */
export type MarkdownModalPrimitive = React.ComponentType<ModalProps>;

/**
 * Host-overridable popover primitive used across the editor surface.
 */
export type MarkdownPopoverPrimitive = React.ComponentType<PopoverProps>;

/**
 * Host-overridable multiline field primitive used across the editor surface.
 */
export type MarkdownTextareaPrimitive = MarkdownRefPrimitive<HTMLTextAreaElement, TextareaProps>;

/**
 * Host-overridable tooltip primitive used across the editor surface.
 */
export type MarkdownTooltipPrimitive = React.ComponentType<TooltipProps>;

/**
 * Partial host registry that can replace one or more shared editor primitives.
 */
export type MarkdownPrimitiveRegistry = Partial<{
  Button: MarkdownButtonPrimitive;
  Input: MarkdownInputPrimitive;
  Modal: MarkdownModalPrimitive;
  Popover: MarkdownPopoverPrimitive;
  Textarea: MarkdownTextareaPrimitive;
  Tooltip: MarkdownTooltipPrimitive;
}>;

/**
 * Fully resolved primitive registry with concrete implementations for every slot.
 */
export type ResolvedMarkdownPrimitiveRegistry = {
  Button: MarkdownButtonPrimitive;
  Input: MarkdownInputPrimitive;
  Modal: MarkdownModalPrimitive;
  Popover: MarkdownPopoverPrimitive;
  Textarea: MarkdownTextareaPrimitive;
  Tooltip: MarkdownTooltipPrimitive;
};
