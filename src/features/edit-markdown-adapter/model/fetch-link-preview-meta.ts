import type { FetchLinkPreviewMeta } from '@/entities/editor-core';
import type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';

/**
 * Fetches link preview metadata through the current app's `/api/og` endpoint.
 *
 * @param url Target URL for preview metadata.
 * @param signal Abort signal for the request.
 * @returns Link preview metadata.
 */
export const fetchLinkPreviewMetaAdapter: FetchLinkPreviewMeta = async (url, signal) => {
  const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`OG fetch failed: ${response.status}`);
  }

  return (await response.json()) as LinkEmbedData;
};
