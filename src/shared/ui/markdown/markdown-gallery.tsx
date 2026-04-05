'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { cx } from 'styled-system/css';

import type { MarkdownImageViewerItem } from '@/shared/lib/markdown/collect-markdown-images';
import { ChevronRightIcon } from '@/shared/ui/icons/app-icons';
import {
  galleryFrameClass,
  galleryImageClass,
  galleryNavButtonClass,
  galleryNextButtonClass,
  galleryPrevButtonClass,
  galleryPrevIconClass,
  galleryProgressClass,
  galleryProgressValueClass,
  gallerySlideClass,
  galleryTitleClass,
  galleryTrackClass,
  galleryViewportClass,
} from '@/shared/ui/markdown/markdown-gallery.panda';
import { MarkdownImage } from '@/shared/ui/markdown/markdown-image';

type MarkdownGalleryProps = {
  galleryId: string;
  items: MarkdownImageViewerItem[];
};

/**
 * Reassigns gallery image viewer ids within the current gallery scope.
 */
const createScopedViewerItems = ({
  galleryId,
  items,
}: MarkdownGalleryProps): MarkdownImageViewerItem[] =>
  items.map((item, index) => ({
    ...item,
    viewerId: `${galleryId}-image-${index}`,
  }));

/**
 * Resolves the nearest slide index for the current scroll position.
 */
const resolveActiveSlideIndex = (container: HTMLElement, totalCount: number) => {
  if (totalCount <= 1) return 0;

  const slideElements = Array.from(
    container.querySelectorAll<HTMLElement>('[data-markdown-gallery-slide="true"]'),
  );

  if (slideElements.length === 0) return 0;

  const nearestSlide = slideElements.reduce(
    (closest, slide, index) => {
      const distance = Math.abs(slide.offsetLeft - container.scrollLeft);

      if (distance < closest.distance) {
        return {
          distance,
          index,
        };
      }

      return closest;
    },
    {
      distance: Number.POSITIVE_INFINITY,
      index: 0,
    },
  );

  return Math.min(Math.max(nearestSlide.index, 0), totalCount - 1);
};

/**
 * Scrolls the gallery so the target slide aligns with the viewport start.
 */
const scrollToSlide = (container: HTMLElement, index: number) => {
  const slideElements = Array.from(
    container.querySelectorAll<HTMLElement>('[data-markdown-gallery-slide="true"]'),
  );
  const targetSlide = slideElements[index];

  if (!targetSlide) return;

  container.scrollTo({
    behavior: 'smooth',
    left: targetSlide.offsetLeft,
  });
};

/**
 * Renders a markdown gallery block as a horizontal slider.
 */
export const MarkdownGallery = ({ galleryId, items }: MarkdownGalleryProps) => {
  const scopedViewerItems = createScopedViewerItems({
    galleryId,
    items,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let rafId = 0;

    const syncActiveIndex = () => {
      rafId = 0;
      setActiveIndex(resolveActiveSlideIndex(container, scopedViewerItems.length));
    };

    const handleScroll = () => {
      if (rafId) return;

      rafId = window.requestAnimationFrame(syncActiveIndex);
    };

    syncActiveIndex();
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [scopedViewerItems.length]);

  if (scopedViewerItems.length === 0) return null;

  return (
    <section
      aria-labelledby={titleId}
      className={galleryFrameClass}
      data-markdown-gallery="true"
      data-markdown-gallery-count={scopedViewerItems.length}
    >
      <h2 className={galleryTitleClass} id={titleId}>
        Image gallery
      </h2>
      <div className={galleryViewportClass}>
        <div className={galleryTrackClass} data-markdown-gallery-track="true" ref={containerRef}>
          {scopedViewerItems.map((item, index) => (
            <figure
              className={gallerySlideClass}
              data-markdown-gallery-slide="true"
              key={item.viewerId}
            >
              <MarkdownImage
                alt={item.alt}
                className={galleryImageClass}
                imageIndex={index}
                src={item.src}
                viewerItems={scopedViewerItems}
              />
            </figure>
          ))}
        </div>
        {scopedViewerItems.length > 1 && activeIndex > 0 ? (
          <>
            <button
              aria-label="Previous image"
              className={cx(galleryNavButtonClass, galleryPrevButtonClass)}
              onClick={() => {
                const container = containerRef.current;
                if (!container) return;

                scrollToSlide(container, Math.max(activeIndex - 1, 0));
              }}
              type="button"
            >
              <ChevronRightIcon
                aria-hidden="true"
                className={galleryPrevIconClass}
                color="text"
                size={28}
              />
            </button>
          </>
        ) : null}
        {scopedViewerItems.length > 1 && activeIndex < scopedViewerItems.length - 1 ? (
          <>
            <button
              aria-label="Next image"
              className={cx(galleryNavButtonClass, galleryNextButtonClass)}
              onClick={() => {
                const container = containerRef.current;
                if (!container) return;

                scrollToSlide(container, Math.min(activeIndex + 1, scopedViewerItems.length - 1));
              }}
              type="button"
            >
              <ChevronRightIcon aria-hidden="true" color="text" size={28} />
            </button>
          </>
        ) : null}
      </div>
      {scopedViewerItems.length > 1 ? (
        <div
          aria-label={`Image ${activeIndex + 1} of ${scopedViewerItems.length}`}
          aria-valuemax={scopedViewerItems.length}
          aria-valuemin={1}
          aria-valuenow={activeIndex + 1}
          className={galleryProgressClass}
          role="progressbar"
        >
          <div
            className={galleryProgressValueClass}
            style={{
              left: `${(activeIndex / scopedViewerItems.length) * 100}%`,
              width: `${100 / scopedViewerItems.length}%`,
            }}
          />
        </div>
      ) : null}
    </section>
  );
};
