import React from 'react';
import { cva, cx } from 'styled-system/css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

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
      outline: '[2px solid var(--colors-focus-ring)]',
      outlineOffset: '[2px]',
      borderColor: 'primary',
    },
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.56,
    },
  },
});
