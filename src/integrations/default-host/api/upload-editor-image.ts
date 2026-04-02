import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import type { EditorImageUploadKind } from '@/shared/lib/image/image-upload-kind';
import { optimizeContentImageFile } from '@/shared/lib/image/optimize-content-image-file';
import { optimizeThumbnailImageFile } from '@/shared/lib/image/optimize-thumbnail-image-file';

/**
 * Uploads an editor image through the default host HTTP endpoint.
 *
 * @param options Image upload options.
 * @param options.contentType Logical content type that scopes the upload target.
 * @param options.file Original file selected by the user.
 * @param options.imageKind Upload intent used to choose the image optimization path.
 * @returns The final public image URL returned by the host.
 * @throws When the response is not successful or does not include a public URL.
 */
export const uploadEditorImage = async ({
  contentType,
  file,
  imageKind,
}: {
  contentType: EditorContentType;
  file: File;
  imageKind: EditorImageUploadKind;
}): Promise<string> => {
  const optimizedFile =
    imageKind === 'thumbnail'
      ? await optimizeThumbnailImageFile(file)
      : await optimizeContentImageFile(file);
  const formData = new FormData();

  formData.set('contentType', contentType);
  formData.set('file', optimizedFile);
  formData.set('imageKind', imageKind);

  const response = await fetch('/api/images', {
    body: formData,
    method: 'POST',
  });
  let body: { error?: string; message?: string; url?: string } = {};

  try {
    body = (await response.json()) as { error?: string; message?: string; url?: string };
  } catch {
    body = {
      error: response.ok ? 'Image response parse failed' : 'Image upload failed',
      message: response.statusText || undefined,
    };
  }

  if (!response.ok || !body.url) {
    throw new Error(body.error ?? body.message ?? 'Image upload failed');
  }

  return body.url;
};
