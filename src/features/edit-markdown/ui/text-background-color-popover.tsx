'use client';

import React from 'react';

import {
  ColorStylePopover,
  type ColorStylePopoverLabels,
} from '@/features/edit-markdown/ui/color-style-popover';
import { TextBgColorIcon } from '@/shared/ui/icons/app-icons';

type TextBackgroundColorPopoverProps = {
  labels?: Partial<ColorStylePopoverLabels>;
  onApply: (colorHex: string, closePopover?: () => void) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Renders the toolbar popover for background highlight syntax.
 */
export const TextBackgroundColorPopover = ({
  labels,
  onApply,
  onTriggerMouseDown,
  triggerClassName,
}: TextBackgroundColorPopoverProps) => (
  <ColorStylePopover
    labels={{
      getOptionAriaLabel: labels?.getOptionAriaLabel,
      panelLabel: labels?.panelLabel ?? 'Choose background color',
      triggerAriaLabel: labels?.triggerAriaLabel ?? 'Background color',
      triggerTooltip: labels?.triggerTooltip ?? 'Background color',
    }}
    previewMode="background"
    onApply={onApply}
    onTriggerMouseDown={onTriggerMouseDown}
    triggerClassName={triggerClassName}
    triggerContent={<TextBgColorIcon aria-hidden color="text" size="sm" />}
  />
);
