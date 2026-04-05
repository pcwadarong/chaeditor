import type { CSSProperties, ReactPortal } from 'react';
import React from 'react';
import { css, cx } from 'styled-system/css';

import { createChaeditorThemeVars } from '@/core';
import {
  MarkdownPrimitiveProvider,
  type MarkdownPrimitiveRegistry,
  useMarkdownPrimitives,
} from '@/react';
import { Button, type ButtonProps } from '@/shared/ui/button';
import { Input, type InputProps } from '@/shared/ui/input';
import { Modal, type ModalProps } from '@/shared/ui/modal';
import { Popover, type PopoverProps } from '@/shared/ui/popover';
import { Textarea, type TextareaProps } from '@/shared/ui/textarea';
import { Tooltip, type TooltipProps } from '@/shared/ui/tooltip';

export type StorybookPrimitiveMode = 'custom' | 'default';
export type StorybookThemeMode = 'default' | 'host';

export const storybookHostThemeVars = createChaeditorThemeVars({
  border: '#bfd4ea',
  borderStrong: '#8db2d3',
  focusRing: '#bfdbfe',
  muted: '#4b5563',
  primary: '#0f766e',
  primaryContrast: '#ffffff',
  primaryMuted: '#ccfbf1',
  primarySubtle: '#f0fdfa',
  sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  surface: '#f8fafc',
  surfaceMuted: '#eff6ff',
  surfaceStrong: '#dbeafe',
  text: '#0f172a',
  textSubtle: '#475569',
});

/**
 * Resolves the Storybook host theme scope for visual override examples.
 */
export const getStorybookThemeStyle = (mode: StorybookThemeMode): CSSProperties | undefined => {
  if (mode === 'host') {
    return storybookHostThemeVars as CSSProperties;
  }

  return undefined;
};

const primitiveButtonClass = css({
  bg: 'primarySubtle',
  borderRadius: 'xl',
  borderColor: 'primary',
  fontWeight: 'semibold',
});

const primitiveInputClass = css({
  bg: 'surfaceMuted',
  borderColor: 'primary',
  borderRadius: 'xl',
});

const primitiveTextareaClass = css({
  bg: 'surfaceMuted',
  borderColor: 'primary',
  borderRadius: '2xl',
});

const primitivePopoverRootClass = css({
  display: 'inline-flex',
});

const primitivePopoverTriggerClass = css({
  bg: 'primarySubtle',
  borderColor: 'primary',
  borderRadius: 'xl',
});

const primitivePopoverPanelClass = css({
  borderColor: 'primary',
  shadow: 'lg',
});

const primitivePopoverLabelClass = css({
  color: 'primary',
  fontWeight: 'semibold',
});

const primitivePopoverValueClass = css({
  color: 'text',
  fontWeight: 'medium',
});

const primitiveModalBackdropClass = css({
  bg: '[rgba(15,23,42,0.52)]',
});

const primitiveModalFrameClass = css({
  bg: 'surface',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  borderRadius: '3xl',
  boxShadow: '2xl',
  maxWidth: '[28rem]',
  p: '6',
  width: 'full',
});

const primitiveModalCloseButtonClass = css({
  color: 'primary',
});

const primitiveTooltipPortalClass = css({
  zIndex: '[10000]',
});

const primitiveTooltipContentClass = css({
  bg: 'primary',
  borderColor: 'primary',
  color: 'primaryContrast',
});

const StorybookHostButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button {...props} className={cx(primitiveButtonClass, className)} ref={ref} />
  ),
);

StorybookHostButton.displayName = 'StorybookHostButton';

const StorybookHostInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input {...props} className={cx(primitiveInputClass, className)} ref={ref} />
  ),
);

StorybookHostInput.displayName = 'StorybookHostInput';

const StorybookHostTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <Textarea {...props} className={cx(primitiveTextareaClass, className)} ref={ref} />
  ),
);

StorybookHostTextarea.displayName = 'StorybookHostTextarea';

const StorybookHostPopover = ({
  panelClassName,
  rootClassName,
  triggerClassName,
  triggerLabelClassName,
  triggerValueClassName,
  ...props
}: PopoverProps) => (
  <Popover
    {...props}
    panelClassName={cx(primitivePopoverPanelClass, panelClassName)}
    rootClassName={cx(primitivePopoverRootClass, rootClassName)}
    triggerClassName={cx(primitivePopoverTriggerClass, triggerClassName)}
    triggerLabelClassName={cx(primitivePopoverLabelClass, triggerLabelClassName)}
    triggerValueClassName={cx(primitivePopoverValueClass, triggerValueClassName)}
  />
);

const StorybookHostModal = ({
  backdropClassName,
  closeButtonClassName,
  frameClassName,
  ...props
}: ModalProps): ReactPortal | null =>
  Modal({
    ...props,
    backdropClassName: cx(primitiveModalBackdropClass, backdropClassName),
    closeButtonClassName: cx(primitiveModalCloseButtonClass, closeButtonClassName),
    frameClassName: cx(primitiveModalFrameClass, frameClassName),
  });

const StorybookHostTooltip = ({ contentClassName, portalClassName, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    contentClassName={cx(primitiveTooltipContentClass, contentClassName)}
    portalClassName={cx(primitiveTooltipPortalClass, portalClassName)}
  />
);

/**
 * Resolves a visibly customized primitive registry for Storybook override examples.
 */
export const createStorybookPrimitiveRegistry = (
  mode: StorybookPrimitiveMode,
): MarkdownPrimitiveRegistry | undefined => {
  if (mode === 'default') {
    return undefined;
  }

  return {
    Button: StorybookHostButton,
    Input: StorybookHostInput,
    Modal: StorybookHostModal,
    Popover: StorybookHostPopover,
    Textarea: StorybookHostTextarea,
    Tooltip: StorybookHostTooltip,
  };
};

const primitiveShowcaseLayoutClass = css({
  display: 'grid',
  gap: '4',
});

const primitiveShowcaseGridClass = css({
  display: 'grid',
  gap: '4',
  gridTemplateColumns: {
    base: '1fr',
    lg: 'repeat(2, minmax(0, 1fr))',
  },
});

const primitiveShowcaseCardClass = css({
  display: 'grid',
  gap: '3',
  p: '4',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'surface',
});

const primitiveShowcaseLabelClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const primitiveShowcaseValueClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

const PrimitiveRegistryShowcasePreview = () => {
  const {
    Button: PrimitiveButton,
    Input: PrimitiveInput,
    Modal: PrimitiveModal,
    Popover: PrimitivePopover,
    Textarea: PrimitiveTextarea,
    Tooltip: PrimitiveTooltip,
  } = useMarkdownPrimitives();

  return (
    <div className={primitiveShowcaseLayoutClass}>
      <div className={primitiveShowcaseGridClass}>
        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Button</p>
          <PrimitiveButton tone="primary" variant="solid">
            Branded primary action
          </PrimitiveButton>
          <p className={primitiveShowcaseValueClass}>
            Host registry can replace the default call-to-action shell without changing editor
            logic.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Tooltip</p>
          <PrimitiveTooltip content="Branded tooltip shell" forceOpen>
            <PrimitiveButton variant="ghost">Hover target</PrimitiveButton>
          </PrimitiveTooltip>
          <p className={primitiveShowcaseValueClass}>
            Tooltip content stays on the same contract while the host controls the visual wrapper.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Input</p>
          <PrimitiveInput defaultValue="https://chaeditor.dev" aria-label="Host input preview" />
          <p className={primitiveShowcaseValueClass}>
            Modal and popover fields inherit the same host input shell through the registry.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Textarea</p>
          <PrimitiveTextarea
            aria-label="Host textarea preview"
            autoResize={false}
            rows={4}
            defaultValue={'Line one\nLine two'}
          />
          <p className={primitiveShowcaseValueClass}>
            Textarea styling can change independently from the markdown feature logic.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Popover</p>
          <PrimitivePopover isOpen label="Group" panelLabel="Popover shell" value="Custom trigger">
            {() => <p className={primitiveShowcaseValueClass}>Popover panel content</p>}
          </PrimitivePopover>
          <p className={primitiveShowcaseValueClass}>
            Trigger and panel chrome can be swapped while keeping grouped helper behavior intact.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Modal</p>
          <PrimitiveModal closeAriaLabel="Close preview modal" isOpen onClose={() => {}}>
            <div className={primitiveShowcaseLayoutClass}>
              <p className={primitiveShowcaseValueClass}>Host modal frame preview</p>
              <PrimitiveInput defaultValue="Modal field" aria-label="Host modal input preview" />
            </div>
          </PrimitiveModal>
          <p className={primitiveShowcaseValueClass}>
            Embed helpers can inherit a branded dialog shell through the same registry.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Renders a visible primitive override preview for Storybook docs.
 */
export const StorybookPrimitiveRegistryShowcase = () => (
  <MarkdownPrimitiveProvider registry={createStorybookPrimitiveRegistry('custom')}>
    <PrimitiveRegistryShowcasePreview />
  </MarkdownPrimitiveProvider>
);
