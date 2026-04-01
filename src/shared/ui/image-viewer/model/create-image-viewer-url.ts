/**
 * Creates a preview-friendly image URL.
 */
export const createImageViewerUrl = (rawUrl: string, baseUrl?: string): string => {
  const normalized = rawUrl.trim();

  if (!normalized) return rawUrl;

  try {
    if (/^https?:\/\//i.test(normalized)) {
      const parsedUrl = new URL(normalized);

      parsedUrl.searchParams.delete('download');
      parsedUrl.searchParams.delete('response-content-disposition');

      return parsedUrl.toString();
    }

    if (baseUrl) {
      const parsedUrl = new URL(normalized, baseUrl);

      parsedUrl.searchParams.delete('download');
      parsedUrl.searchParams.delete('response-content-disposition');

      return parsedUrl.toString();
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
};
