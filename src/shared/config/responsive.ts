const buildMinWidthMediaQuery = (width: number): `(min-width: ${number}px)` =>
  `(min-width: ${width}px)`;

const buildMaxWidthMediaQuery = (width: number): `(max-width: ${number}px)` =>
  `(max-width: ${width}px)`;

/**
 * Canonical viewport ranges shared across the app.
 */
export const VIEWPORT_BREAKPOINTS = {
  mobileSmallMax: 480,
  mobileLargeMax: 768,
  tabletMax: 960,
  desktopMin: 961,
  desktopMax: 1280,
} as const;

/**
 * Canonical media query strings shared by runtime and Panda conditions.
 */
export const viewportMediaQuery = {
  mobileSmallDown: buildMaxWidthMediaQuery(VIEWPORT_BREAKPOINTS.mobileSmallMax),
  mobileLargeUp: buildMinWidthMediaQuery(VIEWPORT_BREAKPOINTS.mobileSmallMax + 1),
  mobileLargeDown: buildMaxWidthMediaQuery(VIEWPORT_BREAKPOINTS.mobileLargeMax),
  tabletUp: buildMinWidthMediaQuery(VIEWPORT_BREAKPOINTS.mobileLargeMax + 1),
  tabletDown: buildMaxWidthMediaQuery(VIEWPORT_BREAKPOINTS.tabletMax),
  desktopUp: buildMinWidthMediaQuery(VIEWPORT_BREAKPOINTS.desktopMin),
  desktopDown: buildMaxWidthMediaQuery(VIEWPORT_BREAKPOINTS.desktopMax),
} as const;

/**
 * Reusable responsive `sizes` values for `next/image`.
 */
export const viewportImageSizes = {
  imageSourceField: `${viewportMediaQuery.mobileSmallDown} 100vw, ${VIEWPORT_BREAKPOINTS.mobileSmallMax}px`,
} as const;

/**
 * Height breakpoints used by scene-specific layouts.
 */
export const SCENE_LAYOUT_HEIGHT_THRESHOLDS = {
  contactCompactDesktopMax: 800,
} as const;
