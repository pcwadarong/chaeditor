'use client';

import React from 'react';
import { css, cx } from 'styled-system/css';

import type { HostImageRenderer, PreviewImageSource } from '@/entities/editor-core';
import { normalizeImageUrl } from '@/shared/lib/url/normalize-image-url';
import { RenderImage } from '@/shared/ui/image/render-image';
import { Input } from '@/shared/ui/input/input';

type ImageSourceFieldProps = {
  className?: string;
  error?: string;
  fileInputAriaLabel: string;
  inputId: string;
  isUploading: boolean;
  label: string;
  multiple?: boolean;
  onFileChange: React.ChangeEventHandler<HTMLInputElement>;
  onValueChange: (value: string) => void;
  previewAlt: string;
  previewUrl: PreviewImageSource;
  renderImage?: HostImageRenderer;
  uploadButtonLabel?: string;
  value: string;
};

/**
 * Returns only the image source values that are safe for preview rendering.
 */
const resolvePreviewImageSrc = (previewUrl: ImageSourceFieldProps['previewUrl']) => {
  if (typeof previewUrl !== 'string') {
    return previewUrl;
  }

  const trimmedPreviewUrl = previewUrl.trim();

  if (!trimmedPreviewUrl) return null;
  if (trimmedPreviewUrl.startsWith('/')) return trimmedPreviewUrl;

  const normalizedPreviewUrl = normalizeImageUrl(trimmedPreviewUrl);

  if (!normalizedPreviewUrl?.startsWith('https://')) {
    return null;
  }

  return normalizedPreviewUrl;
};

/**
 * Shared field for image URL input and file upload.
 */
export const ImageSourceField = ({
  className,
  error,
  fileInputAriaLabel,
  inputId,
  isUploading,
  label,
  multiple = false,
  onFileChange,
  onValueChange,
  previewAlt,
  previewUrl,
  renderImage,
  uploadButtonLabel = 'Upload file',
  value,
}: ImageSourceFieldProps) => {
  const normalizedPreviewUrl = resolvePreviewImageSrc(previewUrl);

  return (
    <section className={cx(rootClass, className)}>
      <label className={labelClass} htmlFor={inputId}>
        {label}
      </label>
      <div className={rowClass}>
        <Input
          className={inputClass}
          id={inputId}
          onChange={event => onValueChange(event.target.value)}
          placeholder="https://example.com/image.png"
          value={value}
        />
        <label className={uploadButtonWrapClass}>
          <span aria-live="polite" className={uploadButtonLabelClass} role="status">
            {isUploading ? 'Uploading...' : uploadButtonLabel}
          </span>
          <input
            accept="image/*"
            aria-label={fileInputAriaLabel}
            className={fileInputClass}
            disabled={isUploading}
            multiple={multiple}
            onChange={onFileChange}
            type="file"
          />
        </label>
      </div>
      {error ? (
        <p className={errorTextClass} role="alert">
          {error}
        </p>
      ) : null}
      {normalizedPreviewUrl ? (
        <div className={previewFrameClass}>
          <RenderImage
            alt={previewAlt}
            className={previewImageClass}
            fill
            renderImage={renderImage}
            src={normalizedPreviewUrl}
          />
        </div>
      ) : null}
    </section>
  );
};

const rootClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const labelClass = css({
  fontSize: 'sm',
  fontWeight: '[700]',
  color: 'text',
});

const rowClass = css({
  display: 'flex',
  gap: '3',
  flexDirection: {
    base: 'column',
    sm: 'row',
  },
});

const inputClass = css({
  flex: '1',
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

const errorTextClass = css({
  fontSize: 'xs',
  color: 'error',
});

const previewFrameClass = css({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: {
    base: 'gray.50',
    _dark: 'gray.900',
  },
  minHeight: '[12rem]',
});

const previewImageClass = css({
  display: 'block',
  width: 'full',
  height: '[12rem]',
  objectFit: 'cover',
});
