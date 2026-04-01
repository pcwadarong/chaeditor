'use client';

import React, { useState } from 'react';
import { css } from 'styled-system/css';

import type { EditorAttachment } from '@/entities/editor/model/editor-attachment';
import { EDITOR_ATTACHMENT_FILE_INPUT_ACCEPT } from '@/entities/editor/model/editor-attachment-policy';
import type { EditorContentType } from '@/entities/editor/model/editor-types';
import type { UploadEditorFile } from '@/entities/editor-core';
import { Button } from '@/shared/ui/button/button';
import { FileIcon } from '@/shared/ui/icons/app-icons';
import { Input } from '@/shared/ui/input/input';
import { type ClosePopover, Popover } from '@/shared/ui/popover/popover';

type FileEmbedPopoverProps = {
  contentType: EditorContentType;
  onApply: (attachment: EditorAttachment, closePopover?: ClosePopover) => void;
  onUploadFile?: UploadEditorFile;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

/**
 * Popover for uploading an attachment and inserting the custom Attachment tag.
 */
export const FileEmbedPopover = ({
  contentType,
  onApply,
  onUploadFile,
  onTriggerMouseDown,
  triggerClassName,
}: FileEmbedPopoverProps) => {
  const [attachment, setAttachment] = useState<EditorAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isFileUploadEnabled = Boolean(onUploadFile);

  /**
   * Uploads a file and stores the resulting attachment metadata.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUploadFile) {
      setAttachment(null);
      setAttachmentError('File upload is not configured in the host application.');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);
    setAttachmentError(null);

    try {
      const uploadedAttachment = await onUploadFile({
        contentType,
        file,
      });

      setAttachment(uploadedAttachment);
    } catch {
      setAttachment(null);
      setAttachmentError('Failed to upload the file. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  /**
   * Sends the uploaded attachment metadata to the insert callback.
   */
  const handleApply = (closePopover?: ClosePopover) => {
    if (!attachment) return;

    onApply(attachment, closePopover);
    setAttachment(null);
    setAttachmentError(null);
  };

  return (
    <Popover
      onTriggerMouseDown={onTriggerMouseDown}
      panelLabel="Attach file"
      portalPlacement="start"
      renderInPortal
      triggerAriaLabel="Attach file"
      triggerClassName={triggerClassName}
      triggerContent={<FileIcon aria-hidden color="text" size="sm" />}
      triggerTooltip="Attach file"
    >
      {({ closePopover }) => (
        <div className={popoverContentClass}>
          <div className={fieldStackClass}>
            <label className={labelClass} htmlFor="markdown-toolbar-attachment-name">
              Attachment
            </label>
            <div className={rowClass}>
              <Input
                id="markdown-toolbar-attachment-name"
                placeholder="The uploaded file name will appear here"
                readOnly
                value={attachment?.fileName ?? ''}
              />
              <label className={uploadButtonWrapClass}>
                <span aria-live="polite" className={uploadButtonLabelClass} role="status">
                  {isUploading ? 'Uploading...' : 'Upload file'}
                </span>
                <input
                  accept={EDITOR_ATTACHMENT_FILE_INPUT_ACCEPT}
                  aria-label="Upload attachment"
                  className={fileInputClass}
                  disabled={isUploading || !isFileUploadEnabled}
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
            </div>
            {attachment ? (
              <p className={metaTextClass}>
                {attachment.contentType} · {Math.max(1, Math.round(attachment.fileSize / 1024))} KB
              </p>
            ) : null}
            {attachmentError ? (
              <p className={errorTextClass} role="alert">
                {attachmentError}
              </p>
            ) : !isFileUploadEnabled ? (
              <p className={metaTextClass}>
                File upload is not configured in the host application.
              </p>
            ) : null}
          </div>
          <Button disabled={!attachment} onClick={() => handleApply(closePopover)}>
            Insert
          </Button>
        </div>
      )}
    </Popover>
  );
};

const popoverContentClass = css({
  display: 'grid',
  gap: '3',
  minWidth: '[18rem]',
});

const fieldStackClass = css({
  display: 'grid',
  gap: '2',
});

const labelClass = css({
  fontSize: 'sm',
  fontWeight: '[700]',
  color: 'text',
});

const rowClass = css({
  display: 'flex',
  alignItems: 'stretch',
  gap: '3',
  flexDirection: {
    base: 'column',
    sm: 'row',
  },
});

const uploadButtonWrapClass = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '[fit-content]',
  minHeight: '[2.375rem]',
  px: '3',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'surface',
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
  fontWeight: '[600]',
});

const fileInputClass = css({
  position: 'absolute',
  inset: '0',
  opacity: '0',
  cursor: 'pointer',
});

const metaTextClass = css({
  fontSize: 'xs',
  color: 'muted',
});

const errorTextClass = css({
  fontSize: 'xs',
  color: 'error',
});
