'use client';

import React, { useMemo, useRef, useState } from 'react';
import { css, cx } from 'styled-system/css';

import type { EditorContentType, UploadEditorVideo } from '@/entities/editor-core';
import {
  EDITOR_VIDEO_FILE_INPUT_ACCEPT,
  EDITOR_VIDEO_MAX_FILE_SIZE,
  isAllowedEditorVideoFile,
} from '@/entities/editor-core/model/editor-video-policy';
import type { VideoEmbedApplyPayload } from '@/features/edit-markdown/video';
import { extractVideoEmbedReference } from '@/features/edit-markdown/video';
import { YoutubeIcon } from '@/shared/ui/icons/app-icons';
import type { ClosePopover } from '@/shared/ui/popover/popover';
import { useMarkdownPrimitives } from '@/shared/ui/primitive-registry/markdown-primitive-registry';

type VideoEmbedModalProps = {
  contentType: EditorContentType;
  onApply: (payload: VideoEmbedApplyPayload, closePopover?: ClosePopover) => void;
  onUploadVideo?: UploadEditorVideo;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  triggerClassName?: string;
};

const MB = 1024 * 1024;
const VIDEO_MAX_FILE_SIZE_MB = Math.round(EDITOR_VIDEO_MAX_FILE_SIZE / MB);

/**
 * Renders the video embed modal used from the markdown toolbar.
 *
 * @param props Trigger, upload, and apply handlers for video insertion.
 * @returns The video insert trigger and modal UI.
 */
export const VideoEmbedModal = ({
  contentType,
  onApply,
  onUploadVideo,
  onTriggerMouseDown,
  triggerClassName,
}: VideoEmbedModalProps) => {
  const { Button, Input, Modal, Tooltip } = useMarkdownPrimitives();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoReference = useMemo(() => extractVideoEmbedReference(videoUrl), [videoUrl]);
  const videoId = videoReference?.provider === 'youtube' ? videoReference.videoId : null;
  const previewMode = uploadedVideoUrl ? 'upload' : videoId ? 'youtube' : null;
  const isVideoUploadEnabled = Boolean(onUploadVideo);
  const helperStatusMessage = errorMessage
    ? errorMessage
    : isUploading && uploadProgress !== null
      ? `Uploading video... ${uploadProgress}%`
      : uploadedVideoUrl
        ? 'The uploaded video is ready to insert.'
        : videoId
          ? 'The video is ready to insert.'
          : isVideoUploadEnabled
            ? 'Currently supports YouTube URLs or uploaded video files.'
            : 'Currently supports YouTube URLs. Local video upload is disabled.';

  /**
   * Opens the video modal and clears pending tooltip and focus state.
   */
  const handleOpen = () => {
    triggerRef.current?.blur();
    setIsOpen(true);
  };

  /**
   * Cancels any active upload request and closes the modal.
   */
  const handleClose = () => {
    uploadAbortControllerRef.current?.abort();
    setIsOpen(false);
  };

  /**
   * Inserts markdown for the current video reference.
   */
  const handleApply = () => {
    if (uploadedVideoUrl) {
      onApply({
        provider: 'upload',
        src: uploadedVideoUrl,
      });
      setUploadedVideoUrl(null);
      setVideoUrl('');
      setUploadProgress(null);
      setErrorMessage(null);
      setIsOpen(false);
      return;
    }

    if (!videoId) return;

    onApply({
      provider: 'youtube',
      videoId,
    });
    setVideoUrl('');
    setUploadedVideoUrl(null);
    setUploadProgress(null);
    setErrorMessage(null);
    setIsOpen(false);
  };

  /**
   * Uploads a local video file and prepares the upload-based preview state.
   *
   * @param event File input change event.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUploadVideo) {
      setErrorMessage('Video upload is not configured in the host application.');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!isAllowedEditorVideoFile(file)) {
      setErrorMessage(
        `Unsupported video file. MP4, MOV, WEBM, M4V · up to ${VIDEO_MAX_FILE_SIZE_MB}MB`,
      );
      setUploadedVideoUrl(null);
      setUploadProgress(null);
      return;
    }

    uploadAbortControllerRef.current?.abort();

    const abortController = new AbortController();

    uploadAbortControllerRef.current = abortController;
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      const uploadedUrl = await onUploadVideo({
        contentType,
        file,
        onProgress: progress => {
          if (uploadAbortControllerRef.current !== abortController) return;

          setUploadProgress(progress);
        },
        signal: abortController.signal,
      });

      if (uploadAbortControllerRef.current !== abortController) return;

      setUploadedVideoUrl(uploadedUrl);
      setVideoUrl('');
      setUploadProgress(100);
    } catch (error) {
      if (uploadAbortControllerRef.current !== abortController) return;

      if (error instanceof Error && error.name === 'AbortError') {
        setErrorMessage('The video upload was canceled.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Video upload failed');
      }

      setUploadedVideoUrl(null);
      setUploadProgress(null);
    } finally {
      if (uploadAbortControllerRef.current === abortController) {
        uploadAbortControllerRef.current = null;
        setIsUploading(false);
      }
    }
  };

  /**
   * Cancels the active video upload.
   */
  const handleCancelUpload = () => {
    uploadAbortControllerRef.current?.abort();
  };

  return (
    <>
      {isOpen ? (
        <button
          aria-label="Video"
          className={cx(videoTriggerClass, triggerClassName)}
          onClick={handleOpen}
          onMouseDown={onTriggerMouseDown}
          ref={triggerRef}
          type="button"
        >
          <YoutubeIcon aria-hidden color="text" size="sm" />
        </button>
      ) : (
        <Tooltip content="Video" preferredPlacement="top">
          <button
            aria-label="Video"
            className={cx(videoTriggerClass, triggerClassName)}
            onClick={handleOpen}
            onMouseDown={onTriggerMouseDown}
            ref={triggerRef}
            type="button"
          >
            <YoutubeIcon aria-hidden color="text" size="sm" />
          </button>
        </Tooltip>
      )}

      <Modal
        ariaDescribedBy="markdown-toolbar-video-modal-description"
        ariaLabelledBy="markdown-toolbar-video-modal-title"
        closeAriaLabel="Close video insert modal"
        initialFocusRef={inputRef}
        isOpen={isOpen}
        onClose={handleClose}
      >
        <section className={modalFrameClass}>
          <header className={modalHeaderClass}>
            <div className={headerTextGroupClass}>
              <h2 className={titleClass} id="markdown-toolbar-video-modal-title">
                Insert video
              </h2>
              <p className={descriptionClass} id="markdown-toolbar-video-modal-description">
                Insert a YouTube URL or a video file. MP4, MOV, WEBM, M4V · up to{' '}
                {VIDEO_MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          </header>

          <div className={bodyClass}>
            <section className={previewFrameClass}>
              {previewMode === 'upload' && uploadedVideoUrl ? (
                <video
                  className={previewUploadedVideoClass}
                  controls
                  preload="metadata"
                  src={uploadedVideoUrl}
                />
              ) : previewMode === 'youtube' && videoId ? (
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={previewIframeClass}
                  referrerPolicy="strict-origin-when-cross-origin"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video preview"
                />
              ) : (
                <div className={previewPlaceholderClass}>
                  Enter a YouTube URL or upload a video file to preview it here.
                </div>
              )}
            </section>

            <section className={fieldGroupClass}>
              <div className={fieldClass}>
                <label className={fieldLabelClass} htmlFor="markdown-toolbar-video-url">
                  Video URL
                </label>
                <Input
                  id="markdown-toolbar-video-url"
                  onChange={event => {
                    setVideoUrl(event.target.value);
                    if (uploadedVideoUrl) {
                      setUploadedVideoUrl(null);
                    }
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  ref={inputRef}
                  type="url"
                  value={videoUrl}
                />
              </div>

              <div className={fieldClass}>
                <span className={fieldLabelClass}>Video upload</span>
                <div className={uploadActionsClass}>
                  <label className={uploadButtonWrapClass}>
                    <span aria-live="polite" className={uploadButtonLabelClass} role="status">
                      {isUploading ? 'Uploading...' : 'Choose video file'}
                    </span>
                    <input
                      accept={EDITOR_VIDEO_FILE_INPUT_ACCEPT}
                      aria-label="Upload video"
                      className={fileInputClass}
                      disabled={isUploading || !isVideoUploadEnabled}
                      onChange={handleFileChange}
                      type="file"
                    />
                  </label>
                  {isUploading ? (
                    <Button onClick={handleCancelUpload} size="sm" variant="ghost">
                      Cancel upload
                    </Button>
                  ) : null}
                </div>
              </div>

              <p aria-live="polite" className={helperTextClass} role="status">
                {helperStatusMessage}
              </p>
            </section>
          </div>

          <footer className={footerClass}>
            <Button onClick={handleClose} size="sm" variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isUploading || (!uploadedVideoUrl && !videoId)}
              onClick={handleApply}
              size="sm"
            >
              Insert
            </Button>
          </footer>
        </section>
      </Modal>
    </>
  );
};

const videoTriggerClass = css({
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '10',
  minWidth: '10',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'transparent',
  backgroundColor: 'transparent',
  color: 'text',
  transition: 'common',
  cursor: 'pointer',
  _hover: {
    backgroundColor: 'surfaceMuted',
  },
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});

const modalFrameClass = css({
  display: 'grid',
  gap: '6',
  width: 'full',
  maxWidth: '4xl',
  paddingX: '8',
  paddingTop: '8',
  paddingBottom: '6',
  backgroundColor: 'surface',
});

const modalHeaderClass = css({
  display: 'grid',
  gap: '2',
});

const headerTextGroupClass = css({
  display: 'grid',
  gap: '2',
  maxWidth: 'xl',
});

const titleClass = css({
  margin: '0',
  fontSize: '4xl',
  fontWeight: 'bold',
  color: 'text',
  letterSpacing: '[-0.02em]',
});

const descriptionClass = css({
  margin: '0',
  fontSize: 'sm',
  color: 'muted',
});

const bodyClass = css({
  display: 'grid',
  gridTemplateColumns: {
    base: '1fr',
    md: '[minmax(0,1.2fr) minmax(18rem,0.8fr)]',
  },
  gap: '8',
  paddingY: '5',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'border',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border',
});

const previewFrameClass = css({
  position: 'relative',
  width: 'full',
  overflow: 'hidden',
  borderRadius: '2xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  backgroundColor: 'surfaceMuted',
  minHeight: '80',
  pt: '[56.25%]',
});

const previewIframeClass = css({
  position: 'absolute',
  inset: '0',
  width: 'full',
  height: 'full',
  border: 'none',
});

const previewUploadedVideoClass = css({
  position: 'absolute',
  inset: '0',
  width: 'full',
  height: 'full',
  objectFit: 'contain',
  backgroundColor: 'black',
});

const previewPlaceholderClass = css({
  position: 'absolute',
  inset: '0',
  display: 'grid',
  placeItems: 'center',
  paddingX: '6',
  textAlign: 'center',
  fontSize: 'sm',
  color: 'muted',
});

const fieldGroupClass = css({
  display: 'grid',
  alignContent: 'start',
  gap: '4',
});

const fieldClass = css({
  display: 'grid',
  gap: '2',
});

const fieldLabelClass = css({
  fontSize: 'sm',
  fontWeight: 'bold',
  color: 'text',
});

const helperTextClass = css({
  margin: '0',
  fontSize: 'xs',
  color: 'muted',
});

const uploadActionsClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  flexWrap: 'wrap',
});

const uploadButtonWrapClass = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '10',
  width: 'auto',
  px: '3',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  backgroundColor: 'surface',
  color: 'text',
  cursor: 'pointer',
  transition: 'common',
  _hover: {
    borderColor: 'borderStrong',
  },
  _focusWithin: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
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

const footerClass = css({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '3',
});
