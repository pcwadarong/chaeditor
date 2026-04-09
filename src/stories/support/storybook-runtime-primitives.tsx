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

/**
 * Styling Recipes에서 사용하는 runtime/primitive showcase와 host theme preset 모음입니다.
 */

export type StorybookPrimitiveMode = 'custom' | 'default';
export type StorybookRuntimePreset =
  | 'emotion'
  | 'styled-components'
  | 'tailwind'
  | 'vanilla-extract';
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

const runtimeThemeVars = {
  emotion: createChaeditorThemeVars({
    border: '#d8b4fe',
    borderStrong: '#c084fc',
    focusRing: '#ddd6fe',
    muted: '#6b7280',
    primary: '#7c3aed',
    primaryContrast: '#ffffff',
    primaryMuted: '#f3e8ff',
    primarySubtle: '#faf5ff',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
    surface: '#fcfaff',
    surfaceMuted: '#f5f3ff',
    surfaceStrong: '#ede9fe',
    text: '#1f1633',
    textSubtle: '#5b4b7a',
  }),
  'styled-components': createChaeditorThemeVars({
    border: '#cbd5e1',
    borderStrong: '#94a3b8',
    focusRing: '#bfdbfe',
    muted: '#475569',
    primary: '#2563eb',
    primaryContrast: '#ffffff',
    primaryMuted: '#dbeafe',
    primarySubtle: '#eff6ff',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
    surface: '#f8fbff',
    surfaceMuted: '#f1f5f9',
    surfaceStrong: '#e2e8f0',
    text: '#0f172a',
    textSubtle: '#475569',
  }),
  tailwind: createChaeditorThemeVars({
    border: '#a7f3d0',
    borderStrong: '#34d399',
    focusRing: '#99f6e4',
    muted: '#4b5563',
    primary: '#0f766e',
    primaryContrast: '#ffffff',
    primaryMuted: '#ccfbf1',
    primarySubtle: '#f0fdfa',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
    surface: '#f7fffd',
    surfaceMuted: '#ecfeff',
    surfaceStrong: '#ccfbf1',
    text: '#0f172a',
    textSubtle: '#475569',
  }),
  'vanilla-extract': createChaeditorThemeVars({
    border: '#bfdbfe',
    borderStrong: '#60a5fa',
    focusRing: '#bae6fd',
    muted: '#475569',
    primary: '#0369a1',
    primaryContrast: '#ffffff',
    primaryMuted: '#e0f2fe',
    primarySubtle: '#f0f9ff',
    sansFont: 'var(--app-font-sans), system-ui, sans-serif',
    surface: '#f8fcff',
    surfaceMuted: '#eff6ff',
    surfaceStrong: '#dbeafe',
    text: '#082f49',
    textSubtle: '#475569',
  }),
};

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
  backgroundColor: '[rgba(15,23,42,0.88)]',
  borderColor: '[rgba(255,255,255,0.08)]',
  color: 'white',
  boxShadow: '[0 12px 28px rgba(15,23,42,0.28)]',
});

const tailwindButtonClass = css({
  bg: '[#ccfbf1]',
  borderRadius: 'xl',
  borderColor: '[#0f766e]',
  color: '[#134e4a]',
  fontWeight: 'semibold',
});

const tailwindInputClass = css({
  bg: '[#ecfeff]',
  borderColor: '[#0f766e]',
  borderRadius: 'xl',
});

const tailwindTextareaClass = css({
  bg: '[#ecfeff]',
  borderColor: '[#0f766e]',
  borderRadius: '2xl',
});

const tailwindPopoverTriggerClass = css({
  bg: '[#f0fdfa]',
  borderColor: '[#0f766e]',
  borderRadius: 'xl',
});

const tailwindPopoverPanelClass = css({
  borderColor: '[#0f766e]',
  shadow: 'lg',
});

const tailwindPopoverLabelClass = css({
  color: '[#0f766e]',
  fontWeight: 'semibold',
});

const tailwindPopoverValueClass = css({
  color: '[#134e4a]',
  fontWeight: 'medium',
});

const tailwindModalBackdropClass = css({
  bg: '[rgba(15,23,42,0.52)]',
});

const tailwindModalFrameClass = css({
  bg: '[#ffffff]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '[#0f766e]',
  borderRadius: '3xl',
  boxShadow: '2xl',
  maxWidth: '[28rem]',
  p: '6',
  width: 'full',
});

const tailwindModalCloseButtonClass = css({
  color: '[#0f766e]',
});

const tailwindTooltipContentClass = css({
  backgroundColor: '[rgba(15,23,42,0.88)]',
  borderColor: '[rgba(45,212,191,0.28)]',
  color: 'white',
  boxShadow: '[0 12px 28px rgba(15,23,42,0.28)]',
});

const emotionButtonClass = css({
  bg: '[#f3e8ff]',
  borderRadius: '[999px]',
  borderColor: '[#7c3aed]',
  color: '[#4c1d95]',
  fontWeight: 'semibold',
  boxShadow: '[0 8px 24px rgba(124,58,237,0.12)]',
});

const emotionInputClass = css({
  bg: '[#faf5ff]',
  borderColor: '[#a855f7]',
  borderRadius: '[999px]',
});

const emotionTextareaClass = css({
  bg: '[#faf5ff]',
  borderColor: '[#a855f7]',
  borderRadius: '2xl',
});

const emotionPopoverTriggerClass = css({
  bg: '[#faf5ff]',
  borderColor: '[#a855f7]',
  borderRadius: '[999px]',
});

const emotionPopoverPanelClass = css({
  borderColor: '[#a855f7]',
  shadow: '[0 18px 40px rgba(124,58,237,0.14)]',
});

const emotionPopoverLabelClass = css({
  color: '[#7c3aed]',
  fontWeight: 'semibold',
});

const emotionPopoverValueClass = css({
  color: '[#4c1d95]',
  fontWeight: 'medium',
});

const emotionModalBackdropClass = css({
  bg: '[rgba(76,29,149,0.18)]',
});

const emotionModalFrameClass = css({
  bg: '[#ffffff]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '[#a855f7]',
  borderRadius: '[2rem]',
  boxShadow: '[0 30px 60px rgba(124,58,237,0.16)]',
  maxWidth: '[28rem]',
  p: '6',
  width: 'full',
});

const emotionModalCloseButtonClass = css({
  color: '[#7c3aed]',
});

const emotionTooltipContentClass = css({
  backgroundColor: '[rgba(15,23,42,0.9)]',
  borderColor: '[rgba(168,85,247,0.28)]',
  color: 'white',
  boxShadow: '[0 12px 28px rgba(15,23,42,0.28)]',
});

const styledButtonClass = css({
  bg: '[#eff6ff]',
  borderRadius: 'lg',
  borderColor: '[#2563eb]',
  color: '[#1e3a8a]',
  fontWeight: 'semibold',
});

const styledInputClass = css({
  bg: '[#f8fbff]',
  borderColor: '[#2563eb]',
  borderRadius: 'lg',
});

const styledTextareaClass = css({
  bg: '[#f8fbff]',
  borderColor: '[#2563eb]',
  borderRadius: 'xl',
});

const styledPopoverTriggerClass = css({
  bg: '[#eff6ff]',
  borderColor: '[#2563eb]',
  borderRadius: 'lg',
});

const styledPopoverPanelClass = css({
  borderColor: '[#2563eb]',
  shadow: '[0 16px 32px rgba(37,99,235,0.12)]',
});

const styledPopoverLabelClass = css({
  color: '[#2563eb]',
  fontWeight: 'semibold',
});

const styledPopoverValueClass = css({
  color: '[#1e3a8a]',
  fontWeight: 'medium',
});

const styledModalBackdropClass = css({
  bg: '[rgba(15,23,42,0.42)]',
});

const styledModalFrameClass = css({
  bg: '[#ffffff]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '[#93c5fd]',
  borderRadius: '2xl',
  boxShadow: '[0 24px 48px rgba(37,99,235,0.14)]',
  maxWidth: '[28rem]',
  p: '6',
  width: 'full',
});

const styledModalCloseButtonClass = css({
  color: '[#2563eb]',
});

const styledTooltipContentClass = css({
  backgroundColor: '[rgba(15,23,42,0.9)]',
  borderColor: '[rgba(37,99,235,0.24)]',
  color: 'white',
  boxShadow: '[0 12px 28px rgba(15,23,42,0.28)]',
});

const vanillaButtonClass = css({
  bg: '[#f0f9ff]',
  borderRadius: 'md',
  borderColor: '[#0369a1]',
  color: '[#0c4a6e]',
  fontWeight: 'semibold',
});

const vanillaInputClass = css({
  bg: '[#f8fcff]',
  borderColor: '[#0369a1]',
  borderRadius: 'md',
});

const vanillaTextareaClass = css({
  bg: '[#f8fcff]',
  borderColor: '[#0369a1]',
  borderRadius: 'lg',
});

const vanillaPopoverTriggerClass = css({
  bg: '[#f0f9ff]',
  borderColor: '[#0369a1]',
  borderRadius: 'md',
});

const vanillaPopoverPanelClass = css({
  borderColor: '[#0369a1]',
  shadow: '[0 12px 28px rgba(3,105,161,0.12)]',
});

const vanillaPopoverLabelClass = css({
  color: '[#0369a1]',
  fontWeight: 'semibold',
});

const vanillaPopoverValueClass = css({
  color: '[#0c4a6e]',
  fontWeight: 'medium',
});

const vanillaModalBackdropClass = css({
  bg: '[rgba(8,47,73,0.34)]',
});

const vanillaModalFrameClass = css({
  bg: '[#ffffff]',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '[#7dd3fc]',
  borderRadius: 'xl',
  boxShadow: '[0 20px 40px rgba(3,105,161,0.12)]',
  maxWidth: '[28rem]',
  p: '6',
  width: 'full',
});

const vanillaModalCloseButtonClass = css({
  color: '[#0369a1]',
});

const vanillaTooltipContentClass = css({
  backgroundColor: '[rgba(15,23,42,0.9)]',
  borderColor: '[rgba(3,105,161,0.24)]',
  color: 'white',
  boxShadow: '[0 12px 28px rgba(15,23,42,0.28)]',
});

type RuntimePrimitiveClasses = {
  buttonClass: string;
  inputClass: string;
  modalBackdropClass: string;
  modalCloseButtonClass: string;
  modalFrameClass: string;
  popoverLabelClass: string;
  popoverPanelClass: string;
  popoverTriggerClass: string;
  popoverValueClass: string;
  textareaClass: string;
  tooltipContentClass: string;
};

const runtimePrimitiveClasses = {
  emotion: {
    buttonClass: emotionButtonClass,
    inputClass: emotionInputClass,
    modalBackdropClass: emotionModalBackdropClass,
    modalCloseButtonClass: emotionModalCloseButtonClass,
    modalFrameClass: emotionModalFrameClass,
    popoverLabelClass: emotionPopoverLabelClass,
    popoverPanelClass: emotionPopoverPanelClass,
    popoverTriggerClass: emotionPopoverTriggerClass,
    popoverValueClass: emotionPopoverValueClass,
    textareaClass: emotionTextareaClass,
    tooltipContentClass: emotionTooltipContentClass,
  },
  'styled-components': {
    buttonClass: styledButtonClass,
    inputClass: styledInputClass,
    modalBackdropClass: styledModalBackdropClass,
    modalCloseButtonClass: styledModalCloseButtonClass,
    modalFrameClass: styledModalFrameClass,
    popoverLabelClass: styledPopoverLabelClass,
    popoverPanelClass: styledPopoverPanelClass,
    popoverTriggerClass: styledPopoverTriggerClass,
    popoverValueClass: styledPopoverValueClass,
    textareaClass: styledTextareaClass,
    tooltipContentClass: styledTooltipContentClass,
  },
  tailwind: {
    buttonClass: tailwindButtonClass,
    inputClass: tailwindInputClass,
    modalBackdropClass: tailwindModalBackdropClass,
    modalCloseButtonClass: tailwindModalCloseButtonClass,
    modalFrameClass: tailwindModalFrameClass,
    popoverLabelClass: tailwindPopoverLabelClass,
    popoverPanelClass: tailwindPopoverPanelClass,
    popoverTriggerClass: tailwindPopoverTriggerClass,
    popoverValueClass: tailwindPopoverValueClass,
    textareaClass: tailwindTextareaClass,
    tooltipContentClass: tailwindTooltipContentClass,
  },
  'vanilla-extract': {
    buttonClass: vanillaButtonClass,
    inputClass: vanillaInputClass,
    modalBackdropClass: vanillaModalBackdropClass,
    modalCloseButtonClass: vanillaModalCloseButtonClass,
    modalFrameClass: vanillaModalFrameClass,
    popoverLabelClass: vanillaPopoverLabelClass,
    popoverPanelClass: vanillaPopoverPanelClass,
    popoverTriggerClass: vanillaPopoverTriggerClass,
    popoverValueClass: vanillaPopoverValueClass,
    textareaClass: vanillaTextareaClass,
    tooltipContentClass: vanillaTooltipContentClass,
  },
} satisfies Record<StorybookRuntimePreset, RuntimePrimitiveClasses>;

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

/**
 * Resolves a runtime-scoped host theme for styling recipe comparisons.
 */
export const getStorybookRuntimeThemeStyle = (runtime: StorybookRuntimePreset): CSSProperties =>
  runtimeThemeVars[runtime] as CSSProperties;

/**
 * Resolves a runtime-labeled primitive registry for styling recipe comparisons.
 */
export const createStorybookRuntimePrimitiveRegistry = (
  runtime: StorybookRuntimePreset,
): MarkdownPrimitiveRegistry => {
  const classes = runtimePrimitiveClasses[runtime];

  const RuntimeButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, ...props }, ref) => (
      <Button {...props} className={cx(classes.buttonClass, className)} ref={ref} />
    ),
  );
  RuntimeButton.displayName = `${runtime}-StorybookButton`;

  const RuntimeInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => (
      <Input {...props} className={cx(classes.inputClass, className)} ref={ref} />
    ),
  );
  RuntimeInput.displayName = `${runtime}-StorybookInput`;

  const RuntimeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
      <Textarea {...props} className={cx(classes.textareaClass, className)} ref={ref} />
    ),
  );
  RuntimeTextarea.displayName = `${runtime}-StorybookTextarea`;

  const RuntimePopover = ({
    panelClassName,
    rootClassName,
    triggerClassName,
    triggerLabelClassName,
    triggerValueClassName,
    ...props
  }: PopoverProps) => (
    <Popover
      {...props}
      panelClassName={cx(classes.popoverPanelClass, panelClassName)}
      rootClassName={cx(primitivePopoverRootClass, rootClassName)}
      triggerClassName={cx(classes.popoverTriggerClass, triggerClassName)}
      triggerLabelClassName={cx(classes.popoverLabelClass, triggerLabelClassName)}
      triggerValueClassName={cx(classes.popoverValueClass, triggerValueClassName)}
    />
  );

  const RuntimeModal = ({
    backdropClassName,
    closeButtonClassName,
    frameClassName,
    ...props
  }: ModalProps): ReactPortal | null =>
    Modal({
      ...props,
      backdropClassName: cx(classes.modalBackdropClass, backdropClassName),
      closeButtonClassName: cx(classes.modalCloseButtonClass, closeButtonClassName),
      frameClassName: cx(classes.modalFrameClass, frameClassName),
    });

  const RuntimeTooltip = ({ contentClassName, portalClassName, ...props }: TooltipProps) => (
    <Tooltip
      {...props}
      contentClassName={cx(classes.tooltipContentClass, contentClassName)}
      portalClassName={cx(primitiveTooltipPortalClass, portalClassName)}
    />
  );

  return {
    Button: RuntimeButton,
    Input: RuntimeInput,
    Modal: RuntimeModal,
    Popover: RuntimePopover,
    Textarea: RuntimeTextarea,
    Tooltip: RuntimeTooltip,
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
  gap: '4',
  p: '4',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'surface',
  alignContent: 'start',
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

const primitivePreviewSurfaceClass = css({
  display: 'grid',
  gap: '3',
  alignContent: 'start',
  justifyItems: 'start',
});

const primitiveTooltipPreviewSurfaceClass = css({
  minHeight: '20',
});

const primitivePopoverPreviewSurfaceClass = css({
  minHeight: '24',
});

const primitivePopoverPreviewRootClass = css({
  width: 'full',
  justifyItems: 'start',
});

const primitivePopoverPreviewPanelClass = css({
  left: '0',
  right: '[auto]',
});

const primitiveModalPreviewSurfaceClass = css({
  display: 'grid',
  justifyItems: 'start',
});

const primitiveModalPreviewFrameClass = css({
  position: 'relative',
  display: 'grid',
  gap: '3',
  width: 'full',
  maxWidth: 'sm',
  p: '4',
  borderRadius: '2xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  bg: 'surface',
  boxShadow: 'md',
});

const primitiveModalPreviewCloseButtonClass = css({
  position: 'absolute',
  top: '2.5',
  right: '2.5',
  color: 'primary',
  fontSize: '2xl',
  lineHeight: 'none',
});

const defaultPrimitivePreviewClasses: RuntimePrimitiveClasses = {
  buttonClass: primitiveButtonClass,
  inputClass: primitiveInputClass,
  modalBackdropClass: primitiveModalBackdropClass,
  modalCloseButtonClass: primitiveModalCloseButtonClass,
  modalFrameClass: primitiveModalFrameClass,
  popoverLabelClass: primitivePopoverLabelClass,
  popoverPanelClass: primitivePopoverPanelClass,
  popoverTriggerClass: primitivePopoverTriggerClass,
  popoverValueClass: primitivePopoverValueClass,
  textareaClass: primitiveTextareaClass,
  tooltipContentClass: primitiveTooltipContentClass,
};

type PrimitiveRegistryShowcasePreviewProps = {
  previewClasses: RuntimePrimitiveClasses;
};

const PrimitiveRegistryShowcasePreview = ({
  previewClasses,
}: PrimitiveRegistryShowcasePreviewProps) => {
  const {
    Button: PrimitiveButton,
    Input: PrimitiveInput,
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
          <div className={cx(primitivePreviewSurfaceClass, primitiveTooltipPreviewSurfaceClass)}>
            <PrimitiveTooltip
              content="Branded tooltip shell"
              forceOpen
              portalClassName="[position:static!important] [display:inline-flex] [visibility:visible!important]"
              preferredPlacement="bottom"
            >
              <PrimitiveButton variant="ghost">Hover target</PrimitiveButton>
            </PrimitiveTooltip>
          </div>
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
          <div className={cx(primitivePreviewSurfaceClass, primitivePopoverPreviewSurfaceClass)}>
            <PrimitivePopover
              isOpen
              panelLabel="Popover example"
              panelClassName={primitivePopoverPreviewPanelClass}
              rootClassName={primitivePopoverPreviewRootClass}
              triggerAriaLabel="Open custom trigger popover"
              triggerContent={<span>Custom trigger</span>}
              triggerTone="white"
              triggerVariant="ghost"
            >
              <p className={primitiveShowcaseValueClass}>Popover panel content</p>
            </PrimitivePopover>
          </div>
          <p className={primitiveShowcaseValueClass}>
            Trigger and panel chrome can be swapped while keeping grouped helper behavior intact.
          </p>
        </div>

        <div className={primitiveShowcaseCardClass}>
          <p className={primitiveShowcaseLabelClass}>Modal</p>
          <div className={primitiveModalPreviewSurfaceClass}>
            <div className={cx(primitiveModalPreviewFrameClass, previewClasses.modalFrameClass)}>
              <button
                aria-label="Close preview modal"
                className={cx(
                  primitiveModalPreviewCloseButtonClass,
                  previewClasses.modalCloseButtonClass,
                )}
                type="button"
              >
                ×
              </button>
              <div className={primitiveShowcaseLayoutClass}>
                <p className={primitiveShowcaseValueClass}>Host modal frame preview</p>
                <PrimitiveInput defaultValue="Modal field" aria-label="Host modal input preview" />
              </div>
            </div>
          </div>
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
    <PrimitiveRegistryShowcasePreview previewClasses={defaultPrimitivePreviewClasses} />
  </MarkdownPrimitiveProvider>
);

type StorybookRuntimePrimitiveRegistryShowcaseProps = {
  runtime: StorybookRuntimePreset;
};

/**
 * Renders the primitive showcase with one concrete host runtime preset applied.
 */
export const StorybookRuntimePrimitiveRegistryShowcase = ({
  runtime,
}: StorybookRuntimePrimitiveRegistryShowcaseProps) => (
  <div style={getStorybookRuntimeThemeStyle(runtime)}>
    <MarkdownPrimitiveProvider registry={createStorybookRuntimePrimitiveRegistry(runtime)}>
      <PrimitiveRegistryShowcasePreview previewClasses={runtimePrimitiveClasses[runtime]} />
    </MarkdownPrimitiveProvider>
  </div>
);
