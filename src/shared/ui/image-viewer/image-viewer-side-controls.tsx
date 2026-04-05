'use client';

import React from 'react';
import { cx } from 'styled-system/css';

import { Button } from '@/shared/ui/button/button';
import { ChevronRightIcon } from '@/shared/ui/icons/app-icons';
import {
  sideButtonClass,
  sideButtonLeftClass,
  sideButtonLeftIconClass,
  sideButtonRightClass,
  viewerControlButtonClass,
} from '@/shared/ui/image-viewer/image-viewer-modal.panda';

/**
 * Defines labels and handlers for the image viewer navigation buttons.
 */
export type ImageViewerSideControlsProps = {
  nextAriaLabel: string;
  onNext: () => void;
  onPrevious: () => void;
  previousAriaLabel: string;
  stopClickPropagation: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Renders the previous and next navigation buttons for the image viewer.
 *
 * @param props Navigation labels and click handlers.
 * @returns Side navigation controls for the image viewer.
 */
export const ImageViewerSideControls = React.memo(
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
