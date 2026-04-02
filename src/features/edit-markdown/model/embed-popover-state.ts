import type { EditorContentType } from '@/entities/editor-core/model/content-types';

const IMAGE_UPLOAD_FAILED_WITH_RETRY_MESSAGE = 'Failed to upload the image. Please try again.';

type UploadEditorImageForEmbed = (input: {
  contentType: EditorContentType;
  file: File;
  imageKind: 'content';
}) => Promise<string>;

type UploadImageEmbedSourceParams = {
  contentType: EditorContentType;
  file: File;
  uploadEditorImage: UploadEditorImageForEmbed;
};

type UploadImageEmbedSourceResult = {
  errorMessage: string | null;
  url: string | null;
};

/**
 * Trims a popover input value and returns null for empty input.
 *
 * @param value Raw user input.
 * @returns A trimmed value or null.
 */
export const normalizeEmbedInput = (value: string) => {
  const normalizedValue = value.trim();

  return normalizedValue ? normalizedValue : null;
};

/**
 * Normalizes newline-separated input and removes empty or duplicate values.
 *
 * @param value Raw textarea input.
 * @returns A deduplicated value list.
 */
export const normalizeEmbedInputList = (value: string) => {
  const dedupedValues = new Set<string>();

  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      dedupedValues.add(line);
    });

  return Array.from(dedupedValues);
};

/**
 * Uploads an image for embed insertion and normalizes the result into a URL or user-facing error.
 *
 * @param contentType Current editor content type.
 * @param file Selected image file.
 * @param uploadEditorImage Upload function.
 * @returns A result object with a URL or an error message.
 */
export const uploadImageEmbedSource = async ({
  contentType,
  file,
  uploadEditorImage,
}: UploadImageEmbedSourceParams): Promise<UploadImageEmbedSourceResult> => {
  try {
    return {
      errorMessage: null,
      url: await uploadEditorImage({
        contentType,
        file,
        imageKind: 'content',
      }),
    };
  } catch (error) {
    console.error('uploadImageEmbedSource failed', {
      contentType,
      error,
      imageKind: 'content',
    });

    return {
      errorMessage: IMAGE_UPLOAD_FAILED_WITH_RETRY_MESSAGE,
      url: null,
    };
  }
};
