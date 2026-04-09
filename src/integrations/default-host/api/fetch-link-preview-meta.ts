import type { FetchLinkPreviewMeta } from '@/entities/editor-core/model/host-adapters';
import type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';

type CreateFetchLinkPreviewMetaOptions = {
  endpoint?: string;
  fetchFn?: typeof fetch;
  headers?: HeadersInit;
};

type FetchLinkPreviewResponseBody = Partial<LinkEmbedData> & {
  error?: string;
  message?: string;
};

/**
 * Builds a query URL by appending the requested preview target.
 */
const buildLinkPreviewRequestUrl = (endpoint: string, url: string) =>
  `${endpoint}${endpoint.includes('?') ? '&' : '?'}url=${encodeURIComponent(url)}`;

/**
 * Creates a host adapter that fetches link preview metadata from a JSON endpoint.
 *
 * The endpoint is expected to return a JSON payload shaped like `LinkEmbedData`.
 */
export const createFetchLinkPreviewMeta =
  ({
    endpoint = '/api/link-preview',
    fetchFn = fetch,
    headers,
  }: CreateFetchLinkPreviewMetaOptions = {}): FetchLinkPreviewMeta =>
  async (url, signal) => {
    const response = await fetchFn(buildLinkPreviewRequestUrl(endpoint, url), {
      headers,
      method: 'GET',
      signal,
    });
    let body: FetchLinkPreviewResponseBody = {};

    try {
      body = (await response.json()) as FetchLinkPreviewResponseBody;
    } catch {
      body = {
        error: response.ok ? 'Link preview response parse failed' : 'Link preview request failed',
        message: response.statusText || undefined,
      };
    }

    if (!response.ok) {
      throw new Error(body.error ?? body.message ?? 'Link preview request failed');
    }

    if (!body.url && !body.title) {
      return null;
    }

    return {
      description: body.description ?? '',
      favicon: typeof body.favicon === 'string' ? body.favicon : null,
      image: typeof body.image === 'string' ? body.image : null,
      siteName: body.siteName ?? '',
      title: body.title ?? body.url ?? url,
      url: body.url ?? url,
    };
  };
