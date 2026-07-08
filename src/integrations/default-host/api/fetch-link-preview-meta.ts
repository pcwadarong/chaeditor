import type { FetchLinkPreviewMeta } from '@/entities/editor-core/model/host-adapters';
import type { LinkEmbedData } from '@/shared/lib/markdown/link-embed';
import { normalizeHttpUrl } from '@/shared/lib/url/normalize-http-url';

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
 * Returns the value only when it is a string. The response body is untrusted at
 * runtime (its declared type is just a cast), so a malformed endpoint returning
 * a non-string field must not break rendering.
 */
const readStringField = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

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

    // The preview endpoint is host-owned but may be misconfigured or compromised,
    // so treat every field it returns as untrusted: guard the type before use
    // and reject non-http(s) URL schemes.
    const resolvedUrl = normalizeHttpUrl(readStringField(body.url)) ?? normalizeHttpUrl(url);
    if (!resolvedUrl) {
      return null;
    }

    return {
      description: readStringField(body.description) ?? '',
      favicon: normalizeHttpUrl(readStringField(body.favicon)),
      image: normalizeHttpUrl(readStringField(body.image)),
      siteName: readStringField(body.siteName) ?? '',
      title: readStringField(body.title) ?? resolvedUrl,
      url: resolvedUrl,
    };
  };
