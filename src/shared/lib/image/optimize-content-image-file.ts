'use client';

import {
  optimizeImageFile,
  resolveImageOptimizationDimensions,
} from '@/shared/lib/image/optimize-image-file';

const CONTENT_MAX_WIDTH = 1600;
const CONTENT_MAX_HEIGHT = 1600;
const CONTENT_OUTPUT_QUALITY = 0.84;

/**
 * Scales an image down to the content-image size limit.
 */
export const resolveContentOptimizationDimensions = ({
  height,
  width,
}: {
  height: number;
  width: number;
}) =>
  resolveImageOptimizationDimensions({
    height,
    maxHeight: CONTENT_MAX_HEIGHT,
    maxWidth: CONTENT_MAX_WIDTH,
    width,
  });

/**
 * Optimizes an image file for article and project content usage.
 */
export const optimizeContentImageFile = (file: File) =>
  optimizeImageFile({
    errorLabel: 'content-image-optimization',
    file,
    maxHeight: CONTENT_MAX_HEIGHT,
    maxWidth: CONTENT_MAX_WIDTH,
    outputQuality: CONTENT_OUTPUT_QUALITY,
  });
