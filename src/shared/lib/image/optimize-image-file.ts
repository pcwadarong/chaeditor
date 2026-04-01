'use client';

const OUTPUT_TYPE = 'image/webp';
const OPTIMIZABLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * Resizes an image while preserving its aspect ratio.
 */
export const resolveImageOptimizationDimensions = ({
  height,
  maxHeight,
  maxWidth,
  width,
}: {
  height: number;
  maxHeight: number;
  maxWidth: number;
  width: number;
}) => {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
};

/**
 * Rewrites the optimized file name to use a `.webp` extension.
 */
const resolveOptimizedImageFileName = (fileName: string) =>
  fileName.replace(/\.[^./]+$/, '') + '.webp';

/**
 * Creates an image element from a file to inspect its natural size.
 */
const loadImageElement = (file: File, errorLabel: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`[${errorLabel}] Failed to decode the image.`));
    };

    image.src = objectUrl;
  });

/**
 * Converts a canvas result into a WebP blob.
 */
const convertCanvasToBlob = ({
  canvas,
  errorLabel,
  outputQuality,
}: {
  canvas: HTMLCanvasElement;
  errorLabel: string;
  outputQuality: number;
}) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error(`[${errorLabel}] Failed to convert the canvas to a blob.`));
          return;
        }

        resolve(blob);
      },
      OUTPUT_TYPE,
      outputQuality,
    );
  });

/**
 * Optimizes an image file to a WebP file for the requested upload kind.
 */
export const optimizeImageFile = async ({
  errorLabel,
  file,
  maxHeight,
  maxWidth,
  outputQuality,
}: {
  errorLabel: string;
  file: File;
  maxHeight: number;
  maxWidth: number;
  outputQuality: number;
}) => {
  if (!OPTIMIZABLE_IMAGE_TYPES.has(file.type)) {
    return file;
  }

  const image = await loadImageElement(file, errorLabel);
  const { height, width } = resolveImageOptimizationDimensions({
    height: image.naturalHeight,
    maxHeight,
    maxWidth,
    width: image.naturalWidth,
  });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error(`[${errorLabel}] Failed to create a canvas context.`);
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const optimizedBlob = await convertCanvasToBlob({
    canvas,
    errorLabel,
    outputQuality,
  });

  if (optimizedBlob.size >= file.size) {
    return file;
  }

  return new File([optimizedBlob], resolveOptimizedImageFileName(file.name), {
    lastModified: file.lastModified,
    type: OUTPUT_TYPE,
  });
};
