/**
 * Sanitizes a URL taken from authored document content before it is placed into
 * an `href`/`src` attribute.
 *
 * Custom embed segments (`<Attachment>`, `<Video>`) never pass through
 * react-markdown's built-in `urlTransform`, so their URLs must be validated
 * here instead. Absolute `http(s)` URLs and root-relative paths (host-resolved
 * storage keys) are allowed; every other scheme (`javascript:`, `data:`,
 * `vbscript:`, `file:`, …) and protocol-relative `//host` URLs are rejected.
 *
 * @param rawUrl A URL string from document content.
 * @returns The safe URL, or `null` when it is not a permitted shape.
 */
export const sanitizeEmbedResourceUrl = (rawUrl: string | null | undefined): string | null => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  // Reject protocol-relative URLs (`//host/...`) before the root-relative check.
  if (trimmed.startsWith('//')) return null;

  // Allow root-relative paths such as host-resolved storage keys.
  if (trimmed.startsWith('/')) return trimmed;

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
