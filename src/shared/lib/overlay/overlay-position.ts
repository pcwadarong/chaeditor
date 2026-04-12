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
 * 오버레이의 좌측 기준점을 viewport 안쪽으로 고정합니다.
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
 * Popover의 선호 정렬을 유지하되 viewport 밖으로 넘치지 않는 좌표를 계산합니다.
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
 * Tooltip의 좌표와 실제 배치 방향을 viewport 기준으로 계산합니다.
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
  const placement: OverlayPreferredPlacement =
    preferredPlacement === 'bottom'
      ? 'bottom'
      : preferredPlacement === 'top'
        ? 'top'
        : canPlaceAbove || !canPlaceBelow
          ? 'top'
          : 'bottom';

  const unclampedTop = placement === 'top' ? topPlacementTop : bottomPlacementTop;
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
