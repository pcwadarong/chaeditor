const EDITOR_ERROR_PREFIX = '__EDITOR_ERROR__';

export const EDITOR_ERROR_MESSAGE = {
  draftDeleteFailed: 'Failed to delete the draft. Please try again.',
  duplicateSlug: 'This slug is already in use. Please choose another one.',
  draftSaveFailed: 'Failed to save the draft. Please try again.',
  draftSaveInvalidState: 'Please review the draft save request.',
  draftSaveInvalidSettings: 'Please review the draft save settings.',
  githubUrlInvalid: 'The GitHub URL must start with http:// or https://.',
  imageUploadFailedWithRetry: 'Failed to upload the image. Please try again.',
  serviceRoleUnavailable:
    'Admin save permissions are not configured. Please check the environment variables.',
  missingCompleteTranslation: 'At least one locale version must include both a title and content.',
  missingKoTitle: 'Please enter a Korean title.',
  missingSlug: 'Please enter a slug.',
  publishFailed: 'Failed to publish. Please try again.',
  publishInvalidSettings: 'Please review the publish settings.',
  publishInvalidState: 'Please review the editor state to publish.',
  publishedContentCannotBeRescheduled:
    'Published content cannot be switched back to scheduled publishing.',
  scheduledPublishMustBeFuture: 'The publish time must be in the future.',
  slugCheckFailed: 'Failed to verify slug availability.',
  slugVerificationRequired: 'Please complete the slug availability check.',
  slugFormatInvalid: 'The slug may contain lowercase letters, numbers, and hyphens only.',
  thumbnailUploadFailed: 'Failed to upload the thumbnail.',
  thumbnailUploadFailedWithRetry: 'Failed to upload the thumbnail. Please try again.',
  websiteUrlInvalid: 'The website URL must start with http:// or https://.',
} as const;

export type EditorErrorCode = keyof typeof EDITOR_ERROR_MESSAGE;
export type EditorPublishInlineErrorField =
  | 'githubUrl'
  | 'koTitle'
  | 'publishAt'
  | 'slug'
  | 'websiteUrl';

const EDITOR_PUBLISH_INLINE_ERROR_FIELD_BY_CODE: Record<
  EditorErrorCode,
  EditorPublishInlineErrorField | null
> = {
  draftDeleteFailed: null,
  duplicateSlug: 'slug',
  draftSaveFailed: null,
  draftSaveInvalidSettings: null,
  draftSaveInvalidState: null,
  githubUrlInvalid: 'githubUrl',
  imageUploadFailedWithRetry: null,
  serviceRoleUnavailable: null,
  missingCompleteTranslation: null,
  missingKoTitle: 'koTitle',
  missingSlug: 'slug',
  publishFailed: null,
  publishInvalidSettings: null,
  publishInvalidState: null,
  publishedContentCannotBeRescheduled: 'publishAt',
  scheduledPublishMustBeFuture: 'publishAt',
  slugCheckFailed: null,
  slugVerificationRequired: 'slug',
  slugFormatInvalid: 'slug',
  thumbnailUploadFailed: null,
  thumbnailUploadFailedWithRetry: null,
  websiteUrlInvalid: 'websiteUrl',
};

/**
 * Maps an editor error code to a user-facing message.
 */
export const resolveEditorErrorMessage = (code: EditorErrorCode) => EDITOR_ERROR_MESSAGE[code];

/**
 * Creates an editor error object that can be safely passed across the network.
 */
export const createEditorError = (
  code: EditorErrorCode,
  message: string = resolveEditorErrorMessage(code),
) => new Error(`${EDITOR_ERROR_PREFIX}:${code}:${message}`);

/**
 * Normalizes an unknown error into an editor error shape.
 */
export const parseEditorError = (
  error: unknown,
  fallbackCode: EditorErrorCode,
): {
  code: EditorErrorCode;
  message: string;
} => {
  if (error instanceof Error && error.message.startsWith(`${EDITOR_ERROR_PREFIX}:`)) {
    const [, code, ...messageParts] = error.message.split(':');
    const normalizedCode = code as EditorErrorCode;

    return {
      code: normalizedCode,
      message: messageParts.join(':') || resolveEditorErrorMessage(normalizedCode),
    };
  }

  if (error instanceof Error && error.message) {
    return {
      code: fallbackCode,
      message: resolveEditorErrorMessage(fallbackCode),
    };
  }

  return {
    code: fallbackCode,
    message: resolveEditorErrorMessage(fallbackCode),
  };
};

/**
 * Resolves the inline field key for an editor error shown in the publish panel.
 */
export const resolveEditorPublishInlineErrorField = (
  code: EditorErrorCode,
): EditorPublishInlineErrorField | null => EDITOR_PUBLISH_INLINE_ERROR_FIELD_BY_CODE[code] ?? null;
