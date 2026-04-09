import { describe, expect, it } from 'vitest';

import {
  CHAEDITOR_THEME_VARIABLES,
  createChaeditorThemeVars,
} from '@/entities/editor-core/model/theme-contract';

describe('createChaeditorThemeVars', () => {
  it('Under a partial theme override, createChaeditorThemeVars must return only the provided CSS variable mappings', () => {
    expect(
      createChaeditorThemeVars({
        overlayBackdrop: 'rgb(0 0 0 / 0.72)',
        primary: '#0f766e',
        primaryHover: '#115e59',
      }),
    ).toEqual({
      [CHAEDITOR_THEME_VARIABLES.overlayBackdrop]: 'rgb(0 0 0 / 0.72)',
      [CHAEDITOR_THEME_VARIABLES.primary]: '#0f766e',
      [CHAEDITOR_THEME_VARIABLES.primaryHover]: '#115e59',
    });
  });
});
