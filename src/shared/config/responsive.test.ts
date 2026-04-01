// @vitest-environment node

import { describe, expect, it } from 'vitest';

import {
  VIEWPORT_BREAKPOINTS,
  viewportImageSizes,
  viewportMediaQuery,
} from '@/shared/config/responsive';

describe('responsive config', () => {
  it('Under the responsive config, it must expose only the canonical viewport ranges as the source of truth', () => {
    expect(VIEWPORT_BREAKPOINTS.mobileSmallMax).toBe(480);
    expect(VIEWPORT_BREAKPOINTS.mobileLargeMax).toBe(768);
    expect(VIEWPORT_BREAKPOINTS.tabletMax).toBe(960);
    expect(VIEWPORT_BREAKPOINTS.desktopMin).toBe(961);
    expect(VIEWPORT_BREAKPOINTS.desktopMax).toBe(1280);
  });

  it('Under the canonical breakpoints, it must derive shared media query strings', () => {
    expect(viewportMediaQuery.mobileSmallDown).toBe('(max-width: 480px)');
    expect(viewportMediaQuery.mobileLargeUp).toBe('(min-width: 481px)');
    expect(viewportMediaQuery.mobileLargeDown).toBe('(max-width: 768px)');
    expect(viewportMediaQuery.tabletUp).toBe('(min-width: 769px)');
    expect(viewportMediaQuery.tabletDown).toBe('(max-width: 960px)');
    expect(viewportMediaQuery.desktopUp).toBe('(min-width: 961px)');
    expect(viewportMediaQuery.desktopDown).toBe('(max-width: 1280px)');
  });

  it('Under responsive image sizing, it must reuse the same breakpoint values', () => {
    expect(viewportImageSizes.imageSourceField).toBe('(max-width: 480px) 100vw, 480px');
  });
});
