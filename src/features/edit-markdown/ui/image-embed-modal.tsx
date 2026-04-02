'use client';

import React, { useMemo, useRef, useState } from 'react';
import { css, cx } from 'styled-system/css';

import type { HostImageRenderer, UploadEditorImage } from '@/entities/editor-core';
import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import {
  normalizeEmbedInput,
  normalizeEmbedInputList,
  uploadImageEmbedSource,
} from '@/features/edit-markdown/model/embed-popover-state';
import {
  ACCEPTED_IMAGE_FILE_TYPES,
  ACCEPTED_IMAGE_FORMAT_LABEL,
  createImageRow,
  getDuplicateRowIds,
  getFilledImageRows,
  type ImageInputRow,
  MAX_IMAGE_EMBED_ITEMS,
  mergeImageRows,
  reorderRows,
  resolvePreviewImageSrc,
} from '@/features/edit-markdown/model/image-embed-modal-state';
import { ImageEmbedModalEditor } from '@/features/edit-markdown/ui/image-embed-modal-editor';
import { ImageEmbedModalEmptyState } from '@/features/edit-markdown/ui/image-embed-modal-empty-state';
import { Button } from '@/shared/ui/button/button';
import { ImageIcon } from '@/shared/ui/icons/app-icons';
import { Modal } from '@/shared/ui/modal/modal';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import { Textarea } from '@/shared/ui/textarea/textarea';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';

type ImageEmbedModalProps = {
  contentType: EditorContentType;
  onApply: (
    payload: {
      items: Array<{
        altText: string;
        url: string;
      }>;
      mode: 'gallery' | 'individual';
    },
    closePopover?: ClosePopover,
  ) => void;
  onUploadImage?: UploadEditorImage;
  renderImage?: HostImageRenderer;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Modal for building individual image or gallery insertion payloads from image rows.
 *
 * @param props Image modal props.
 * @returns The trigger button and modal UI.
 */
export const ImageEmbedModal = ({
  contentType,
  onApply,
  onUploadImage,
  renderImage,
  onTriggerMouseDown,
  triggerClassName,
}: ImageEmbedModalProps) => {
  const nextRowIdRef = useRef(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const emptyStateUrlInputRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedUrlInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState<ImageInputRow[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUrls, setPendingUrls] = useState('');
  const [isUrlPanelOpen, setIsUrlPanelOpen] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isMobileListCollapsed, setIsMobileListCollapsed] = useState(false);

  const isEmptyState = rows.length === 0;
  const filledRows = useMemo(() => getFilledImageRows(rows), [rows]);
  const nonEmptyRowCount = filledRows.length;
  const duplicateRowIds = useMemo(() => getDuplicateRowIds(rows), [rows]);
  const hasDuplicateUrls = duplicateRowIds.size > 0;
  const canAddRow = nonEmptyRowCount < MAX_IMAGE_EMBED_ITEMS;
  const selectedRow = rows.find(row => row.id === selectedRowId) ?? rows[0] ?? null;
  const selectedPreviewUrl = resolvePreviewImageSrc(selectedRow?.url ?? '');
  const isAddUrlsDisabled = normalizeEmbedInputList(pendingUrls).length === 0;
  const isImageUploadEnabled = Boolean(onUploadImage);

  /**
   * Applies a partial update to a row.
   *
   * @param rowId Target row id.
   * @param patch Updated row fields.
   */
  const updateRow = (rowId: string, patch: Partial<Pick<ImageInputRow, 'alt' | 'url'>>) => {
    setRows(currentRows => currentRows.map(row => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  /**
   * Submits the current rows in the requested insert mode and closes the modal.
   *
   * @param mode Insert mode.
   */
  const handleApply = (mode: 'gallery' | 'individual') => {
    if (filledRows.length === 0 || hasDuplicateUrls) return;

    setErrorMessage(null);
    onApply({
      items: filledRows.map(row => ({
        altText: row.altText,
        url: row.url,
      })),
      mode,
    });
    setRows([]);
    setSelectedRowId(null);
    setPendingUrls('');
    setIsUrlPanelOpen(false);
    setIsMobileListCollapsed(false);
    setIsOpen(false);
  };

  /**
   * Uploads dropped or selected images and merges them into the row list.
   *
   * @param files Files to upload.
   */
  const handleUploadFiles = async (files: File[]) => {
    if (!onUploadImage) {
      setErrorMessage('Image upload is not configured in the host application.');
      return;
    }

    if (files.length === 0) return;

    if (files.length > MAX_IMAGE_EMBED_ITEMS) {
      setErrorMessage(`You can select up to ${MAX_IMAGE_EMBED_ITEMS} images at a time.`);
      return;
    }

    const nextMaxLength = nonEmptyRowCount + files.length;

    if (nextMaxLength > MAX_IMAGE_EMBED_ITEMS) {
      setErrorMessage(`You can insert up to ${MAX_IMAGE_EMBED_ITEMS} images.`);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploadedResults = await Promise.all(
        files.map(file =>
          uploadImageEmbedSource({
            contentType,
            file,
            uploadEditorImage: onUploadImage,
          }),
        ),
      );
      const nextRows = files.flatMap((file, index) => {
        const uploadedUrl = uploadedResults[index]?.url;

        if (!uploadedUrl) return [];

        return [
          {
            ...createImageRow(nextRowIdRef),
            alt: file.name,
            url: uploadedUrl,
          },
        ];
      });

      setRows(currentRows => mergeImageRows(currentRows, nextRows).slice(0, MAX_IMAGE_EMBED_ITEMS));

      if (nextRows[0]) {
        setSelectedRowId(nextRows[0].id);
      }
      setIsMobileListCollapsed(false);

      if (uploadedResults.some(result => result.errorMessage)) {
        setErrorMessage('Some image uploads failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Starts an upload when the file input changes.
   *
   * @param event File input change event.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    await handleUploadFiles(files);
    event.target.value = '';
  };

  /**
   * Adds newline-separated URLs from the URL panel into the row list.
   */
  const handleAddUrls = () => {
    const normalizedUrls = normalizeEmbedInputList(pendingUrls);

    if (normalizedUrls.length === 0) return;

    if (nonEmptyRowCount + normalizedUrls.length > MAX_IMAGE_EMBED_ITEMS) {
      setErrorMessage(`You can insert up to ${MAX_IMAGE_EMBED_ITEMS} images.`);
      return;
    }

    const nextRows = normalizedUrls.map(url => ({
      ...createImageRow(nextRowIdRef),
      alt: '',
      url,
    }));

    setRows(currentRows => mergeImageRows(currentRows, nextRows).slice(0, MAX_IMAGE_EMBED_ITEMS));
    setSelectedRowId(nextRows[0]?.id ?? null);
    setPendingUrls('');
    setIsUrlPanelOpen(false);
    setIsMobileListCollapsed(false);
    setErrorMessage(null);
  };

  /**
   * Removes the specified row.
   *
   * @param rowId Row id to remove.
   */
  const handleRemoveRow = (rowId: string) => {
    setRows(currentRows => {
      const nextRows = currentRows.filter(row => row.id !== rowId);

      if (selectedRowId === rowId) {
        setSelectedRowId(nextRows[0]?.id ?? null);
      }

      if (nextRows.length === 0) {
        setIsMobileListCollapsed(false);
      }

      return nextRows;
    });
  };

  /**
   * Moves a selected row by one position.
   *
   * @param rowId Target row id.
   * @param direction Move direction.
   */
  const handleMoveRow = (rowId: string, direction: 'down' | 'up') => {
    setRows(currentRows => reorderRows(currentRows, rowId, direction));
    setSelectedRowId(rowId);
  };

  /**
   * Replaces the currently selected image with a new upload.
   *
   * @param event Replacement file input event.
   */
  const handleReplaceSelectedRowImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !selectedRow) return;
    if (!onUploadImage) {
      setErrorMessage('Image upload is not configured in the host application.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadImageEmbedSource({
        contentType,
        file,
        uploadEditorImage: onUploadImage,
      });

      if (!result.url) {
        setErrorMessage(result.errorMessage ?? 'Failed to upload the image.');
        return;
      }

      updateRow(selectedRow.id, {
        alt: normalizeEmbedInput(selectedRow.alt) ?? file.name,
        url: result.url,
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Activates the empty-state dropzone during drag over.
   *
   * @param event Drag over event.
   */
  const handleDropzoneDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  /**
   * Clears the empty-state drag state when the pointer leaves the dropzone.
   */
  const handleDropzoneDragLeave = () => {
    setIsDragActive(false);
  };

  /**
   * Handles file drops in the empty-state dropzone.
   *
   * @param event Drop event.
   */
  const handleDropzoneDrop = async (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const files = Array.from(event.dataTransfer.files ?? []);
    await handleUploadFiles(files);
  };

  const triggerButton = (
    <Button
      aria-label="Image"
      className={cx(triggerButtonClass, triggerClassName)}
      onClick={event => {
        event.currentTarget.blur();
        setIsOpen(true);
        setIsMobileListCollapsed(false);
      }}
      onMouseDown={event => {
        event.preventDefault();
        onTriggerMouseDown?.(event);
      }}
      ref={triggerRef}
      size="sm"
      tone="white"
      type="button"
      variant="ghost"
    >
      <ImageIcon aria-hidden color="text" size="sm" />
    </Button>
  );

  return (
    <>
      {isOpen ? triggerButton : <Tooltip content="Image">{triggerButton}</Tooltip>}
      <Modal
        ariaLabel="Insert images"
        closeAriaLabel="Close image insert modal"
        initialFocusRef={isEmptyState ? emptyStateUrlInputRef : selectedUrlInputRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className={modalContentClass}>
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
                      onChange={handleFileChange}
                      type="file"
                    />
                  </label>
                  <Button
                    disabled={!canAddRow}
                    onClick={() => setIsUrlPanelOpen(current => !current)}
                    size="sm"
                    tone="white"
                  >
                    Add URLs
                  </Button>
                </div>
              ) : null}
            </div>
            <p className={metaTextClass}>Supported formats: {ACCEPTED_IMAGE_FORMAT_LABEL}</p>
          </header>

          <div className={modalScrollableContentClass}>
            {isEmptyState ? (
              <ImageEmbedModalEmptyState
                acceptedFileTypes={ACCEPTED_IMAGE_FILE_TYPES}
                canAddRow={canAddRow}
                errorMessage={errorMessage}
                isImageUploadEnabled={isImageUploadEnabled}
                isDragActive={isDragActive}
                isUploading={isUploading}
                onAddUrls={handleAddUrls}
                onDropzoneDragLeave={handleDropzoneDragLeave}
                onDropzoneDragOver={handleDropzoneDragOver}
                onDropzoneDrop={handleDropzoneDrop}
                onFileChange={handleFileChange}
                onPendingUrlsChange={setPendingUrls}
                pendingUrls={pendingUrls}
                urlInputRef={emptyStateUrlInputRef}
                urlAddDisabled={isAddUrlsDisabled}
              />
            ) : (
              <>
                {isUrlPanelOpen ? (
                  <section className={urlPanelClass}>
                    <label className={fieldLabelClass} htmlFor="markdown-toolbar-image-url-panel">
                      Add web URLs
                    </label>
                    <Textarea
                      autoResize={false}
                      id="markdown-toolbar-image-url-panel"
                      onChange={event => setPendingUrls(event.target.value)}
                      placeholder={`https://example.com/image.png\nhttps://example.com/image-2.png`}
                      rows={3}
                      value={pendingUrls}
                    />
                    <div className={urlPanelActionRowClass}>
                      <p className={metaTextClass}>Enter one URL per line.</p>
                      <div className={headerButtonGroupClass}>
                        <Button
                          onClick={() => setIsUrlPanelOpen(false)}
                          size="sm"
                          tone="white"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isAddUrlsDisabled}
                          onClick={handleAddUrls}
                          size="sm"
                          tone="white"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </section>
                ) : null}
                <ImageEmbedModalEditor
                  duplicateRowIds={duplicateRowIds}
                  errorMessage={errorMessage}
                  filledRows={filledRows}
                  isImageUploadEnabled={isImageUploadEnabled}
                  isMobileListCollapsed={isMobileListCollapsed}
                  isUploading={isUploading}
                  onFileChange={handleReplaceSelectedRowImage}
                  onMoveRow={handleMoveRow}
                  onRemoveRow={handleRemoveRow}
                  onSelectRow={setSelectedRowId}
                  onToggleMobileList={() => setIsMobileListCollapsed(current => !current)}
                  onUpdateRow={updateRow}
                  renderImage={renderImage}
                  rows={rows}
                  selectedPreviewUrl={selectedPreviewUrl}
                  selectedRow={selectedRow}
                  selectedUrlInputRef={selectedUrlInputRef}
                  uploadAccept={ACCEPTED_IMAGE_FILE_TYPES}
                />
              </>
            )}
          </div>

          {!isEmptyState ? (
            <footer className={modalFooterClass}>
              <div className={modalFooterActionGroupClass}>
                <Button
                  disabled={filledRows.length === 0 || hasDuplicateUrls}
                  onClick={() => handleApply('individual')}
                  size="xs"
                >
                  Insert as individual images
                </Button>
                <Button
                  disabled={filledRows.length <= 1 || hasDuplicateUrls}
                  onClick={() => handleApply('gallery')}
                  size="xs"
                >
                  Insert as gallery
                </Button>
              </div>
            </footer>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

const modalContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  width: '[min(72rem,calc(100dvw-2rem))]',
  maxWidth: 'full',
  maxHeight: '[calc(100dvh-2rem)]',
  p: '6',
  backgroundColor: 'surface',
  minHeight: '0',
  minWidth: '0',
  overflowX: 'hidden',
  overflowY: 'auto',
});

const modalScrollableContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  paddingBottom: '2',
});

const modalFooterClass = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingTop: '4',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'border',
});

const modalFooterActionGroupClass = css({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

const modalHeaderClass = css({
  display: 'grid',
  gap: '1',
  paddingRight: '10',
});

const headerTopRowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4',
  flexWrap: 'wrap',
});

const modalTitleClass = css({
  fontSize: '2xl',
  fontWeight: 'bold',
  color: 'text',
});

const headerButtonGroupClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  flexWrap: 'wrap',
});

const triggerButtonClass = css({
  minWidth: '9',
  minHeight: '9',
  width: '9',
  height: '9',
  px: '0',
  borderRadius: 'lg',
  borderColor: 'border',
});

const uploadButtonWrapClass = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '[fit-content]',
  minHeight: '10',
  px: '3',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  backgroundColor: 'surface',
  color: 'text',
  cursor: 'pointer',
  flex: 'none',
  _focusWithin: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
    borderColor: 'primary',
  },
});

const uploadButtonLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const fileInputClass = css({
  position: 'absolute',
  inset: '0',
  opacity: '0',
  cursor: 'pointer',
});

const urlPanelClass = css({
  display: 'grid',
  gap: '2',
  padding: '4',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: 'xl',
  backgroundColor: 'surfaceMuted',
});

const fieldLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'bold',
  color: 'text',
});

const urlPanelActionRowClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  flexWrap: 'wrap',
});

const metaTextClass = css({
  fontSize: 'xs',
  color: 'muted',
});
