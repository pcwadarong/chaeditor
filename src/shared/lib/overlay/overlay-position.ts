export type OverlayViewportPadding = number;

export type OverlayPreferredPlacement = 'bottom' | 'top';

type HorizontalClampInput = {
  overlayWidth: number;
  preferredLeft: number;
  viewportPadding: OverlayViewportPadding;
  viewportWidth: number;
};

type PopoverPortalLeftInput = {
  placement: 'end' | 'start';
  overlayWidth: number;
  triggerLeft: number;
  triggerRight: number;
  viewportPadding: OverlayViewportPadding;
  viewportWidth: number;
};

type TooltipViewportPositionInput = {
  gap: number;
  preferredPlacement: 'auto' | OverlayPreferredPlacement;
  tooltipHeight: number;
  tooltipWidth: number;
  triggerRect: Pick<DOMRect, 'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'>;
  viewportHeight: number;
  viewportPadding: OverlayViewportPadding;
  viewportWidth: number;
};

export type TooltipViewportPosition = {
  left: number;
  placement: OverlayPreferredPlacement;
  top: number;
};

/**
 * Clamps the overlay's left edge so the surface stays inside the viewport inset.
 */
export const clampOverlayLeft = ({
  overlayWidth,
  preferredLeft,
  viewportPadding,
  viewportWidth,
}: HorizontalClampInput) => {
  const maxLeft = Math.max(viewportPadding, viewportWidth - overlayWidth - viewportPadding);

  return Math.min(Math.max(preferredLeft, viewportPadding), maxLeft);
};

/**
 * Resolves the popover's portal left position while preserving preferred alignment when possible.
 */
export const resolvePopoverPortalLeft = ({
  placement,
  overlayWidth,
  triggerLeft,
  triggerRight,
  viewportPadding,
  viewportWidth,
}: PopoverPortalLeftInput) => {
  const preferredLeft = placement === 'start' ? triggerLeft : triggerRight - overlayWidth;

  return clampOverlayLeft({
    overlayWidth,
    preferredLeft,
    viewportPadding,
    viewportWidth,
  });
};

/**
 * Resolves tooltip coordinates and the final top/bottom placement against viewport constraints.
 */
export const resolveTooltipViewportPosition = ({
  gap,
  preferredPlacement,
  tooltipHeight,
  tooltipWidth,
  triggerRect,
  viewportHeight,
  viewportPadding,
  viewportWidth,
}: TooltipViewportPositionInput): TooltipViewportPosition => {
  // Center the tooltip on the trigger first, then clamp only if it would overflow.
  const preferredLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  const left = clampOverlayLeft({
    overlayWidth: tooltipWidth,
    preferredLeft,
    viewportPadding,
    viewportWidth,
  });

  const topPlacementTop = triggerRect.top - tooltipHeight - gap;
  const bottomPlacementTop = triggerRect.bottom + gap;
  const canPlaceAbove = topPlacementTop >= viewportPadding;
  const canPlaceBelow = bottomPlacementTop + tooltipHeight <= viewportHeight - viewportPadding;
  // Auto placement prefers the side with available space and falls back predictably.
  const placement: OverlayPreferredPlacement =
    preferredPlacement === 'bottom'
      ? 'bottom'
      : preferredPlacement === 'top'
        ? 'top'
        : canPlaceAbove || !canPlaceBelow
          ? 'top'
          : 'bottom';

  const unclampedTop = placement === 'top' ? topPlacementTop : bottomPlacementTop;
  // Keep the resolved top position inside the viewport even after placement is chosen.
  const top = Math.min(
    Math.max(unclampedTop, viewportPadding),
    Math.max(viewportPadding, viewportHeight - tooltipHeight - viewportPadding),
  );

  return {
    left,
    placement,
    top,
  };
};
