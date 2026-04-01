'use client';

import React from 'react';
import { css, cx } from 'styled-system/css';

import { Button } from '@/shared/ui/button/button';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';

type ToolbarActionButtonProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
};

/**
 * Shared icon or token button used in the compact markdown toolbar.
 */
export const ToolbarActionButton = ({
  ariaLabel,
  children,
  className,
  onClick,
}: ToolbarActionButtonProps) => (
  <Tooltip content={ariaLabel}>
    <Button
      aria-label={ariaLabel}
      className={cx(actionButtonClass, className)}
      onClick={onClick}
      onMouseDown={event => event.preventDefault()}
      size="sm"
      tone="white"
      type="button"
      variant="ghost"
    >
      {children}
    </Button>
  </Tooltip>
);

const actionButtonClass = css({
  minWidth: '9',
  minHeight: '9',
  width: '9',
  height: '9',
  px: '0',
  borderRadius: 'lg',
  borderColor: 'border',
});
