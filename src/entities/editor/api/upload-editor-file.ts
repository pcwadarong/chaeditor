import type { EditorAttachment } from '@/entities/editor/model/editor-attachment';
import type { EditorContentType } from '@/entities/editor/model/editor-types';

type UploadEditorFileResponseBody = Partial<EditorAttachment> & {
  error?: string;
  message?: string;
};

/**
 * Uploads an attachment selected in the editor and returns its public metadata.
 *
 * @param options Attachment upload options.
 * @param options.contentType Current editor content type.
 * @param options.file File to upload.
 * @returns Uploaded attachment metadata.
 * @throws When the upload fails or the response payload is invalid.
 */
export const uploadEditorFile = async ({
  contentType,
  file,
}: {
  contentType: EditorContentType;
  file: File;
}): Promise<EditorAttachment> => {
  const formData = new FormData();

  formData.set('contentType', contentType);
  formData.set('file', file);

  const response = await fetch('/api/attachments', {
    body: formData,
    method: 'POST',
  });
  let body: UploadEditorFileResponseBody = {};

  try {
    body = (await response.json()) as UploadEditorFileResponseBody;
  } catch {
    body = {
      error: response.ok ? 'Attachment response parse failed' : 'Attachment upload failed',
      message: response.statusText || undefined,
    };
  }

  if (
    !response.ok ||
    !body.url ||
    !body.fileName ||
    typeof body.fileSize !== 'number' ||
    !body.contentType
  ) {
    throw new Error(body.error ?? body.message ?? 'Attachment upload failed');
  }

  return {
    contentType: body.contentType,
    fileName: body.fileName,
    fileSize: body.fileSize,
    url: body.url,
  };
};
