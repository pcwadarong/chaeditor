'use client';

import React from 'react';

import {
  ColorStylePopover,
  type ColorStylePopoverLabels,
} from '@/features/edit-markdown/ui/color-style-popover';
import { ColorIcon } from '@/shared/ui/icons/app-icons';

type TextColorPopoverProps = {
  labels?: Partial<ColorStylePopoverLabels>;
  onApply: (colorHex: string, closePopover?: () => void) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Renders the toolbar popover for text color syntax.
 */
export const TextColorPopover = ({
  labels,
  onApply,
  onTriggerMouseDown,
  triggerClassName,
}: TextColorPopoverProps) => (
  <ColorStylePopover
    labels={{
      getOptionAriaLabel: labels?.getOptionAriaLabel,
      panelLabel: labels?.panelLabel ?? 'Choose text color',
      triggerAriaLabel: labels?.triggerAriaLabel ?? 'Text color',
      triggerTooltip: labels?.triggerTooltip ?? 'Text color',
    }}
    previewMode="text"
    onApply={onApply}
    onTriggerMouseDown={onTriggerMouseDown}
    triggerClassName={triggerClassName}
    triggerContent={<ColorIcon aria-hidden color="text" size="sm" />}
  />
);
