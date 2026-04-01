'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { css, cx } from 'styled-system/css';

import { useDialogFocusManagement } from '@/shared/lib/react/use-dialog-focus-management';
import { Button } from '@/shared/ui/button/button';
import {
  ChevronRightIcon,
  FitSizeIcon,
  ImageIcon,
  ImageQuestionIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/shared/ui/icons/app-icons';
import { createImageViewerUrl } from '@/shared/ui/image-viewer/model/create-image-viewer-url';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';
import { XButton } from '@/shared/ui/x-button/x-button';

type ImageViewerItem = {
  alt: string;
  src: string;
};

export type ImageViewerLabels = {
  actionBarAriaLabel: string;
  closeAriaLabel: string;
  fitToScreenAriaLabel: string;
  imageViewerAriaLabel?: string;
  locateSourceAriaLabel: string;
  nextAriaLabel: string;
  previousAriaLabel: string;
  selectForFrameAriaLabel: string;
  selectForFrameLabel: string;
  thumbnailListAriaLabel: string;
  zoomInAriaLabel: string;
  zoomOutAriaLabel: string;
};

type ImageViewerModalProps = {
  initialIndex: number | null;
  items: ImageViewerItem[];
  labels: ImageViewerLabels;
  onClose: () => void;
  onLocateSource?: (currentIndex: number) => void;
  onSelectCurrentImage?: (currentIndex: number) => void;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;
const IMAGE_NAVIGATION_ANIMATION_MS = 360;
const ACTION_TOOLTIP_HOLD_MS = 1200;
const DEFAULT_PAN_OFFSET = { x: 0, y: 0 } as const;

type ImageViewerPanOffset = {
  x: number;
  y: number;
};

type ImageViewerPanBoundsInput = {
  imageHeight: number;
  imageWidth: number;
  nextOffset: ImageViewerPanOffset;
  viewportHeight: number;
  viewportWidth: number;
  zoomLevel: number;
};

type ImageViewerDragState = {
  originOffset: ImageViewerPanOffset;
  pointerId: number;
  startX: number;
  startY: number;
};

type ImageViewerPointerState = {
  x: number;
  y: number;
};

type ImageViewerPinchState = {
  initialDistance: number;
  initialZoomLevel: number;
};

type ImageViewerTransitionDirection = 'next' | 'previous' | null;

/**
 * Defines labels and handlers for the image viewer navigation buttons.
 */
type ImageViewerSideControlsProps = {
  nextAriaLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  previousAriaLabel: string;
  stopClickPropagation: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Renders the previous and next navigation buttons for the image viewer.
 */
const ImageViewerSideControls = React.memo(
  ({
    nextAriaLabel,
    onNext,
    onPrevious,
    previousAriaLabel,
    stopClickPropagation,
  }: ImageViewerSideControlsProps) => (
    <>
      <Button
        aria-label={previousAriaLabel}
        className={cx(viewerControlButtonClass, sideButtonClass, sideButtonLeftClass)}
        onClick={event => {
          stopClickPropagation(event);
          onPrevious();
        }}
        tone="white"
        type="button"
        variant="ghost"
      >
        <ChevronRightIcon aria-hidden="true" className={sideButtonLeftIconClass} size={28} />
      </Button>

      <Button
        aria-label={nextAriaLabel}
        className={cx(viewerControlButtonClass, sideButtonClass, sideButtonRightClass)}
        onClick={event => {
          stopClickPropagation(event);
          onNext();
        }}
        tone="white"
        type="button"
        variant="ghost"
      >
        <ChevronRightIcon aria-hidden="true" size={28} />
      </Button>
    </>
  ),
);

ImageViewerSideControls.displayName = 'ImageViewerSideControls';

/**
 * Clamps the image viewer zoom level to a safe range.
 */
const clampZoomLevel = (zoomLevel: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel));

/**
 * Clamps the draggable offset to the visible image bounds.
 */
const clampPanOffset = ({
  imageHeight,
  imageWidth,
  nextOffset,
  viewportHeight,
  viewportWidth,
  zoomLevel,
}: ImageViewerPanBoundsInput): ImageViewerPanOffset => {
  if (zoomLevel <= 1) return DEFAULT_PAN_OFFSET;

  const maxOffsetX = Math.max((imageWidth * zoomLevel - viewportWidth) / 2, 0);
  const maxOffsetY = Math.max((imageHeight * zoomLevel - viewportHeight) / 2, 0);

  return {
    x: Math.min(maxOffsetX, Math.max(-maxOffsetX, nextOffset.x)),
    y: Math.min(maxOffsetY, Math.max(-maxOffsetY, nextOffset.y)),
  };
};

/**
 * Checks whether an event target belongs to an interactive viewer control.
 */
const isInteractiveViewerTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(target.closest('button, a, input, textarea, select, summary, [role="button"]'));

/**
 * Calculates the distance between two active pointers.
 */
const getPointerDistance = (points: ImageViewerPointerState[]) => {
  if (points.length < 2) return 0;

  const [firstPoint, secondPoint] = points;
  const deltaX = secondPoint.x - firstPoint.x;
  const deltaY = secondPoint.y - firstPoint.y;

  return Math.hypot(deltaX, deltaY);
};

/**
 * Renders the image viewer modal.
 */
export const ImageViewerModal = ({
  initialIndex,
  items,
  labels,
  onClose,
  onLocateSource,
  onSelectCurrentImage,
}: ImageViewerModalProps) => {
  const [activeActionTooltip, setActiveActionTooltip] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [panOffset, setPanOffset] = useState<ImageViewerPanOffset>(DEFAULT_PAN_OFFSET);
  const [transitionDirection, setTransitionDirection] =
    useState<ImageViewerTransitionDirection>(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const activePointersRef = useRef<Map<number, ImageViewerPointerState>>(new Map());
  const dragStateRef = useRef<ImageViewerDragState | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pinchStateRef = useRef<ImageViewerPinchState | null>(null);
  const actionTooltipTimeoutRef = useRef<number | null>(null);
  const thumbnailRailRef = useRef<HTMLDivElement | null>(null);
  const thumbnailButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const sanitizedItems = useMemo(
    () =>
      items.map(item => ({
        ...item,
        src: createImageViewerUrl(item.src),
      })),
    [items],
  );

  const isOpen = initialIndex !== null && sanitizedItems.length > 0;
  const currentItem = useMemo(
    () => sanitizedItems[currentIndex] ?? null,
    [currentIndex, sanitizedItems],
  );

  const resolvedDialogAriaLabel = useMemo(() => {
    if (!currentItem) return labels.imageViewerAriaLabel?.trim() || 'Image viewer';
    return currentItem.alt.trim() || labels.imageViewerAriaLabel?.trim() || 'Image viewer';
  }, [currentItem, labels.imageViewerAriaLabel]);

  /**
   * Navigates to an item, resets zoom state, and sets the transition direction.
   */
  const navigateToImage = useCallback(
    (nextIndex: number, direction: Exclude<ImageViewerTransitionDirection, null>) => {
      setTransitionDirection(direction);
      setTransitionKey(previousKey => previousKey + 1);
      setCurrentIndex(nextIndex);
      setPanOffset(DEFAULT_PAN_OFFSET);
      setZoomLevel(1);
    },
    [],
  );

  /**
   * Selects the previous image and wraps at the start of the list.
   */
  const handlePreviousImage = useCallback(() => {
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : sanitizedItems.length - 1;
    navigateToImage(nextIndex, 'previous');
  }, [currentIndex, navigateToImage, sanitizedItems.length]);

  /**
   * Selects the next image and wraps at the end of the list.
   */
  const handleNextImage = useCallback(() => {
    const nextIndex = currentIndex < sanitizedItems.length - 1 ? currentIndex + 1 : 0;
    navigateToImage(nextIndex, 'next');
  }, [currentIndex, navigateToImage, sanitizedItems.length]);

  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  /**
   * Scrolls back to the original position of the current image.
   */
  const handleLocateSource = useCallback(() => {
    onLocateSource?.(currentIndex);
  }, [currentIndex, onLocateSource]);

  /**
   * Confirms selection of the currently viewed image.
   */
  const handleSelectCurrentImage = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onSelectCurrentImage?.(currentIndex);
    },
    [currentIndex, onSelectCurrentImage],
  );

  /**
   * Prevents pointer focus retention on buttons to avoid stale tooltips.
   */
  const preventActionButtonMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  /**
   * Temporarily shows the action bar tooltip after tab or click interactions.
   */
  const showActionTooltipTemporarily = useCallback((tooltipText: string) => {
    setActiveActionTooltip(tooltipText);

    if (actionTooltipTimeoutRef.current !== null) {
      window.clearTimeout(actionTooltipTimeoutRef.current);
    }

    actionTooltipTimeoutRef.current = window.setTimeout(() => {
      setActiveActionTooltip(null);
      actionTooltipTimeoutRef.current = null;
    }, ACTION_TOOLTIP_HOLD_MS);
  }, []);

  /**
   * Stops propagation so internal interactions do not trigger backdrop close.
   */
  const stopViewerClickPropagation = useCallback((event: React.MouseEvent<Element>) => {
    event.stopPropagation();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(
    () => () => {
      if (actionTooltipTimeoutRef.current !== null) {
        window.clearTimeout(actionTooltipTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || initialIndex === null) return;
    setCurrentIndex(initialIndex);
    setPanOffset(DEFAULT_PAN_OFFSET);
    setTransitionDirection(null);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!transitionDirection) return;

    const timeout = window.setTimeout(() => {
      setTransitionDirection(null);
    }, IMAGE_NAVIGATION_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [transitionDirection]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
    };
  }, [isMounted, isOpen]);

  useDialogFocusManagement({
    containerRef: frameRef,
    isEnabled: isOpen && isMounted,
    onEscape: handleModalClose,
  });

  useEffect(() => {
    if (!isOpen) return;
    const rail = thumbnailRailRef.current;
    const activeButton = thumbnailButtonRefs.current[currentIndex];
    if (!rail || !activeButton) return;

    const targetLeft = activeButton.offsetLeft - (rail.clientWidth - activeButton.clientWidth) / 2;
    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const nextScrollLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));

    rail.scrollTo({ behavior: 'smooth', left: nextScrollLeft });
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = currentIndex < sanitizedItems.length - 1 ? currentIndex + 1 : 0;
        navigateToImage(nextIndex, 'next');
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : sanitizedItems.length - 1;
        navigateToImage(nextIndex, 'previous');
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentIndex, isOpen, navigateToImage, sanitizedItems.length]);

  /**
   * Clamps the next pan offset for the current layout.
   */
  const getClampedPanOffset = useCallback(
    (nextOffset: ImageViewerPanOffset, nextZoomLevel: number = zoomLevel) => {
      const imageElement = imageRef.current;
      const viewportElement = viewportRef.current;
      if (!imageElement || !viewportElement) {
        return nextZoomLevel <= 1 ? DEFAULT_PAN_OFFSET : nextOffset;
      }

      return clampPanOffset({
        imageHeight: imageElement.clientHeight,
        imageWidth: imageElement.clientWidth,
        nextOffset,
        viewportHeight: viewportElement.clientHeight,
        viewportWidth: viewportElement.clientWidth,
        zoomLevel: nextZoomLevel,
      });
    },
    [zoomLevel],
  );

  useEffect(() => {
    if (zoomLevel <= 1) {
      activePointersRef.current.clear();
      dragStateRef.current = null;
      pinchStateRef.current = null;
      setIsDraggingImage(false);
    }

    const nextOffset =
      zoomLevel <= 1 ? DEFAULT_PAN_OFFSET : getClampedPanOffset(panOffset, zoomLevel);

    if (nextOffset.x === panOffset.x && nextOffset.y === panOffset.y) return;

    setPanOffset(nextOffset);
  }, [getClampedPanOffset, panOffset, zoomLevel]);

  /**
   * Starts a pan gesture while the image is zoomed in.
   */
  const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveViewerTarget(event.target)) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      const pinchDistance = getPointerDistance(Array.from(activePointersRef.current.values()));

      if (pinchDistance > 0) {
        pinchStateRef.current = {
          initialDistance: pinchDistance,
          initialZoomLevel: zoomLevel,
        };
      }

      dragStateRef.current = null;
      setIsDraggingImage(false);
      return;
    }

    if (zoomLevel <= 1) return;

    dragStateRef.current = {
      originOffset: panOffset,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsDraggingImage(true);
  };

  /**
   * Pans the zoomed image by the current pointer delta.
   */
  const handleViewportPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
    }

    if (pinchStateRef.current && activePointersRef.current.size >= 2) {
      const nextDistance = getPointerDistance(Array.from(activePointersRef.current.values()));

      if (nextDistance > 0) {
        const nextZoomLevel = clampZoomLevel(
          pinchStateRef.current.initialZoomLevel *
            (nextDistance / pinchStateRef.current.initialDistance),
        );

        setZoomLevel(nextZoomLevel);
        setPanOffset(previousOffset => getClampedPanOffset(previousOffset, nextZoomLevel));
      }

      return;
    }

    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const nextOffset = getClampedPanOffset({
      x: dragState.originOffset.x + (event.clientX - dragState.startX),
      y: dragState.originOffset.y + (event.clientY - dragState.startY),
    });
    setPanOffset(nextOffset);
  };

  /**
   * Ends the pan gesture and releases pointer capture.
   */
  const handleViewportPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(event.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null;
    }

    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      setIsDraggingImage(false);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  /**
   * Zooms the image using wheel or trackpad gestures.
   */
  const handleViewportWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (isInteractiveViewerTarget(event.target)) return;

    event.preventDefault();

    setZoomLevel(previousZoomLevel => {
      const nextZoomLevel = clampZoomLevel(previousZoomLevel - event.deltaY * 0.0025);
      setPanOffset(previousOffset => getClampedPanOffset(previousOffset, nextZoomLevel));
      return nextZoomLevel;
    });
  };

  if (!isMounted || !isOpen || !currentItem) return null;

  return createPortal(
    <div
      className={viewerBackdropClass}
      data-image-viewer-backdrop="true"
      onClick={handleModalClose}
    >
      <div aria-hidden className={topScrimClass} />
      <div
        aria-label={resolvedDialogAriaLabel}
        aria-modal="true"
        className={viewerFrameClass}
        ref={frameRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className={viewerTopActionGroupClass}>
          {onSelectCurrentImage ? (
            <Tooltip
              content={labels.selectForFrameAriaLabel}
              contentClassName={actionTooltipClass}
              forceOpen={activeActionTooltip === labels.selectForFrameAriaLabel}
              openOnFocus={false}
              portalClassName={actionTooltipPortalClass}
              preferredPlacement="bottom"
            >
              <button
                aria-label={labels.selectForFrameAriaLabel}
                className={viewerTopActionButtonClass}
                onClick={handleSelectCurrentImage}
                onMouseDown={preventActionButtonMouseDown}
                onPointerDown={() => showActionTooltipTemporarily(labels.selectForFrameAriaLabel)}
                type="button"
              >
                <ImageIcon aria-hidden="true" size={18} />
                <span className={viewerTopActionLabelClass}>{labels.selectForFrameLabel}</span>
              </button>
            </Tooltip>
          ) : null}
          <XButton
            ariaLabel={labels.closeAriaLabel}
            className={viewerCloseButtonClass}
            onClick={event => {
              stopViewerClickPropagation(event);
              handleModalClose();
            }}
            tone="white"
          />
        </div>
        <ImageViewerSideControls
          nextAriaLabel={labels.nextAriaLabel}
          onNext={handleNextImage}
          onPrevious={handlePreviousImage}
          previousAriaLabel={labels.previousAriaLabel}
          stopClickPropagation={stopViewerClickPropagation}
        />
        <div className={viewerContentClass}>
          <div className={imageStageClass}>
            <div
              className={cx(
                imageViewportClass,
                zoomLevel > 1 ? zoomedImageViewportClass : undefined,
                isDraggingImage ? draggingImageViewportClass : undefined,
              )}
              data-image-viewer-viewport="true"
              onPointerCancel={handleViewportPointerEnd}
              onPointerDown={handleViewportPointerDown}
              onPointerMove={handleViewportPointerMove}
              onPointerUp={handleViewportPointerEnd}
              onWheel={handleViewportWheel}
              ref={viewportRef}
            >
              <div
                className={cx(
                  imageInnerClass,
                  transitionDirection === 'next' ? nextTransitionImageClass : undefined,
                  transitionDirection === 'previous' ? previousTransitionImageClass : undefined,
                )}
                data-transition-direction={transitionDirection ?? undefined}
                key={`${currentItem.src}-${transitionKey}`}
                onClick={stopViewerClickPropagation}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={currentItem.alt}
                  className={viewerImageClass}
                  data-image-viewer-image="true"
                  draggable={false}
                  ref={imageRef}
                  src={currentItem.src}
                  style={{
                    transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
                  }}
                />
              </div>

              <div
                aria-label={labels.actionBarAriaLabel}
                className={actionBarClass}
                onClick={stopViewerClickPropagation}
                onPointerDown={event => {
                  event.stopPropagation();
                }}
                role="toolbar"
              >
                <Tooltip
                  content={labels.zoomOutAriaLabel}
                  contentClassName={actionTooltipClass}
                  forceOpen={activeActionTooltip === labels.zoomOutAriaLabel}
                  openOnFocus={false}
                  portalClassName={actionTooltipPortalClass}
                  preferredPlacement="top"
                >
                  <button
                    aria-label={labels.zoomOutAriaLabel}
                    className={actionButtonClass}
                    onClick={() =>
                      setZoomLevel(previousZoomLevel => {
                        const nextZoomLevel = clampZoomLevel(previousZoomLevel - ZOOM_STEP);
                        setPanOffset(previousOffset =>
                          getClampedPanOffset(previousOffset, nextZoomLevel),
                        );
                        return nextZoomLevel;
                      })
                    }
                    onMouseDown={preventActionButtonMouseDown}
                    onPointerDown={() => showActionTooltipTemporarily(labels.zoomOutAriaLabel)}
                    type="button"
                  >
                    <ZoomOutIcon aria-hidden="true" size={18} />
                  </button>
                </Tooltip>
                <Tooltip
                  content={labels.zoomInAriaLabel}
                  contentClassName={actionTooltipClass}
                  forceOpen={activeActionTooltip === labels.zoomInAriaLabel}
                  openOnFocus={false}
                  portalClassName={actionTooltipPortalClass}
                  preferredPlacement="top"
                >
                  <button
                    aria-label={labels.zoomInAriaLabel}
                    className={actionButtonClass}
                    onClick={() =>
                      setZoomLevel(previousZoomLevel => {
                        const nextZoomLevel = clampZoomLevel(previousZoomLevel + ZOOM_STEP);
                        setPanOffset(previousOffset =>
                          getClampedPanOffset(previousOffset, nextZoomLevel),
                        );
                        return nextZoomLevel;
                      })
                    }
                    onMouseDown={preventActionButtonMouseDown}
                    onPointerDown={() => showActionTooltipTemporarily(labels.zoomInAriaLabel)}
                    type="button"
                  >
                    <ZoomInIcon aria-hidden="true" size={18} />
                  </button>
                </Tooltip>
                <Tooltip
                  content={labels.fitToScreenAriaLabel}
                  contentClassName={actionTooltipClass}
                  forceOpen={activeActionTooltip === labels.fitToScreenAriaLabel}
                  openOnFocus={false}
                  portalClassName={actionTooltipPortalClass}
                  preferredPlacement="top"
                >
                  <button
                    aria-label={labels.fitToScreenAriaLabel}
                    className={actionButtonClass}
                    onClick={() => {
                      setPanOffset(DEFAULT_PAN_OFFSET);
                      setZoomLevel(1);
                    }}
                    onMouseDown={preventActionButtonMouseDown}
                    onPointerDown={() => showActionTooltipTemporarily(labels.fitToScreenAriaLabel)}
                    type="button"
                  >
                    <FitSizeIcon aria-hidden="true" size={18} />
                  </button>
                </Tooltip>
                {onLocateSource ? (
                  <Tooltip
                    content={labels.locateSourceAriaLabel}
                    contentClassName={actionTooltipClass}
                    forceOpen={activeActionTooltip === labels.locateSourceAriaLabel}
                    openOnFocus={false}
                    portalClassName={actionTooltipPortalClass}
                    preferredPlacement="top"
                  >
                    <button
                      aria-label={labels.locateSourceAriaLabel}
                      className={actionButtonClass}
                      onClick={handleLocateSource}
                      onMouseDown={preventActionButtonMouseDown}
                      onPointerDown={() =>
                        showActionTooltipTemporarily(labels.locateSourceAriaLabel)
                      }
                      type="button"
                    >
                      <ImageQuestionIcon aria-hidden="true" size={18} />
                    </button>
                  </Tooltip>
                ) : null}
                <span aria-live="polite" className={actionTextClass}>
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div
            aria-label={labels.thumbnailListAriaLabel}
            className={thumbnailRailClass}
            onClick={stopViewerClickPropagation}
            ref={thumbnailRailRef}
          >
            <div className={thumbnailRailTrackClass}>
              {sanitizedItems.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`${
                      item.alt.trim() || labels.imageViewerAriaLabel?.trim() || 'Image viewer'
                    } ${index + 1}`}
                    key={`${item.src}-${index}`}
                    onClick={() => {
                      if (index === currentIndex) return;
                      navigateToImage(index, index > currentIndex ? 'next' : 'previous');
                    }}
                    ref={node => {
                      thumbnailButtonRefs.current[index] = node;
                    }}
                    className={cx(
                      thumbnailButtonClass,
                      isActive ? activeThumbnailButtonClass : undefined,
                    )}
                    type="button"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- The thumbnail grid needs the raw src and direct drag/focus behavior. */}
                    <img
                      alt={item.alt}
                      className={thumbnailImageClass}
                      draggable={false}
                      loading="lazy"
                      src={item.src}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/* Styles */

const viewerBackdropClass = css({
  position: 'fixed',
  inset: '0',
  zIndex: '1200',
  backgroundColor: '[rgb(15 23 42 / 0.86)]',
  display: 'grid',
  placeItems: 'center',
  p: '4',
});

const viewerFrameClass = css({
  position: 'relative',
  width: '[min(1280px,100%)]',
  height: '[min(94dvh,100%)]',
  borderRadius: '3xl',
  overflow: 'hidden',
});

const viewerContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  width: 'full',
  height: 'full',
  position: 'relative',
});

const topScrimClass = css({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  height: '[120px]',
  background: '[linear-gradient(to bottom, rgb(15 23 42 / 0.72) 0%, transparent 100%)]',
  zIndex: '5',
  pointerEvents: 'none',
});

const imageStageClass = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  minHeight: '0',
  alignItems: 'center',
});

const imageViewportClass = css({
  flex: '1',
  width: 'full',
  minHeight: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  touchAction: 'none',
});

const zoomedImageViewportClass = css({
  cursor: 'grab',
  overflow: 'hidden',
});

const draggingImageViewportClass = css({
  cursor: 'grabbing',
});

const imageInnerClass = css({
  width: 'full',
  height: 'full',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: '4',
});

const viewerImageClass = css({
  maxWidth: 'full',
  maxHeight: 'full',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  willChange: 'transform',
  transition: '[transform 140ms ease-out]',
  userSelect: 'none',
});

const nextTransitionImageClass = css({
  animation: `[image-viewer-slide-next ${IMAGE_NAVIGATION_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)]`,
});

const previousTransitionImageClass = css({
  animation: `[image-viewer-slide-previous ${IMAGE_NAVIGATION_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)]`,
});

const viewerCloseButtonClass = css({
  color: 'white',
});

const viewerTopActionGroupClass = css({
  position: 'fixed',
  top: '4',
  right: '4',
  zIndex: '10',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
});

const viewerTopActionButtonClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  minHeight: '10',
  px: '4',
  color: 'white',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.86)]',
  border: '[1px solid rgb(255 255 255 / 0.24)]',
  boxShadow: '[0 12px 32px rgb(15 23 42 / 0.28)]',
  cursor: 'pointer',
  _hover: {
    backgroundColor: '[rgb(15 23 42 / 0.94)]',
  },
});

const viewerTopActionLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  lineHeight: 'tight',
  whiteSpace: 'nowrap',
});

const viewerControlButtonClass = css({
  color: 'white',
  backgroundColor: '[rgb(15 23 42 / 0.52)]',
  borderRadius: 'full',
  zIndex: '8',
  _hover: {
    backgroundColor: '[rgb(15 23 42 / 0.64)]',
  },
});

const sideButtonClass = css({
  position: 'absolute',
  top: '[50%]',
  transform: 'translateY(-50%)',
});

const sideButtonLeftClass = css({ left: '4' });
const sideButtonRightClass = css({ right: '4' });
const sideButtonLeftIconClass = css({ transform: 'rotate(180deg)' });

const actionBarClass = css({
  position: 'absolute',
  bottom: '6',
  left: '[50%]',
  transform: '[translateX(-50%)]',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  px: '3',
  py: '1.5',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.75)]',
  zIndex: '10',
});

const actionTooltipClass = css({
  whiteSpace: 'nowrap',
  px: '3',
  py: '1.5',
  borderRadius: 'full',
  backgroundColor: '[rgb(15 23 42 / 0.92)]',
  color: 'white',
  fontSize: 'xs',
  lineHeight: 'tight',
  pointerEvents: 'none',
  zIndex: '1300',
  animation: '[image-viewer-tooltip-fade 180ms ease-out]',
});

const actionTooltipPortalClass = css({
  zIndex: '[2147483647]',
});

const actionButtonClass = css({
  width: '8',
  height: '8',
  color: 'white',
  cursor: 'pointer',
});

const actionTextClass = css({
  minWidth: '12',
  textAlign: 'center',
  color: 'zinc.200',
  fontSize: 'sm',
});

const thumbnailRailClass = css({
  width: 'full',
  overflowX: 'auto',
  overflowY: 'hidden',
});

const thumbnailRailTrackClass = css({
  display: 'flex',
  gap: '2',
  justifyContent: 'center',
  minWidth: '[max-content]',
  alignItems: 'stretch',
});

const thumbnailButtonClass = css({
  width: '[clamp(80px, 12vw, 120px)]',
  aspectRatio: '[16 / 9]',
  borderRadius: 'md',
  overflow: 'hidden',
  transition: '[all 0.2s]',
  border: '[2px solid transparent]',
  _focusVisible: {
    outline: '[4px solid var(--colors-primary)]',
    outlineOffset: '[2px]',
  },
});

const activeThumbnailButtonClass = css({
  borderColor: 'primary',
  transform: 'scale(1.05)',
});

const thumbnailImageClass = css({
  width: 'full',
  height: 'full',
  objectFit: 'cover',
});
