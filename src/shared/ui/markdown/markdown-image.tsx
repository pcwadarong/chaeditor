'use client';

import React, { type ImgHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { css, cx } from 'styled-system/css';

import type { MarkdownImageViewerLabels } from '@/entities/editor-core';
import type { MarkdownImageViewerItem } from '@/shared/lib/markdown/collect-markdown-images';
import { ImageViewerModal } from '@/shared/ui/image-viewer/image-viewer-modal';

type MarkdownImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  imageIndex?: number;
  imageViewerLabels?: Partial<MarkdownImageViewerLabels>;
  viewerItems?: MarkdownImageViewerItem[];
};

const defaultMarkdownImageViewerLabels: MarkdownImageViewerLabels = {
  actionBarAriaLabel: 'Image action bar',
  closeAriaLabel: 'Close',
  fitToScreenAriaLabel: 'Fit to screen',
  imageViewerAriaLabel: 'Image viewer',
  locateSourceAriaLabel: 'Jump to image location',
  nextAriaLabel: 'View next image',
  openAriaLabel: 'Open image',
  previousAriaLabel: 'View previous image',
  selectForFrameAriaLabel: 'Select as frame image',
  selectForFrameLabel: 'Select this image',
  thumbnailListAriaLabel: 'Image thumbnail list',
  zoomInAriaLabel: 'Zoom in',
  zoomOutAriaLabel: 'Zoom out',
};

const requestNextPaint = (callback: () => void) => {
  if (typeof window === 'undefined') {
    callback();
    return 0;
  }

  return window.requestAnimationFrame(callback);
};

/**
 * Finds the closest scroll container for the current image.
 */
const resolveScrollContainer = (targetImage: HTMLElement) =>
  targetImage.closest<HTMLElement>(
    '[data-primary-scroll-region="true"], [data-scroll-region="true"]',
  );

/**
 * Scrolls the closest container so the target image is visible.
 */
const scrollImageIntoView = (targetImage: HTMLElement) => {
  const scrollContainer = resolveScrollContainer(targetImage);

  if (!scrollContainer) {
    targetImage.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });
    return;
  }

  const targetRect = targetImage.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();
  const nextTop =
    scrollContainer.scrollTop +
    (targetRect.top - containerRect.top) -
    Math.max((containerRect.height - targetRect.height) / 2, 0);

  scrollContainer.scrollTo({
    top: Math.max(nextTop, 0),
    behavior: 'auto',
  });
};

/**
 * Renders a markdown image as a keyboard-accessible viewer trigger.
 */
export const MarkdownImage = ({
  alt,
  className,
  imageIndex = 0,
  imageViewerLabels: imageViewerLabelOverrides,
  onClick,
  onKeyDown,
  src,
  viewerItems,
  ...props
}: MarkdownImageProps) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [pendingScrollTargetId, setPendingScrollTargetId] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const resolvedAlt = alt ?? '';
  const resolvedSrc = typeof src === 'string' ? src : '';
  const resolvedViewerItems =
    viewerItems && viewerItems.length > 0
      ? viewerItems
      : [{ alt: resolvedAlt, src: resolvedSrc, viewerId: 'markdown-image-0' }];
  const viewerItemId = resolvedViewerItems[imageIndex]?.viewerId ?? `markdown-image-${imageIndex}`;
  const resolvedImageViewerLabels = useMemo(
    () => ({
      actionBarAriaLabel:
        imageViewerLabelOverrides?.actionBarAriaLabel ??
        defaultMarkdownImageViewerLabels.actionBarAriaLabel,
      closeAriaLabel:
        imageViewerLabelOverrides?.closeAriaLabel ??
        defaultMarkdownImageViewerLabels.closeAriaLabel,
      fitToScreenAriaLabel:
        imageViewerLabelOverrides?.fitToScreenAriaLabel ??
        defaultMarkdownImageViewerLabels.fitToScreenAriaLabel,
      imageViewerAriaLabel:
        imageViewerLabelOverrides?.imageViewerAriaLabel ??
        defaultMarkdownImageViewerLabels.imageViewerAriaLabel,
      locateSourceAriaLabel:
        imageViewerLabelOverrides?.locateSourceAriaLabel ??
        defaultMarkdownImageViewerLabels.locateSourceAriaLabel,
      nextAriaLabel:
        imageViewerLabelOverrides?.nextAriaLabel ?? defaultMarkdownImageViewerLabels.nextAriaLabel,
      previousAriaLabel:
        imageViewerLabelOverrides?.previousAriaLabel ??
        defaultMarkdownImageViewerLabels.previousAriaLabel,
      selectForFrameAriaLabel:
        imageViewerLabelOverrides?.selectForFrameAriaLabel ??
        defaultMarkdownImageViewerLabels.selectForFrameAriaLabel,
      selectForFrameLabel:
        imageViewerLabelOverrides?.selectForFrameLabel ??
        defaultMarkdownImageViewerLabels.selectForFrameLabel,
      thumbnailListAriaLabel:
        imageViewerLabelOverrides?.thumbnailListAriaLabel ??
        defaultMarkdownImageViewerLabels.thumbnailListAriaLabel,
      zoomInAriaLabel:
        imageViewerLabelOverrides?.zoomInAriaLabel ??
        defaultMarkdownImageViewerLabels.zoomInAriaLabel,
      zoomOutAriaLabel:
        imageViewerLabelOverrides?.zoomOutAriaLabel ??
        defaultMarkdownImageViewerLabels.zoomOutAriaLabel,
    }),
    [imageViewerLabelOverrides],
  );
  const openViewerAriaLabel = resolvedAlt
    ? `${resolvedAlt} · ${
        imageViewerLabelOverrides?.openAriaLabel ?? defaultMarkdownImageViewerLabels.openAriaLabel
      }`
    : (imageViewerLabelOverrides?.openAriaLabel ?? defaultMarkdownImageViewerLabels.openAriaLabel);

  /**
   * Prevents default navigation and opens only the image viewer.
   */
  const openViewer = (
    event: React.MouseEvent<HTMLImageElement> | React.KeyboardEvent<HTMLImageElement>,
  ) => {
    if (!resolvedSrc) return;

    event.preventDefault();
    event.stopPropagation();
    setIsViewerOpen(true);
  };

  /**
   * Opens the image viewer for the clicked markdown image.
   */
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    openViewer(event);
  };

  /**
   * Opens the image viewer for keyboard activation.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLImageElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (event.key !== 'Enter' && event.key !== ' ') return;

    openViewer(event);
  };

  useEffect(() => {
    if (isViewerOpen || !pendingScrollTargetId) return;

    const targetViewerId = pendingScrollTargetId;
    let innerFrameId = 0;
    const outerFrameId = requestNextPaint(() => {
      innerFrameId = requestNextPaint(() => {
        const targetImage =
          targetViewerId === viewerItemId
            ? imageRef.current
            : (document.querySelector(
                `[data-markdown-viewer-id="${targetViewerId}"]`,
              ) as HTMLImageElement | null);

        if (targetImage) {
          scrollImageIntoView(targetImage);
        }

        setPendingScrollTargetId(null);
      });
    });

    return () => {
      if (typeof window === 'undefined') return;
      window.cancelAnimationFrame(outerFrameId);
      window.cancelAnimationFrame(innerFrameId);
    };
  }, [isViewerOpen, pendingScrollTargetId, viewerItemId]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={resolvedAlt}
        aria-haspopup="dialog"
        aria-label={openViewerAriaLabel}
        className={cx(markdownInteractiveImageClass, className)}
        data-markdown-viewer-id={viewerItemId}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={imageRef}
        role="button"
        src={resolvedSrc}
        tabIndex={0}
        {...props}
      />
      <ImageViewerModal
        initialIndex={isViewerOpen ? imageIndex : null}
        items={resolvedViewerItems}
        labels={resolvedImageViewerLabels}
        onClose={() => {
          setIsViewerOpen(false);
        }}
        onLocateSource={currentIndex => {
          const targetViewerId = resolvedViewerItems[currentIndex]?.viewerId ?? viewerItemId;
          setPendingScrollTargetId(targetViewerId);
          setIsViewerOpen(false);
        }}
      />
    </>
  );
};

const markdownInteractiveImageClass = css({
  cursor: 'zoom-in',
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[4px]',
  },
});
