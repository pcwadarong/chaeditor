'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from 'styled-system/css';

import { uploadEditorImage } from '@/entities/editor/api/upload-editor-image';
import {
  createEditorError,
  EDITOR_ERROR_MESSAGE,
  parseEditorError,
  resolveEditorPublishInlineErrorField,
} from '@/entities/editor/model/editor-error';
import { normalizeSlugInput } from '@/shared/lib/slug/slug';
import { Button } from '@/shared/ui/button/button';
import { SlideOver } from '@/shared/ui/slide-over/slide-over';
import { type ToastItem, ToastViewport } from '@/shared/ui/toast/toast';
import { XButton } from '@/shared/ui/x-button/x-button';
import type {
  PublishPanelProps,
  PublishSettings,
  PublishVisibility,
} from '@/widgets/editor/ui/core/editor-core.types';
import {
  buildPublishSettings,
  createDefaultPublishSettings,
  shouldShowPublishCommentsSetting,
  toScheduledPublishUtcIso,
  validatePublishSettings,
} from '@/widgets/editor/ui/publish/publish-panel.utils';
import {
  getInitialScheduleFields,
  getLocalScheduleMinFields,
  type PublishMode,
} from '@/widgets/editor/ui/publish/publish-panel-schedule';
import {
  PublishProjectLinksSection,
  PublishScheduleSection,
  PublishThumbnailSection,
  PublishVisibilitySection,
} from '@/widgets/editor/ui/publish/publish-panel-sections';
import { PublishSlugInput } from '@/widgets/editor/ui/publish/publish-slug-input';

type PublishErrors = {
  githubUrl?: string;
  koTitle?: string;
  publishAt?: string;
  slug?: string;
  thumbnail?: string;
  websiteUrl?: string;
};

/**
 * Synchronizes publish form values when the panel opens.
 */
const createInitialFormState = ({
  contentType,
  editorSlug,
  initialSettings,
}: {
  contentType: PublishPanelProps['contentType'];
  editorSlug: string;
  initialSettings?: PublishSettings;
}) => {
  const scheduleFields = getInitialScheduleFields(initialSettings?.publishAt ?? null);
  const defaultSettings = createDefaultPublishSettings({
    contentType,
    initialSettings,
    slug: editorSlug,
  });

  return {
    allowComments: defaultSettings.allowComments,
    dateInput: scheduleFields.dateInput,
    githubUrl: defaultSettings.githubUrl,
    publishMode: scheduleFields.publishMode,
    slug: defaultSettings.slug,
    thumbnailUrl: defaultSettings.thumbnailUrl,
    timeInput: scheduleFields.timeInput,
    visibility: defaultSettings.visibility,
    websiteUrl: defaultSettings.websiteUrl,
  };
};

/**
 * Checks whether two publish settings objects are equal field by field.
 */
const isSamePublishSettings = (left: PublishSettings, right: PublishSettings) =>
  left.allowComments === right.allowComments &&
  left.githubUrl === right.githubUrl &&
  left.publishAt === right.publishAt &&
  left.slug === right.slug &&
  left.thumbnailUrl === right.thumbnailUrl &&
  left.visibility === right.visibility &&
  left.websiteUrl === right.websiteUrl;

/**
 * Renders the slide-over panel for editing publish settings.
 */
export const PublishPanel = ({
  contentId,
  contentType,
  editorState,
  initialSettings,
  isOpen,
  isPublished = false,
  publicationState = 'draft',
  onClose,
  onSettingsChange,
  onSubmit,
}: PublishPanelProps) => {
  const showPublishCommentsSetting = shouldShowPublishCommentsSetting(contentType);
  const [slug, setSlug] = useState('');
  const [visibility, setVisibility] = useState<PublishVisibility>('public');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [publishMode, setPublishMode] = useState<PublishMode>('immediate');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [errors, setErrors] = useState<PublishErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastItems, setToastItems] = useState<ToastItem[]>([]);
  const hasInitializedWhileOpenRef = useRef(false);
  const verifiedSlugRef = useRef<string | null>(null);
  const pendingInitialSettingsRef = useRef<PublishSettings | null>(null);
  const openedAtRef = useRef<Date | null>(null);
  const isScheduleLocked = publicationState === 'published';

  useEffect(() => {
    if (!isOpen) {
      hasInitializedWhileOpenRef.current = false;
      verifiedSlugRef.current = null;
      pendingInitialSettingsRef.current = null;
      openedAtRef.current = null;
      return;
    }

    if (hasInitializedWhileOpenRef.current) return;

    openedAtRef.current = new Date();

    const nextFormState = createInitialFormState({
      contentType,
      editorSlug: editorState.slug,
      initialSettings,
    });
    const nextSettings = buildPublishSettings(nextFormState);

    hasInitializedWhileOpenRef.current = true;
    pendingInitialSettingsRef.current = nextSettings;

    setSlug(nextFormState.slug);
    verifiedSlugRef.current = isPublished ? normalizeSlugInput(nextFormState.slug) : null;
    setVisibility(nextFormState.visibility);
    setThumbnailUrl(nextFormState.thumbnailUrl);
    setAllowComments(nextFormState.allowComments);
    setWebsiteUrl(nextFormState.websiteUrl);
    setGithubUrl(nextFormState.githubUrl);
    setPublishMode(nextFormState.publishMode);
    setDateInput(nextFormState.dateInput);
    setTimeInput(nextFormState.timeInput);
    setErrors({});
  }, [contentType, editorState.slug, initialSettings, isOpen, isPublished]);

  useEffect(() => {
    if (!isOpen || !isScheduleLocked || publishMode === 'immediate') return;

    setPublishMode('immediate');
    setDateInput('');
    setTimeInput('');
  }, [isOpen, isScheduleLocked, publishMode]);

  const scheduledUtcIso = useMemo(
    () => toScheduledPublishUtcIso(dateInput, timeInput),
    [dateInput, timeInput],
  );
  const { minDateInput, minTimeInput } = getLocalScheduleMinFields(
    openedAtRef.current ?? new Date(),
  );
  const effectiveMinTimeInput =
    publishMode === 'scheduled' && (!dateInput || dateInput === minDateInput)
      ? minTimeInput
      : undefined;
  const currentSettings = useMemo(
    () =>
      buildPublishSettings({
        allowComments: showPublishCommentsSetting ? allowComments : false,
        dateInput,
        githubUrl,
        publishMode,
        slug,
        thumbnailUrl,
        timeInput,
        visibility,
        websiteUrl,
      }),
    [
      allowComments,
      dateInput,
      githubUrl,
      publishMode,
      showPublishCommentsSetting,
      slug,
      thumbnailUrl,
      timeInput,
      visibility,
      websiteUrl,
    ],
  );

  const thumbnailPreviewUrl = thumbnailUrl.trim();

  useEffect(() => {
    if (!isOpen || !onSettingsChange) return;

    if (pendingInitialSettingsRef.current) {
      if (!isSamePublishSettings(currentSettings, pendingInitialSettingsRef.current)) {
        return;
      }

      pendingInitialSettingsRef.current = null;
    }

    onSettingsChange(currentSettings);
  }, [currentSettings, isOpen, onSettingsChange]);

  /**
   * Pushes a toast for upload and submit failures.
   */
  const pushToast = useCallback((message: string) => {
    setToastItems(previous => [
      ...previous,
      {
        id: `publish-panel-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message,
        tone: 'error',
      },
    ]);
  }, []);
  const closeToast = useCallback((id: string) => {
    setToastItems(previous => previous.filter(item => item.id !== id));
  }, []);
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  const handleSlugChange = useCallback((value: string) => {
    setSlug(previous => (previous === value ? previous : value));
    verifiedSlugRef.current =
      verifiedSlugRef.current === normalizeSlugInput(value) ? verifiedSlugRef.current : null;
    setErrors(previous => (previous.slug ? { ...previous, slug: undefined } : previous));
  }, []);
  const handleThumbnailUrlChange = useCallback((value: string) => {
    setThumbnailUrl(previous => (previous === value ? previous : value));
  }, []);
  const handleWebsiteUrlChange = useCallback((value: string) => {
    setWebsiteUrl(previous => (previous === value ? previous : value));
    setErrors(previous =>
      previous.websiteUrl ? { ...previous, websiteUrl: undefined } : previous,
    );
  }, []);
  const handleGithubUrlChange = useCallback((value: string) => {
    setGithubUrl(previous => (previous === value ? previous : value));
    setErrors(previous => (previous.githubUrl ? { ...previous, githubUrl: undefined } : previous));
  }, []);
  const handleAllowCommentsChange = useCallback((checked: boolean) => {
    setAllowComments(previous => (previous === checked ? previous : checked));
  }, []);
  const handleVisibilityChange = useCallback((nextVisibility: PublishVisibility) => {
    setVisibility(previous => (previous === nextVisibility ? previous : nextVisibility));
  }, []);
  const handlePublishModeChange = useCallback((nextMode: PublishMode) => {
    setPublishMode(previous => (previous === nextMode ? previous : nextMode));
  }, []);
  const handleDateInputChange = useCallback((value: string) => {
    setDateInput(previous => (previous === value ? previous : value));
  }, []);
  const handleTimeInputChange = useCallback((value: string) => {
    setTimeInput(previous => (previous === value ? previous : value));
  }, []);

  /**
   * Checks slug availability with the admin validation API.
   */
  const handleCheckDuplicate = useCallback(
    async (nextSlug: string) => {
      const searchParams = new URLSearchParams({
        slug: nextSlug,
        type: contentType,
      });

      if (contentId) {
        searchParams.set('excludeId', contentId);
      }

      const response = await fetch(`/api/editor/slug-check?${searchParams.toString()}`);
      const body = (await response.json()) as {
        duplicate?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || typeof body.duplicate !== 'boolean') {
        throw createEditorError(
          'slugCheckFailed',
          body.error ?? body.message ?? EDITOR_ERROR_MESSAGE.slugCheckFailed,
        );
      }

      if (!body.duplicate) {
        verifiedSlugRef.current = nextSlug;
        setErrors(previous => (previous.slug ? { ...previous, slug: undefined } : previous));
      }

      return body.duplicate;
    },
    [contentId, contentType],
  );

  /**
   * Uploads the thumbnail file and stores the resulting public URL.
   */
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      setIsUploading(true);
      setErrors(previous => ({ ...previous, thumbnail: undefined }));

      try {
        setThumbnailUrl(
          await uploadEditorImage({
            contentType,
            file,
            imageKind: 'thumbnail',
          }),
        );
      } catch {
        setErrors(previous => ({
          ...previous,
          thumbnail: EDITOR_ERROR_MESSAGE.thumbnailUploadFailed,
        }));
        pushToast(EDITOR_ERROR_MESSAGE.thumbnailUploadFailedWithRetry);
      } finally {
        setIsUploading(false);
        event.target.value = '';
      }
    },
    [contentType, pushToast],
  );

  /**
   * Validates and submits the final publish settings.
   */
  const handleSubmit = useCallback(async () => {
    const nextSettings = currentSettings;
    const nextErrors = validatePublishSettings({
      editorState,
      verifiedSlug: isPublished ? normalizeSlugInput(slug) : verifiedSlugRef.current,
      settings: nextSettings,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit(nextSettings);
      onClose();
    } catch (error) {
      const parsedError = parseEditorError(error, 'publishFailed');
      const inlineField = resolveEditorPublishInlineErrorField(parsedError.code);

      if (inlineField) {
        setErrors(previous => ({
          ...previous,
          [inlineField]: parsedError.message,
        }));
      } else {
        pushToast(parsedError.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentSettings, editorState, isPublished, onClose, onSubmit, pushToast, slug]);
  const handleSubmitClick = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  return (
    <>
      <SlideOver
        ariaLabelledBy="publish-panel-title"
        className={panelClass}
        isOpen={isOpen}
        onClose={handleClose}
      >
        <div className={panelHeaderClass}>
          <h2 className={panelTitleClass} id="publish-panel-title">
            Publish settings
          </h2>
          <XButton ariaLabel="Close publish settings" onClick={handleClose} />
        </div>

        <div className={panelBodyClass} onClick={event => event.stopPropagation()}>
          <section className={sectionClass}>
            <PublishSlugInput
              isPublished={isPublished}
              onChange={handleSlugChange}
              onCheckDuplicate={handleCheckDuplicate}
              showEmptyError={errors.slug === EDITOR_ERROR_MESSAGE.missingSlug}
              value={slug}
            />
            {errors.slug ? (
              <p className={errorTextClass} id="publish-panel-slug-error" role="alert">
                {errors.slug}
              </p>
            ) : null}
          </section>

          <PublishVisibilitySection onChange={handleVisibilityChange} value={visibility} />

          <PublishThumbnailSection
            error={errors.thumbnail}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onThumbnailUrlChange={handleThumbnailUrlChange}
            thumbnailPreviewUrl={thumbnailPreviewUrl}
            thumbnailUrl={thumbnailUrl}
          />

          {contentType === 'project' ? (
            <PublishProjectLinksSection
              githubUrl={githubUrl}
              githubUrlError={errors.githubUrl}
              onGithubUrlChange={handleGithubUrlChange}
              onWebsiteUrlChange={handleWebsiteUrlChange}
              websiteUrl={websiteUrl}
              websiteUrlError={errors.websiteUrl}
            />
          ) : null}

          {showPublishCommentsSetting ? (
            <section className={sectionClass}>
              <label className={checkboxLabelClass}>
                <input
                  checked={allowComments}
                  className={checkboxClass}
                  onChange={event => handleAllowCommentsChange(event.target.checked)}
                  type="checkbox"
                />
                Allow comments
              </label>
            </section>
          ) : null}

          <PublishScheduleSection
            dateInput={dateInput}
            error={errors.publishAt}
            isScheduleLocked={isScheduleLocked}
            minDateInput={minDateInput}
            minTimeInput={effectiveMinTimeInput}
            onDateChange={handleDateInputChange}
            onPublishModeChange={handlePublishModeChange}
            onTimeChange={handleTimeInputChange}
            publishMode={publishMode}
            scheduledUtcIso={scheduledUtcIso}
            timeInput={timeInput}
          />

          {errors.koTitle ? (
            <p className={errorTextClass} role="alert">
              {errors.koTitle}
            </p>
          ) : null}
        </div>

        <div className={panelFooterClass}>
          <Button onClick={handleClose} size="sm" tone="white">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmitClick} size="sm" tone="primary">
            {isSubmitting ? (
              <>
                <span aria-hidden className={loadingSpinnerClass} />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </SlideOver>

      <ToastViewport items={toastItems} onClose={closeToast} />
    </>
  );
};

const panelClass = css({
  zIndex: '90',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  width: 'full',
  maxWidth: '[30rem]',
  height: 'dvh',
  bg: 'surface',
  borderLeftWidth: '1px',
  borderLeftStyle: 'solid',
  borderLeftColor: 'border',
  boxShadow: 'floating',
});

const panelHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: '5',
  py: '4',
  borderBottomWidth: '1px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'border',
});

const panelTitleClass = css({
  fontSize: 'xl',
  fontWeight: '[700]',
  letterSpacing: '[-0.02em]',
});

const panelBodyClass = css({
  overflowY: 'auto',
  px: '5',
  py: '5',
  display: 'grid',
  alignContent: 'start',
  gap: '6',
});

const sectionClass = css({
  display: 'grid',
  gap: '3',
});

const checkboxLabelClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3',
  fontSize: 'sm',
  fontWeight: '[600]',
  cursor: 'pointer',
});

const checkboxClass = css({
  width: '4',
  height: '4',
});

const errorTextClass = css({
  fontSize: 'xs',
  color: 'error',
});

const panelFooterClass = css({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '3',
  px: '5',
  py: '4',
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'border',
});

const loadingSpinnerClass = css({
  display: 'inline-block',
  width: '4',
  height: '4',
  borderRadius: 'full',
  borderWidth: '2px',
  borderStyle: 'solid',
  borderColor: '[rgba(255,255,255,0.45)]',
  borderTopColor: 'white',
  animation: '[spin_0.8s_linear_infinite]',
});
