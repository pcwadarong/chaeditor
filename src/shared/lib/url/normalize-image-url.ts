/**
 * Extracts the original URL from a wrapped Google search redirect URL.
 */
const unwrapGoogleSearchUrl = (url: URL): string | null => {
  if (url.hostname !== 'www.google.com' || url.pathname !== '/search') return null;

  const queryTarget = url.searchParams.get('q');
  if (!queryTarget) return null;

  return normalizeImageUrl(queryTarget);
};

/**
 * Normalizes an image URL string.
 *
 * Only `http(s)` URLs and inline `data:image/*` URLs are accepted; other
 * schemes such as `javascript:` or `file:` are rejected, because gallery images
 * are rendered outside react-markdown and would otherwise bypass its URL
 * sanitization.
 */
export const normalizeImageUrl = (rawUrl: string | null | undefined): string | null => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === 'data:') {
      return /^data:image\//iu.test(trimmed) ? trimmed : null;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    const unwrapped = unwrapGoogleSearchUrl(parsed);

    return unwrapped ?? parsed.toString();
  } catch {
    return null;
  }
};
