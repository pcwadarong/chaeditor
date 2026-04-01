import type React from 'react';

import { normalizeEmbedInput } from '@/features/edit-markdown/model/embed-popover-state';
import { normalizeImageUrl } from '@/shared/lib/url/normalize-image-url';

export type ImageInputRow = {
  alt: string;
  id: string;
  url: string;
};

export type FilledImageRow = {
  altText: string;
  id: string;
  url: string;
};

export const MAX_IMAGE_EMBED_ITEMS = 10;
export const ACCEPTED_IMAGE_FILE_TYPES =
  '.jpeg,.jpg,.png,.gif,.heic,image/jpeg,image/png,image/gif,image/heic,image/heif';
export const ACCEPTED_IMAGE_FORMAT_LABEL = 'JPEG, JPG, PNG, GIF, HEIC';

/**
 * Creates a stable image input row id and returns a fresh row object.
 *
 * @param nextId Incrementing id ref.
 * @returns A new image input row.
 */
export const createImageRow = (nextId: React.MutableRefObject<number>): ImageInputRow => {
  nextId.current += 1;

  return {
    alt: '',
    id: `image-row-${nextId.current}`,
    url: '',
  };
};

/**
 * Returns only rows that contain a usable image URL.
 *
 * @param rows Current image input rows.
 * @returns Filled image rows ready for insertion.
 */
export const getFilledImageRows = (rows: ImageInputRow[]): FilledImageRow[] =>
  rows.flatMap(row => {
    const normalizedUrl = normalizeEmbedInput(row.url);

    if (!normalizedUrl) return [];

    return [
      {
        altText: normalizeEmbedInput(row.alt) ?? 'Image description',
        id: row.id,
        url: normalizedUrl,
      },
    ];
  });

/**
 * Collects row ids whose normalized URLs are duplicated.
 *
 * @param rows Current image input rows.
 * @returns A set of duplicate row ids.
 */
export const getDuplicateRowIds = (rows: ImageInputRow[]) => {
  const seenUrls = new Map<string, string>();
  const duplicateIds = new Set<string>();

  getFilledImageRows(rows).forEach(row => {
    const firstRowId = seenUrls.get(row.url);

    if (firstRowId) {
      duplicateIds.add(firstRowId);
      duplicateIds.add(row.id);
      return;
    }

    seenUrls.set(row.url, row.id);
  });

  return duplicateIds;
};

/**
 * Merges uploaded rows into the current row list, filling empty slots first.
 *
 * @param currentRows Current input rows.
 * @param nextRows Newly created rows.
 * @returns The merged row list.
 */
export const mergeImageRows = (currentRows: ImageInputRow[], nextRows: ImageInputRow[]) => {
  const mergedRows = [...currentRows];
  let uploadCursor = 0;

  for (let index = 0; index < mergedRows.length && uploadCursor < nextRows.length; index += 1) {
    if (normalizeEmbedInput(mergedRows[index]?.url)) continue;

    mergedRows[index] = nextRows[uploadCursor];
    uploadCursor += 1;
  }

  return [...mergedRows, ...nextRows.slice(uploadCursor)];
};

/**
 * Moves a row up or down by one position.
 *
 * @param rows Current row list.
 * @param rowId Target row id.
 * @param direction Move direction.
 * @returns The reordered row list.
 */
export const reorderRows = (rows: ImageInputRow[], rowId: string, direction: 'down' | 'up') => {
  const currentIndex = rows.findIndex(row => row.id === rowId);

  if (currentIndex < 0) return rows;

  const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (nextIndex < 0 || nextIndex >= rows.length) {
    return rows;
  }

  const nextRows = [...rows];
  const [targetRow] = nextRows.splice(currentIndex, 1);

  nextRows.splice(nextIndex, 0, targetRow);

  return nextRows;
};

/**
 * Resolves a safe preview URL for next/image.
 *
 * @param value Raw row URL value.
 * @returns A previewable URL or null.
 */
export const resolvePreviewImageSrc = (value: string) => {
  const normalizedValue = normalizeEmbedInput(value);

  if (!normalizedValue) return null;

  const normalizedPreviewUrl = normalizeImageUrl(normalizedValue);

  if (!normalizedPreviewUrl?.startsWith('https://')) {
    return null;
  }

  return normalizedPreviewUrl;
};
