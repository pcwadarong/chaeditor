import {
  CHAEDITOR_THEME_DEFAULTS,
  CHAEDITOR_THEME_VARIABLES,
} from '@/entities/editor-core/model/theme-contract';

/**
 * Shared focus-visible ring for interactive primitives.
 */
export const focusVisibleRingStyles = {
  outlineColor: 'focusRing',
  outlineOffset: '[2px]',
  outlineStyle: 'solid',
  outlineWidth: '[2px]',
} as const;

/**
 * Shared disabled state for form-like primitives.
 */
export const disabledFieldStyles = {
  cursor: 'not-allowed',
  opacity: 0.56,
} as const;

/**
 * Shared disabled state for button-like primitives.
 */
export const disabledButtonStyles = {
  cursor: 'not-allowed',
  opacity: 0.48,
  pointerEvents: 'none',
} as const;

/**
 * Shared hover background for primary actions. Hosts can override it through the
 * public theme variable contract, while the package falls back to the current
 * primary token if no host value is provided.
 */
export const primaryHoverBackground =
  `[var(${CHAEDITOR_THEME_VARIABLES.primaryHover},var(--colors-primary))]` as const;

export const overlayBackdropColor =
  `[var(${CHAEDITOR_THEME_VARIABLES.overlayBackdrop},${CHAEDITOR_THEME_DEFAULTS.light.overlayBackdrop})]` as const;

export const overlayBackdropStyleValue = `var(${CHAEDITOR_THEME_VARIABLES.overlayBackdrop},${CHAEDITOR_THEME_DEFAULTS.light.overlayBackdrop})`;
