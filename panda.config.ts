import { defineConfig } from '@pandacss/dev';

import {
  CHAEDITOR_THEME_DEFAULTS,
  CHAEDITOR_THEME_VARIABLES,
} from './src/entities/editor-core/model/theme-contract';

const withCssVar = (variableName: string, fallbackValue: string) =>
  `var(${variableName}, ${fallbackValue})`;

export default defineConfig({
  preflight: true,
  jsxFramework: 'react',
  outdir: 'styled-system',
  strictTokens: true,
  gitignore: false,
  cssVarRoot: ':where(:root, :host)',
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [
    './styled-system/**/*',
    './src/**/*.test.{js,jsx,ts,tsx}',
    './src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  conditions: {
    extend: {
      dark: '[data-theme="dark"] &',
    },
  },
  theme: {
    extend: {
      breakpoints: {
        sm: '480px',
        md: '768px',
        lg: '960px',
        xl: '1280px',
      },
      tokens: {
        fontSizes: {
          32: { value: '2rem' },
        },
        fonts: {
          sans: {
            value: withCssVar(
              CHAEDITOR_THEME_VARIABLES.sansFont,
              CHAEDITOR_THEME_DEFAULTS.fonts.sans,
            ),
          },
          sansJa: {
            value: withCssVar(
              CHAEDITOR_THEME_VARIABLES.sansJaFont,
              CHAEDITOR_THEME_DEFAULTS.fonts.sansJa,
            ),
          },
          mono: {
            value: withCssVar(
              CHAEDITOR_THEME_VARIABLES.monoFont,
              CHAEDITOR_THEME_DEFAULTS.fonts.mono,
            ),
          },
        },
        shadows: {
          floating: {
            value: '0 18px 32px rgb(15 23 42 / 0.18)',
          },
        },
      },
      semanticTokens: {
        colors: {
          surface: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surface,
                CHAEDITOR_THEME_DEFAULTS.light.surface,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surface,
                CHAEDITOR_THEME_DEFAULTS.dark.surface,
              ),
            },
          },
          appBackdrop: {
            value: {
              base: '{colors.zinc.50}',
              _dark: '{colors.zinc.950}',
            },
          },
          surfaceMuted: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surfaceMuted,
                CHAEDITOR_THEME_DEFAULTS.light.surfaceMuted,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surfaceMuted,
                CHAEDITOR_THEME_DEFAULTS.dark.surfaceMuted,
              ),
            },
          },
          surfaceStrong: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surfaceStrong,
                CHAEDITOR_THEME_DEFAULTS.light.surfaceStrong,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.surfaceStrong,
                CHAEDITOR_THEME_DEFAULTS.dark.surfaceStrong,
              ),
            },
          },
          text: {
            value: {
              base: withCssVar(CHAEDITOR_THEME_VARIABLES.text, CHAEDITOR_THEME_DEFAULTS.light.text),
              _dark: withCssVar(CHAEDITOR_THEME_VARIABLES.text, CHAEDITOR_THEME_DEFAULTS.dark.text),
            },
          },
          muted: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.muted,
                CHAEDITOR_THEME_DEFAULTS.light.muted,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.muted,
                CHAEDITOR_THEME_DEFAULTS.dark.muted,
              ),
            },
          },
          border: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.border,
                CHAEDITOR_THEME_DEFAULTS.light.border,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.border,
                CHAEDITOR_THEME_DEFAULTS.dark.border,
              ),
            },
          },
          borderStrong: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.borderStrong,
                CHAEDITOR_THEME_DEFAULTS.light.borderStrong,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.borderStrong,
                CHAEDITOR_THEME_DEFAULTS.dark.borderStrong,
              ),
            },
          },
          primary: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primary,
                CHAEDITOR_THEME_DEFAULTS.light.primary,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primary,
                CHAEDITOR_THEME_DEFAULTS.dark.primary,
              ),
            },
          },
          primarySubtle: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primarySubtle,
                CHAEDITOR_THEME_DEFAULTS.light.primarySubtle,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primarySubtle,
                CHAEDITOR_THEME_DEFAULTS.dark.primarySubtle,
              ),
            },
          },
          primaryMuted: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primaryMuted,
                CHAEDITOR_THEME_DEFAULTS.light.primaryMuted,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primaryMuted,
                CHAEDITOR_THEME_DEFAULTS.dark.primaryMuted,
              ),
            },
          },
          primaryContrast: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primaryContrast,
                CHAEDITOR_THEME_DEFAULTS.light.primaryContrast,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.primaryContrast,
                CHAEDITOR_THEME_DEFAULTS.dark.primaryContrast,
              ),
            },
          },
          focusRing: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.focusRing,
                CHAEDITOR_THEME_DEFAULTS.light.focusRing,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.focusRing,
                CHAEDITOR_THEME_DEFAULTS.dark.focusRing,
              ),
            },
          },
          textSubtle: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.textSubtle,
                CHAEDITOR_THEME_DEFAULTS.light.textSubtle,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.textSubtle,
                CHAEDITOR_THEME_DEFAULTS.dark.textSubtle,
              ),
            },
          },
          success: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.success,
                CHAEDITOR_THEME_DEFAULTS.light.success,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.success,
                CHAEDITOR_THEME_DEFAULTS.dark.success,
              ),
            },
          },
          error: {
            value: {
              base: withCssVar(
                CHAEDITOR_THEME_VARIABLES.error,
                CHAEDITOR_THEME_DEFAULTS.light.error,
              ),
              _dark: withCssVar(
                CHAEDITOR_THEME_VARIABLES.error,
                CHAEDITOR_THEME_DEFAULTS.dark.error,
              ),
            },
          },
        },
      },
    },
  },
});
