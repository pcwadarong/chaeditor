/**
 * Extracts the original URL from a wrapped Google search URL.
 */
const unwrapGoogleSearchUrl = (url: URL): string | null => {
  if (url.hostname !== 'www.google.com' || !url.pathname.startsWith('/search')) return null;

  const queryTarget = url.searchParams.get('q');
  if (!queryTarget) return null;

  try {
    return new URL(queryTarget).toString();
  } catch {
    return null;
  }
};

/**
 * Normalizes an image URL string.
 */
export const normalizeImageUrl = (rawUrl: string | null | undefined): string | null => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const unwrapped = unwrapGoogleSearchUrl(parsed);

    return unwrapped ?? parsed.toString();
  } catch {
    return null;
  }
};
