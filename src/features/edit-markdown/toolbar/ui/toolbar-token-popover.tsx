'use client';

import React from 'react';
import { css } from 'styled-system/css';

import type { ToolbarTokenOption } from '@/features/edit-markdown/toolbar/contracts/markdown-toolbar.types';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

export type ToolbarTokenPopoverLabels = {
  panelLabel: string;
  triggerAriaLabel: string;
  triggerTooltip: string;
};

export type ToolbarTokenPopoverProps = {
  labels: ToolbarTokenPopoverLabels;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  options: ToolbarTokenOption[];
  triggerClassName?: string;
  triggerToken: string;
};

/**
 * Groups step-based toolbar commands behind a compact token trigger.
 */
export const ToolbarTokenPopover = ({
  labels,
  onTriggerMouseDown,
  options,
  triggerClassName,
  triggerToken,
}: ToolbarTokenPopoverProps) => {
  const { Button, Popover: PrimitivePopover } = useMarkdownPrimitives();

  return (
    <PrimitivePopover
      onTriggerMouseDown={onTriggerMouseDown}
      panelClassName={panelClass}
      panelLabel={labels.panelLabel}
      portalPlacement="start"
      renderInPortal
      triggerAriaLabel={labels.triggerAriaLabel}
      triggerClassName={triggerClassName}
      triggerContent={<span className={triggerTokenClass}>{triggerToken}</span>}
      triggerTooltip={labels.triggerTooltip}
    >
      {({ closePopover }) => (
        <div className={optionGridClass}>
          {options.map(option => (
            <Button
              aria-label={option.label}
              className={optionButtonClass}
              key={option.key}
              onClick={() => handleOptionClick(option.onClick, closePopover)}
              onMouseDown={event => event.preventDefault()}
              size="sm"
              tone="white"
              type="button"
              variant="ghost"
            >
              <span className={optionTokenClass}>{option.token}</span>
            </Button>
          ))}
        </div>
      )}
    </PrimitivePopover>
  );
};

/**
 * Applies the selected toolbar command and closes the popover.
 */
const handleOptionClick = (onClick: () => void, closePopover: ClosePopover) => {
  onClick();
  closePopover({ restoreFocus: false });
};

const panelClass = css({
  minWidth: 'auto',
});

const optionGridClass = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '2',
});

const optionButtonClass = css({
  minWidth: '10',
  minHeight: '9',
  px: '0',
  borderRadius: 'lg',
  borderColor: 'border',
});

const triggerTokenClass = css({
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: '[-0.02em]',
});

const optionTokenClass = css({
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: '[-0.02em]',
});
