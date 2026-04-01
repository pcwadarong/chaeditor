'use client';

import React from 'react';
import { css, cx } from 'styled-system/css';

import {
  Button,
  type ButtonSize,
  type ButtonTone,
  type ButtonVariant,
} from '@/shared/ui/button/button';

type XButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ariaLabel: string;
  className?: string;
  glyphClassName?: string;
  size?: ButtonSize;
  tone?: ButtonTone;
  variant?: ButtonVariant;
};

/**
 * Shared icon button used for close, clear, and remove actions.
 */
export const XButton = React.forwardRef<HTMLButtonElement, XButtonProps>(
  (
    {
      ariaLabel,
      className,
      glyphClassName,
      size = 'sm',
      tone = 'black',
      type = 'button',
      variant = 'ghost',
      ...props
    },
    ref,
  ) => (
    <Button
      aria-label={ariaLabel}
      className={className}
      ref={ref}
      size={size}
      tone={tone}
      type={type}
      variant={variant}
      {...props}
    >
      <span aria-hidden className={cx(glyphClass, glyphClassName)}>
        +
      </span>
    </Button>
  ),
);

XButton.displayName = 'XButton';

const glyphClass = css({
  display: 'inline-block',
  fontSize: '3xl',
  lineHeight: 'none',
  transform: 'rotate(45deg)',
});
