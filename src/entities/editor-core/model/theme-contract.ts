export const CHAEDITOR_THEME_VARIABLES = {
  border: '--chaeditor-color-border',
  borderStrong: '--chaeditor-color-border-strong',
  focusRing: '--chaeditor-color-focus-ring',
  monoFont: '--chaeditor-font-mono',
  muted: '--chaeditor-color-muted',
  overlayBackdrop: '--chaeditor-color-overlay-backdrop',
  primary: '--chaeditor-color-primary',
  primaryContrast: '--chaeditor-color-primary-contrast',
  primaryHover: '--chaeditor-color-primary-hover',
  primaryMuted: '--chaeditor-color-primary-muted',
  primarySubtle: '--chaeditor-color-primary-subtle',
  sansFont: '--chaeditor-font-sans',
  sansJaFont: '--chaeditor-font-sans-ja',
  success: '--chaeditor-color-success',
  surface: '--chaeditor-color-surface',
  surfaceMuted: '--chaeditor-color-surface-muted',
  surfaceStrong: '--chaeditor-color-surface-strong',
  text: '--chaeditor-color-text',
  textSubtle: '--chaeditor-color-text-subtle',
  error: '--chaeditor-color-error',
} as const;

export type ChaeditorThemeVariableName =
  (typeof CHAEDITOR_THEME_VARIABLES)[keyof typeof CHAEDITOR_THEME_VARIABLES];

export type ChaeditorThemeDefinition = Partial<{
  border: string;
  borderStrong: string;
  error: string;
  focusRing: string;
  monoFont: string;
  muted: string;
  overlayBackdrop: string;
  primary: string;
  primaryContrast: string;
  primaryHover: string;
  primaryMuted: string;
  primarySubtle: string;
  sansFont: string;
  sansJaFont: string;
  success: string;
  surface: string;
  surfaceMuted: string;
  surfaceStrong: string;
  text: string;
  textSubtle: string;
}>;

export const CHAEDITOR_THEME_DEFAULTS = {
  dark: {
    border: '#52525b',
    borderStrong: '#71717a',
    error: '#f87171',
    focusRing: '#1e3a8a',
    muted: '#a1a1aa',
    overlayBackdrop: 'rgb(9 9 11 / 0.82)',
    primary: '#93c5fd',
    primaryContrast: '#18181b',
    primaryHover: '#bfdbfe',
    primaryMuted: '#1e40af',
    primarySubtle: '#1e3a8a',
    success: '#4ade80',
    surface: '#18181b',
    surfaceMuted: '#27272a',
    surfaceStrong: '#3f3f46',
    text: '#fafafa',
    textSubtle: '#d4d4d8',
  },
  fonts: {
    mono: "var(--font-d2coding), 'D2Coding', 'SFMono-Regular', 'JetBrains Mono', Consolas, 'Liberation Mono', monospace",
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sansJa:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif",
  },
  light: {
    border: '#d4d4d8',
    borderStrong: '#a1a1aa',
    error: '#ef4444',
    focusRing: '#dbeafe',
    muted: '#71717a',
    overlayBackdrop: 'rgb(15 23 42 / 0.86)',
    primary: '#3b82f6',
    primaryContrast: '#ffffff',
    primaryHover: '#2563eb',
    primaryMuted: '#dbeafe',
    primarySubtle: '#eff6ff',
    success: '#22c55e',
    surface: '#ffffff',
    surfaceMuted: '#f4f4f5',
    surfaceStrong: '#e4e4e7',
    text: '#18181b',
    textSubtle: '#52525b',
  },
} as const;

/**
 * Converts semantic theme values into CSS custom properties that a host app can attach
 * to any wrapper element, :root, or theme scope.
 */
export const createChaeditorThemeVars = (theme: ChaeditorThemeDefinition) => {
  const vars: Partial<Record<ChaeditorThemeVariableName, string>> = {};

  if (theme.border) vars[CHAEDITOR_THEME_VARIABLES.border] = theme.border;
  if (theme.borderStrong) vars[CHAEDITOR_THEME_VARIABLES.borderStrong] = theme.borderStrong;
  if (theme.error) vars[CHAEDITOR_THEME_VARIABLES.error] = theme.error;
  if (theme.focusRing) vars[CHAEDITOR_THEME_VARIABLES.focusRing] = theme.focusRing;
  if (theme.monoFont) vars[CHAEDITOR_THEME_VARIABLES.monoFont] = theme.monoFont;
  if (theme.muted) vars[CHAEDITOR_THEME_VARIABLES.muted] = theme.muted;
  if (theme.overlayBackdrop) {
    vars[CHAEDITOR_THEME_VARIABLES.overlayBackdrop] = theme.overlayBackdrop;
  }
  if (theme.primary) vars[CHAEDITOR_THEME_VARIABLES.primary] = theme.primary;
  if (theme.primaryContrast) {
    vars[CHAEDITOR_THEME_VARIABLES.primaryContrast] = theme.primaryContrast;
  }
  if (theme.primaryHover) vars[CHAEDITOR_THEME_VARIABLES.primaryHover] = theme.primaryHover;
  if (theme.primaryMuted) vars[CHAEDITOR_THEME_VARIABLES.primaryMuted] = theme.primaryMuted;
  if (theme.primarySubtle) vars[CHAEDITOR_THEME_VARIABLES.primarySubtle] = theme.primarySubtle;
  if (theme.sansFont) vars[CHAEDITOR_THEME_VARIABLES.sansFont] = theme.sansFont;
  if (theme.sansJaFont) vars[CHAEDITOR_THEME_VARIABLES.sansJaFont] = theme.sansJaFont;
  if (theme.success) vars[CHAEDITOR_THEME_VARIABLES.success] = theme.success;
  if (theme.surface) vars[CHAEDITOR_THEME_VARIABLES.surface] = theme.surface;
  if (theme.surfaceMuted) vars[CHAEDITOR_THEME_VARIABLES.surfaceMuted] = theme.surfaceMuted;
  if (theme.surfaceStrong) vars[CHAEDITOR_THEME_VARIABLES.surfaceStrong] = theme.surfaceStrong;
  if (theme.text) vars[CHAEDITOR_THEME_VARIABLES.text] = theme.text;
  if (theme.textSubtle) vars[CHAEDITOR_THEME_VARIABLES.textSubtle] = theme.textSubtle;

  return vars;
};
