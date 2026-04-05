import React, { forwardRef } from 'react';
import { cx, sva } from 'styled-system/css';
import type { RecipeVariantProps } from 'styled-system/types/recipe';

import type {
  ButtonProps,
  ButtonSize,
  ButtonTone,
  ButtonVariant,
} from '@/shared/ui/primitive-registry/markdown-primitive-props';
import {
  disabledButtonStyles,
  focusVisibleRingStyles,
  primaryHoverBackground,
} from '@/shared/ui/styles/primitive-theme';

export type { ButtonProps, ButtonSize, ButtonTone, ButtonVariant };

type ButtonRecipeProps = RecipeVariantProps<typeof buttonRecipe>;
type ButtonResolvedProps = ButtonProps & ButtonRecipeProps;

type ButtonAsChildProps = {
  'aria-disabled'?: React.AriaAttributes['aria-disabled'];
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  tabIndex?: number;
  type?: string;
};

/**
 * Shared button recipe that styles the root, label, and visual slots.
 */
export const buttonRecipe = sva({
  slots: ['root', 'label', 'visual'],
  base: {
    root: {
      appearance: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2',
      userSelect: 'none',
      cursor: 'pointer',
      transition: 'colors',
      letterSpacing: '[-0.01em]',
      _focusVisible: {
        ...focusVisibleRingStyles,
      },
      _disabled: disabledButtonStyles,
      '&[aria-disabled="true"]': {
        ...disabledButtonStyles,
      },
    },
    label: {
      display: 'inline-flex',
      alignItems: 'center',
      minWidth: '0',
    },
    visual: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
    },
  },
  variants: {
    fullWidth: {
      true: { root: { width: 'full' } },
      false: { root: { width: 'auto' } },
    },
    size: {
      xs: { root: { fontSize: 'xs' } },
      sm: { root: { fontSize: 'sm' } },
      md: { root: { fontSize: 'sm' } },
    },
    variant: {
      solid: {
        root: {
          borderStyle: 'solid',
          borderWidth: '1px',
          borderRadius: 'full',
        },
      },
      ghost: {
        root: {
          borderStyle: 'solid',
          borderWidth: '1px',
          borderRadius: 'full',
          background: 'transparent',
        },
      },
      underline: {
        root: {
          minHeight: 'auto',
          p: '0',
          textDecoration: 'underline',
          textUnderlineOffset: '[0.18em]',
        },
      },
    },
    tone: {
      white: {},
      primary: {},
      black: {},
    },
  },
  compoundVariants: [
    /* Layout rules for the solid and ghost variants. */
    {
      variant: ['solid', 'ghost'],
      size: 'xs',
      css: { root: { minHeight: '8', px: '2' } },
    },
    {
      variant: ['solid', 'ghost'],
      size: 'sm',
      css: { root: { minHeight: '[2.375rem]', px: '3' } },
    },
    {
      variant: ['solid', 'ghost'],
      size: 'md',
      css: { root: { minHeight: '[2.75rem]', px: '4' } },
    },
    /* Colors for the solid variant. */
    {
      tone: 'white',
      variant: 'solid',
      css: {
        root: {
          background: 'surface',
          borderColor: 'border',
          color: 'text',
          _hover: { borderColor: 'borderStrong' },
        },
      },
    },
    {
      tone: 'primary',
      variant: 'solid',
      css: {
        root: {
          background: 'primary',
          color: 'primaryContrast',
          borderColor: 'transparent',
          _hover: { background: primaryHoverBackground },
        },
      },
    },
    {
      tone: 'black',
      variant: 'solid',
      css: {
        root: {
          background: 'text',
          color: 'surface',
          borderColor: 'transparent',
        },
      },
    },
    /* Colors for the ghost and underline variants. */
    {
      tone: 'white',
      variant: ['ghost', 'underline'],
      css: { root: { color: 'text', borderColor: 'transparent' } },
    },
    {
      tone: 'primary',
      variant: ['ghost', 'underline'],
      css: { root: { color: 'primary', borderColor: 'transparent' } },
    },
    {
      tone: 'black',
      variant: ['ghost', 'underline'],
      css: { root: { color: 'text', borderColor: 'transparent' } },
    },
  ],
  defaultVariants: {
    fullWidth: false,
    size: 'md',
    tone: 'white',
    variant: 'solid',
  },
});

export const Button = forwardRef<HTMLButtonElement, ButtonResolvedProps>(
  (
    {
      asChild = false,
      children,
      className,
      fullWidth,
      labelClassName,
      leadingVisual,
      leadingVisualClassName,
      size,
      tone,
      trailingVisual,
      trailingVisualClassName,
      type = 'button',
      variant,
      ...props
    },
    ref,
  ) => {
    const styles = buttonRecipe({ fullWidth, size, tone, variant });
    const isDisabled = props.disabled || props['aria-disabled'] === 'true';

    const renderContent = (labelContent: React.ReactNode) => (
      <>
        {leadingVisual && (
          <span aria-hidden className={cx(styles.visual, leadingVisualClassName)}>
            {leadingVisual}
          </span>
        )}
        <span className={cx(styles.label, labelClassName)}>{labelContent}</span>
        {trailingVisual && (
          <span aria-hidden className={cx(styles.visual, trailingVisualClassName)}>
            {trailingVisual}
          </span>
        )}
      </>
    );

    if (asChild) {
      if (!React.isValidElement(children)) {
        throw new Error('Button with asChild requires a single React element child.');
      }

      const child = children as React.ReactElement<ButtonAsChildProps>;
      const isNativeButtonElement = typeof child.type === 'string' && child.type === 'button';
      const nextProps: React.HTMLAttributes<HTMLElement> &
        React.ButtonHTMLAttributes<HTMLButtonElement> & {
          children: React.ReactNode;
          className: string;
          type?: string;
        } = {
        ...props,
        className: cx(styles.root, className, child.props.className),
        children: renderContent(child.props.children),
      };

      if (isNativeButtonElement) {
        nextProps.type = type;
      }

      if (isDisabled && !isNativeButtonElement) {
        delete nextProps.disabled;
        nextProps['aria-disabled'] = 'true';
        nextProps.tabIndex = -1;
        nextProps.onClick = event => {
          event.preventDefault();
          event.stopPropagation();
        };
      }

      return React.cloneElement(child, nextProps);
    }

    return (
      <button
        {...props}
        ref={ref}
        className={cx(styles.root, className)}
        type={type}
        disabled={props.disabled}
      >
        {renderContent(children)}
      </button>
    );
  },
);

Button.displayName = 'Button';
