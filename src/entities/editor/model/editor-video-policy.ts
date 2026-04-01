const MB = 1024 * 1024;

export const EDITOR_VIDEO_MAX_FILE_SIZE = 500 * MB;

export const EDITOR_VIDEO_ALLOWED_EXTENSIONS = ['m4v', 'mov', 'mp4', 'webm'] as const;

export const EDITOR_VIDEO_ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
  'application/octet-stream',
] as const;

export const EDITOR_VIDEO_FILE_INPUT_ACCEPT = [
  ...EDITOR_VIDEO_ALLOWED_EXTENSIONS.map(extension => `.${extension}`),
  ...EDITOR_VIDEO_ALLOWED_MIME_TYPES,
].join(',');

/**
 * Checks whether the file name uses an allowed video extension.
 *
 * @param fileName Original file name to validate.
 * @returns `true` when the extension is allowed.
 */
export const isAllowedEditorVideoExtension = (fileName: string) => {
  const baseName = fileName.trim().split('/').pop()?.split('\\').pop()?.trim() ?? '';
  const lastDotIndex = baseName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === baseName.length - 1) return false;

  const extension = baseName.slice(lastDotIndex + 1).toLowerCase();

  return EDITOR_VIDEO_ALLOWED_EXTENSIONS.includes(
    extension as (typeof EDITOR_VIDEO_ALLOWED_EXTENSIONS)[number],
  );
};

/**
 * Checks whether the file matches the video upload policy.
 *
 * @param file File to validate.
 * @returns `true` when the MIME type and size are allowed.
 */
export const isAllowedEditorVideoFile = (file: File) => {
  if (!file.name.trim() || file.size <= 0 || file.size > EDITOR_VIDEO_MAX_FILE_SIZE) {
    return false;
  }

  if (!isAllowedEditorVideoExtension(file.name)) {
    return false;
  }

  if (!file.type) {
    return true;
  }

  return EDITOR_VIDEO_ALLOWED_MIME_TYPES.includes(
    file.type as (typeof EDITOR_VIDEO_ALLOWED_MIME_TYPES)[number],
  );
};
