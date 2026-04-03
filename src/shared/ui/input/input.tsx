import React from 'react';
import { cva, cx } from 'styled-system/css';

import { disabledFieldStyles, focusVisibleRingStyles } from '@/shared/ui/styles/primitive-theme';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Shared single-line input component.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input {...props} className={cx(inputRecipe(), className)} ref={ref} />
  ),
);

Input.displayName = 'Input';

/**
 * Shared style recipe for single-line inputs.
 */
const inputRecipe = cva({
  base: {
    width: 'full',
    minHeight: '[2.75rem]',
    px: '3',
    py: '2',
    borderRadius: 'md',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'transparent',
    color: 'text',
    transition: 'colors',
    _placeholder: {
      color: 'muted',
    },
    _hover: {
      borderColor: 'borderStrong',
    },
    _focusVisible: {
      ...focusVisibleRingStyles,
      borderColor: 'primary',
    },
    _disabled: disabledFieldStyles,
  },
});
