import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import type { EditorAttachment } from '@/entities/editor-core/model/editor-attachment';

type UploadEditorFileResponseBody = Partial<EditorAttachment> & {
  error?: string;
  message?: string;
};

/**
 * Uploads an attachment through the default host HTTP endpoint.
 *
 * @param options Attachment upload options.
 * @param options.contentType Logical content type that scopes the upload target.
 * @param options.file File selected by the user.
 * @returns Uploaded attachment metadata normalized for editor insertion.
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
