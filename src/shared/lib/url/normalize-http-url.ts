/**
 * Normalizes an external HTTP(S) URL string.
 */
export const normalizeHttpUrl = (rawUrl: string | null | undefined): string | null => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};
