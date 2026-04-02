import type { EditorContentType } from '@/entities/editor-core/model/content-types';

type UploadEditorVideoOptions = {
  contentType: EditorContentType;
  file: File;
  onProgress?: (percentage: number) => void;
  signal?: AbortSignal;
};

/**
 * Creates a normalized AbortError for canceled uploads.
 *
 * @returns An AbortError instance.
 */
const createAbortUploadError = () => {
  const error = new Error('Video upload aborted');

  error.name = 'AbortError';

  return error;
};

/**
 * Safely parses an XHR response body as JSON.
 *
 * @param responseText Raw XHR response body.
 * @returns Parsed response payload.
 */
const parseUploadResponse = (responseText: string) => {
  try {
    return JSON.parse(responseText) as { error?: string; message?: string; url?: string };
  } catch {
    return {};
  }
};

/**
 * Uploads a video file from the editor and reports progress through XHR.
 *
 * @param options Video upload options.
 * @param options.contentType Current editor content type.
 * @param options.file Video file to upload.
 * @param options.onProgress Optional progress callback.
 * @param options.signal Optional abort signal.
 * @returns The uploaded video URL.
 * @throws When the upload fails or does not return a URL.
 */
export const uploadEditorVideo = async ({
  contentType,
  file,
  onProgress,
  signal,
}: UploadEditorVideoOptions): Promise<string> => {
  const formData = new FormData();

  formData.set('contentType', contentType);
  formData.set('file', file);

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    /**
     * Cleans up XHR handlers and abort listeners.
     */
    const cleanup = () => {
      xhr.upload.onprogress = null;
      xhr.onload = null;
      xhr.onerror = null;
      xhr.onabort = null;
      signal?.removeEventListener('abort', handleAbortSignal);
    };

    /**
     * Aborts the XHR request when the external signal is canceled.
     */
    const handleAbortSignal = () => {
      xhr.abort();
    };

    xhr.open('POST', '/api/videos');

    xhr.upload.onprogress = event => {
      if (!event.lengthComputable) return;

      onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    };

    xhr.onload = () => {
      cleanup();

      const body = parseUploadResponse(xhr.responseText);

      if (xhr.status < 200 || xhr.status >= 300 || !body.url) {
        reject(new Error(body.error ?? body.message ?? 'Video upload failed'));
        return;
      }

      resolve(body.url);
    };

    xhr.onerror = () => {
      cleanup();
      reject(new Error('Video upload failed'));
    };

    xhr.onabort = () => {
      cleanup();
      reject(createAbortUploadError());
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }

      signal.addEventListener('abort', handleAbortSignal, { once: true });
    }

    xhr.send(formData);
  });
};
