// @vitest-environment node

import {
  clampOverlayLeft,
  resolvePopoverPortalLeft,
  resolveTooltipViewportPosition,
} from '@/shared/lib/overlay/overlay-position';

describe('overlay-position', () => {
  it('Under a right-edge overflow, clampOverlayLeft must keep the overlay inside the viewport padding', () => {
    expect(
      clampOverlayLeft({
        overlayWidth: 180,
        preferredLeft: 220,
        viewportPadding: 12,
        viewportWidth: 320,
      }),
    ).toBe(128);
  });

  it('Under an end-aligned popover near the right edge, resolvePopoverPortalLeft must shift the panel left', () => {
    expect(
      resolvePopoverPortalLeft({
        overlayWidth: 180,
        placement: 'end',
        triggerLeft: 260,
        triggerRight: 300,
        viewportPadding: 12,
        viewportWidth: 320,
      }),
    ).toBe(120);
  });

  it('Under an auto tooltip with no room above, resolveTooltipViewportPosition must place it below', () => {
    expect(
      resolveTooltipViewportPosition({
        gap: 8,
        preferredPlacement: 'auto',
        tooltipHeight: 32,
        tooltipWidth: 100,
        triggerRect: {
          bottom: 24,
          height: 16,
          left: 10,
          right: 30,
          top: 8,
          width: 20,
        },
        viewportHeight: 200,
        viewportPadding: 8,
        viewportWidth: 320,
      }),
    ).toEqual({
      left: 8,
      placement: 'bottom',
      top: 32,
    });
  });

  it('Under a tooltip near the right edge, resolveTooltipViewportPosition must clamp the horizontal position', () => {
    expect(
      resolveTooltipViewportPosition({
        gap: 8,
        preferredPlacement: 'top',
        tooltipHeight: 28,
        tooltipWidth: 120,
        triggerRect: {
          bottom: 64,
          height: 20,
          left: 290,
          right: 310,
          top: 44,
          width: 20,
        },
        viewportHeight: 240,
        viewportPadding: 12,
        viewportWidth: 320,
      }),
    ).toEqual({
      left: 188,
      placement: 'top',
      top: 12,
    });
  });
});
