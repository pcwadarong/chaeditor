'use client';

import React from 'react';

import {
  ACCEPTED_IMAGE_FILE_TYPES,
  ACCEPTED_IMAGE_FORMAT_LABEL,
} from '@/features/edit-markdown/image';
import {
  fileInputClass,
  headerButtonGroupClass,
  headerTopRowClass,
  metaTextClass,
  modalHeaderClass,
  modalTitleClass,
  uploadButtonLabelClass,
  uploadButtonWrapClass,
} from '@/features/edit-markdown/image/ui/image-embed-modal.panda';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type ImageEmbedModalHeaderProps = {
  canAddRow: boolean;
  isEmptyState: boolean;
  isImageUploadEnabled: boolean;
  isUploading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleUrlPanel: () => void;
};

/**
 * Renders the modal title, supported format copy, and top-level add actions.
 *
 * @param props Header state and action handlers.
 * @returns The modal header section.
 */
export const ImageEmbedModalHeader = ({
  canAddRow,
  isEmptyState,
  isImageUploadEnabled,
  isUploading,
  onFileChange,
  onToggleUrlPanel,
}: ImageEmbedModalHeaderProps) => {
  const { Button } = useMarkdownPrimitives();

  return (
    <header className={modalHeaderClass}>
      <div className={headerTopRowClass}>
        <h2 className={modalTitleClass}>Insert images</h2>
        {!isEmptyState ? (
          <div className={headerButtonGroupClass}>
            <label className={uploadButtonWrapClass}>
              <span aria-live="polite" className={uploadButtonLabelClass} role="status">
                {isUploading ? 'Uploading...' : 'Upload multiple'}
              </span>
              <input
                accept={ACCEPTED_IMAGE_FILE_TYPES}
                aria-label="Upload image files"
                className={fileInputClass}
                disabled={isUploading || !canAddRow || !isImageUploadEnabled}
                multiple
                onChange={onFileChange}
                type="file"
              />
            </label>
            <Button disabled={!canAddRow} onClick={onToggleUrlPanel} size="sm" tone="white">
              Add URLs
            </Button>
          </div>
        ) : null}
      </div>
      <p className={metaTextClass}>Supported formats: {ACCEPTED_IMAGE_FORMAT_LABEL}</p>
    </header>
  );
};
