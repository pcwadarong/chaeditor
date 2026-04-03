'use client';

import React from 'react';
import { css } from 'styled-system/css';

import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from '@/shared/ui/icons/app-icons';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type AlignPopoverProps = {
  onApply: (align: 'center' | 'left' | 'right', closePopover?: ClosePopover) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

const alignOptions = [
  {
    icon: <AlignLeftIcon aria-hidden color="text" size="sm" />,
    key: 'left',
    label: 'Align left',
    value: 'left' as const,
  },
  {
    icon: <AlignCenterIcon aria-hidden color="text" size="sm" />,
    key: 'center',
    label: 'Align center',
    value: 'center' as const,
  },
  {
    icon: <AlignRightIcon aria-hidden color="text" size="sm" />,
    key: 'right',
    label: 'Align right',
    value: 'right' as const,
  },
];

/**
 * Popover for inserting align block syntax from the toolbar.
 */
export const AlignPopover = ({
  onApply,
  onTriggerMouseDown,
  triggerClassName,
}: AlignPopoverProps) => {
  const { Button, Popover: PrimitivePopover } = useMarkdownPrimitives();

  return (
    <PrimitivePopover
      onTriggerMouseDown={onTriggerMouseDown}
      panelLabel="Choose alignment"
      portalPlacement="start"
      renderInPortal
      triggerAriaLabel="Alignment"
      triggerClassName={triggerClassName}
      triggerContent={<AlignLeftIcon aria-hidden color="text" size="sm" />}
      triggerTooltip="Alignment"
    >
      {({ closePopover }) => (
        <div className={alignGridClass}>
          {alignOptions.map(option => (
            <Button
              aria-label={option.label}
              className={alignButtonClass}
              key={option.key}
              onClick={() => onApply(option.value, closePopover)}
              onMouseDown={event => event.preventDefault()}
              type="button"
              variant="ghost"
            >
              {option.icon}
            </Button>
          ))}
        </div>
      )}
    </PrimitivePopover>
  );
};

const alignGridClass = css({
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '2',
  minWidth: '[8.5rem]',
});

const alignButtonClass = css({
  minWidth: '9',
  minHeight: '9',
  px: '0',
  borderRadius: 'lg',
  borderColor: 'border',
});
