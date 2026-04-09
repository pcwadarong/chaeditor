import { describe, expect, it } from 'vitest';

import { BREAKPOINTS, imageSizes, mediaQueryDown, mediaQueryUp } from '@/shared/config/breakpoints';

describe('breakpoint config', () => {
  it('Under the package breakpoint scale, it must expose the canonical sm md lg xl values', () => {
    expect(BREAKPOINTS.sm).toBe(480);
    expect(BREAKPOINTS.md).toBe(768);
    expect(BREAKPOINTS.lg).toBe(960);
    expect(BREAKPOINTS.xl).toBe(1280);
  });

  it('Under the canonical breakpoint scale, it must derive matching min and max width media queries', () => {
    expect(mediaQueryDown.sm).toBe('(max-width: 479px)');
    expect(mediaQueryDown.md).toBe('(max-width: 767px)');
    expect(mediaQueryDown.lg).toBe('(max-width: 959px)');
    expect(mediaQueryDown.xl).toBe('(max-width: 1279px)');
    expect(mediaQueryUp.sm).toBe('(min-width: 480px)');
    expect(mediaQueryUp.md).toBe('(min-width: 768px)');
    expect(mediaQueryUp.lg).toBe('(min-width: 960px)');
    expect(mediaQueryUp.xl).toBe('(min-width: 1280px)');
  });

  it('Under responsive image sizing, it must reuse the shared breakpoint scale', () => {
    expect(imageSizes.imageSourceField).toBe('(max-width: 479px) 100vw, 480px');
  });
});
