'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { css, cx } from 'styled-system/css';

import { isValidSlugFormat, normalizeSlugInput } from '@/shared/lib/slug/slug';
import { Button } from '@/shared/ui/button/button';
import { LockIcon } from '@/shared/ui/icons/app-icons';
import { Input } from '@/shared/ui/input/input';

type PublishSlugInputProps = {
  className?: string;
  isPublished?: boolean;
  onChange: (slug: string) => void;
  onCheckDuplicate?: (slug: string) => Promise<boolean>;
  showEmptyError?: boolean;
  value: string;
};

/**
 * Slug input field used inside the publish panel.
 */
export const PublishSlugInput = ({
  className,
  isPublished = false,
  onChange,
  onCheckDuplicate,
  showEmptyError = false,
  value,
}: PublishSlugInputProps) => {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const successId = `${baseId}-success`;
  const [hasCheckAttempt, setHasCheckAttempt] = useState(false);
  const [duplicateCheckStatus, setDuplicateCheckStatus] = useState<
    'available' | 'checking' | 'duplicate' | 'error' | 'idle'
  >('idle');
  const duplicateCheckRequestIdRef = useRef(0);
  const latestValueRef = useRef(value);
  const normalizedValue = normalizeSlugInput(value);
  const isEmpty = value.trim().length === 0;
  const hasFormatError = value.trim().length > 0 && !isValidSlugFormat(normalizedValue);
  const shouldShowEmptyError = (showEmptyError || hasCheckAttempt) && isEmpty;
  const shouldShowFormatError = hasCheckAttempt && hasFormatError;
  const errorMessage = shouldShowEmptyError
    ? 'Please enter a slug.'
    : shouldShowFormatError
      ? 'A slug may contain lowercase letters or numbers around hyphens only.'
      : duplicateCheckStatus === 'duplicate'
        ? 'This slug is already in use. Please choose another one.'
        : duplicateCheckStatus === 'error'
          ? 'Failed to verify slug availability. Please try again.'
          : null;
  const successMessage = duplicateCheckStatus === 'available' ? 'This slug is available.' : null;

  latestValueRef.current = value;

  useEffect(() => {
    setHasCheckAttempt(false);
    setDuplicateCheckStatus('idle');
  }, [value]);

  /**
   * Normalizes the typed slug and checks whether it is available.
   */
  const handleDuplicateCheck = async () => {
    setHasCheckAttempt(true);

    if (isEmpty || hasFormatError || !onCheckDuplicate) return;

    const requestId = ++duplicateCheckRequestIdRef.current;
    const requestSlug = normalizedValue;
    setDuplicateCheckStatus('checking');

    try {
      const isDuplicate = await onCheckDuplicate(requestSlug);

      if (
        duplicateCheckRequestIdRef.current !== requestId ||
        normalizeSlugInput(latestValueRef.current) !== requestSlug
      ) {
        return;
      }

      onChange(requestSlug);
      setDuplicateCheckStatus(isDuplicate ? 'duplicate' : 'available');
    } catch {
      if (
        duplicateCheckRequestIdRef.current !== requestId ||
        normalizeSlugInput(latestValueRef.current) !== requestSlug
      ) {
        return;
      }

      setDuplicateCheckStatus('error');
    }
  };

  return (
    <div className={cx(rootClass, className)}>
      <label className={labelClass} htmlFor={inputId}>
        Url
      </label>
      <div className={fieldRowClass}>
        <div className={fieldWrapClass}>
          <Input
            aria-describedby={
              errorMessage
                ? `${helpId} ${errorId}`
                : successMessage
                  ? `${helpId} ${successId}`
                  : helpId
            }
            aria-invalid={Boolean(errorMessage) || undefined}
            aria-label="Slug"
            className={cx(inputClass, isPublished ? lockedInputClass : undefined)}
            id={inputId}
            onChange={event => onChange(event.target.value)}
            placeholder="example-slug"
            readOnly={isPublished}
            type="text"
            value={value}
          />
          {isPublished ? (
            <span aria-hidden className={lockIconClass}>
              <LockIcon color="muted" size="md" />
            </span>
          ) : null}
        </div>
        {onCheckDuplicate && !isPublished ? (
          <Button
            disabled={duplicateCheckStatus === 'checking'}
            onClick={() => void handleDuplicateCheck()}
            size="sm"
            tone="black"
            type="button"
            variant="solid"
          >
            {duplicateCheckStatus === 'checking' ? 'Checking...' : 'Check availability'}
          </Button>
        ) : null}
      </div>
      <p className={helpTextClass} id={helpId}>
        {isPublished
          ? 'The slug cannot be changed after publishing.'
          : 'Enter a slug and check whether it is available.'}
      </p>
      {errorMessage ? (
        <p className={errorTextClass} id={errorId} role="alert">
          {errorMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className={successTextClass} id={successId} role="status">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
};

const rootClass = css({
  display: 'grid',
  gap: '2',
});

const labelClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'text',
});

const fieldWrapClass = css({
  flex: '1',
  position: 'relative',
});

const inputClass = css({
  paddingRight: '10',
});

const lockedInputClass = css({
  background: 'surfaceMuted',
});

const lockIconClass = css({
  position: 'absolute',
  right: '3',
  top: '[50%]',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
});

const helpTextClass = css({
  fontSize: 'sm',
  color: 'muted',
});

const fieldRowClass = css({
  display: 'flex',
  alignItems: 'stretch',
  gap: '3',
  '& button': {
    flex: 'none',
  },
});

const errorTextClass = css({
  fontSize: 'sm',
  color: 'error',
});

const successTextClass = css({
  fontSize: 'sm',
  color: 'success',
});
