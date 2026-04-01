const buildMinWidthMediaQuery = (width: number): `(min-width: ${number}px)` =>
  `(min-width: ${width}px)`;

const buildMaxWidthMediaQuery = (width: number): `(max-width: ${number}px)` =>
  `(max-width: ${width}px)`;

/**
 * Canonical breakpoint values shared across styling and runtime layout logic.
 */
export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 960,
  xl: 1280,
} as const;

/**
 * Runtime media queries aligned with the package breakpoint scale.
 */
export const mediaQueryDown = {
  sm: buildMaxWidthMediaQuery(BREAKPOINTS.sm - 1),
  md: buildMaxWidthMediaQuery(BREAKPOINTS.md - 1),
  lg: buildMaxWidthMediaQuery(BREAKPOINTS.lg - 1),
  xl: buildMaxWidthMediaQuery(BREAKPOINTS.xl - 1),
} as const;

/**
 * Runtime media queries for widths at or above a breakpoint.
 */
export const mediaQueryUp = {
  sm: buildMinWidthMediaQuery(BREAKPOINTS.sm),
  md: buildMinWidthMediaQuery(BREAKPOINTS.md),
  lg: buildMinWidthMediaQuery(BREAKPOINTS.lg),
  xl: buildMinWidthMediaQuery(BREAKPOINTS.xl),
} as const;

/**
 * Shared responsive image sizes that reuse the package breakpoint scale.
 */
export const imageSizes = {
  imageSourceField: `${mediaQueryDown.sm} 100vw, ${BREAKPOINTS.sm}px`,
} as const;
