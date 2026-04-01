'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { cva, cx } from 'styled-system/css';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoResize?: boolean;
};

/**
 * Recalculates the textarea height from the current content.
 */
const resizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = '0px';
  element.style.height = `${element.scrollHeight}px`;
};

/**
 * Shared multiline textarea component.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ autoResize = true, className, onChange, rows = 1, style, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    useLayoutEffect(() => {
      if (!autoResize || !innerRef.current) return;

      resizeTextarea(innerRef.current);
    }, [autoResize, props.value]);

    const handleRef = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;

      if (!ref) return;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      ref.current = node;
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        resizeTextarea(event.currentTarget);
      }

      onChange?.(event);
    };

    return (
      <textarea
        {...props}
        className={cx(textareaRecipe({ autoResize }), className)}
        onChange={handleChange}
        ref={handleRef}
        rows={rows}
        style={style}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

/**
 * Shared style recipe for multiline textareas.
 */
const textareaRecipe = cva({
  base: {
    width: 'full',
    px: '3',
    py: '2',
    borderRadius: 'md',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'transparent',
    color: 'text',
    resize: 'vertical',
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
    '&[aria-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.56,
    },
  },
  variants: {
    autoResize: {
      true: {
        resize: 'none',
        overflow: 'hidden',
      },
      false: {},
    },
  },
  defaultVariants: {
    autoResize: true,
  },
});
