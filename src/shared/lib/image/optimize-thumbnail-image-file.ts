'use client';

import {
  optimizeImageFile,
  resolveImageOptimizationDimensions,
} from '@/shared/lib/image/optimize-image-file';

const THUMBNAIL_MAX_WIDTH = 800;
const THUMBNAIL_MAX_HEIGHT = 800;
const THUMBNAIL_OUTPUT_QUALITY = 0.82;

/**
 * Scales an image down to the thumbnail size limit.
 */
export const resolveThumbnailOptimizationDimensions = ({
  height,
  width,
}: {
  height: number;
  width: number;
}) =>
  resolveImageOptimizationDimensions({
    height,
    maxHeight: THUMBNAIL_MAX_HEIGHT,
    maxWidth: THUMBNAIL_MAX_WIDTH,
    width,
  });

/**
 * Optimizes an image file for article and project thumbnails.
 */
export const optimizeThumbnailImageFile = (file: File) =>
  optimizeImageFile({
    errorLabel: 'thumbnail-optimization',
    file,
    maxHeight: THUMBNAIL_MAX_HEIGHT,
    maxWidth: THUMBNAIL_MAX_WIDTH,
    outputQuality: THUMBNAIL_OUTPUT_QUALITY,
  });
