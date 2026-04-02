import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import type { EditorImageUploadKind } from '@/shared/lib/image/image-upload-kind';
import { optimizeContentImageFile } from '@/shared/lib/image/optimize-content-image-file';
import { optimizeThumbnailImageFile } from '@/shared/lib/image/optimize-thumbnail-image-file';

/**
 * Optimizes an editor image, uploads it, and returns the public URL.
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
  const body = (await response.json()) as { error?: string; message?: string; url?: string };

  if (!response.ok || !body.url) {
    throw new Error(body.error ?? body.message ?? 'Image upload failed');
  }

  return body.url;
};
