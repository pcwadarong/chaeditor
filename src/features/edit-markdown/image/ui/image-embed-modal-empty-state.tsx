'use client';

import React from 'react';
import { css, cx } from 'styled-system/css';

import { ImageIcon } from '@/shared/ui/icons/app-icons';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type ImageEmbedModalEmptyStateProps = {
  acceptedFileTypes: string;
  canAddRow: boolean;
  errorMessage: string | null;
  isDragActive: boolean;
  isImageUploadEnabled: boolean;
  isUploading: boolean;
  pendingUrls: string;
  onAddUrls: () => void;
  onDropzoneDragLeave: () => void;
  onDropzoneDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDropzoneDrop: (event: React.DragEvent<HTMLElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPendingUrlsChange: (value: string) => void;
  urlAddDisabled: boolean;
  urlInputRef: React.RefObject<HTMLTextAreaElement | null>;
};

/**
 * Empty-state layout with a dropzone and URL input panel.
 *
 * @param props Props required to render and control the empty state.
 * @returns The empty-state UI for image insertion.
 */
export const ImageEmbedModalEmptyState = ({
  acceptedFileTypes,
  canAddRow,
  errorMessage,
  isDragActive,
  isImageUploadEnabled,
  isUploading,
  onAddUrls,
  onDropzoneDragLeave,
  onDropzoneDragOver,
  onDropzoneDrop,
  onFileChange,
  onPendingUrlsChange,
  pendingUrls,
  urlAddDisabled,
  urlInputRef,
}: ImageEmbedModalEmptyStateProps) => {
  const { Button, Textarea } = useMarkdownPrimitives();

  return (
    <section className={emptyStateLayoutClass}>
      <label
        className={cx(emptyStateClass, isDragActive ? emptyStateActiveClass : undefined)}
        data-image-empty-dropzone
        onDragLeave={onDropzoneDragLeave}
        onDragOver={onDropzoneDragOver}
        onDrop={onDropzoneDrop}
      >
        <input
          accept={acceptedFileTypes}
          aria-label="Dropzone image upload"
          className={fileInputClass}
          disabled={isUploading || !canAddRow || !isImageUploadEnabled}
          multiple
          onChange={onFileChange}
          type="file"
        />
        <div className={emptyStateInnerClass}>
          <ImageIcon aria-hidden color="muted" size="lg" />
          <div className={emptyStateTitleClass}>Drop images here.</div>
          <p className={emptyStateDescriptionClass}>Click to browse or drag and drop files.</p>
        </div>
      </label>
      <section className={urlPanelClass}>
        <label className={fieldLabelClass} htmlFor="markdown-toolbar-image-url-panel">
          Add web URLs
        </label>
        <Textarea
          autoResize={false}
          id="markdown-toolbar-image-url-panel"
          onChange={event => onPendingUrlsChange(event.target.value)}
          placeholder={`https://example.com/image.png\nhttps://example.com/image-2.png`}
          ref={urlInputRef}
          rows={3}
          value={pendingUrls}
        />
        <div className={urlPanelActionRowClass}>
          <p className={metaTextClass}>
            {isImageUploadEnabled
              ? 'Enter one URL per line.'
              : 'Enter one URL per line. Image upload is currently disabled.'}
          </p>
          <Button disabled={urlAddDisabled} onClick={onAddUrls} size="sm" tone="white">
            Add
          </Button>
        </div>
        {errorMessage ? (
          <p aria-live="polite" className={metaErrorTextClass} role="alert">
            {errorMessage}
          </p>
        ) : null}
      </section>
    </section>
  );
};

const fileInputClass = css({
  position: 'absolute',
  inset: '0',
  opacity: '0',
  cursor: 'pointer',
});

const emptyStateClass = css({
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  minHeight: '72',
  padding: '6',
  textAlign: 'center',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'border',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'dashed',
  borderColor: 'border',
  backgroundColor: 'surfaceMuted',
  transition: '[background-color 160ms ease, border-color 160ms ease]',
  cursor: 'pointer',
  _focusWithin: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
    borderColor: 'primary',
  },
});

const emptyStateActiveClass = css({
  borderColor: 'primary',
  backgroundColor: 'surface',
});

const emptyStateTitleClass = css({
  fontSize: 'lg',
  fontWeight: 'bold',
  color: 'text',
});

const emptyStateDescriptionClass = css({
  fontSize: 'sm',
  color: 'muted',
});

const emptyStateLayoutClass = css({
  display: 'grid',
  gap: '3',
  gridTemplateColumns: {
    base: '1fr',
    md: '[minmax(0,1fr) minmax(0,1.5fr)]',
  },
  alignItems: 'stretch',
});

const emptyStateInnerClass = css({
  display: 'grid',
  justifyItems: 'center',
  gap: '1',
  maxWidth: '80',
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
  alignContent: 'start',
});

const urlPanelActionRowClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  flexWrap: 'wrap',
});

const fieldLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'bold',
  color: 'text',
});

const metaTextClass = css({
  fontSize: 'xs',
  color: 'muted',
});

const metaErrorTextClass = css({
  fontSize: 'xs',
  color: 'error',
});
