import { createDefaultHostAdapters, createFetchLinkPreviewMeta } from '@/default-host';

describe('default-host link preview helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Under a configured endpoint, createFetchLinkPreviewMeta must request the url query and normalize the response body', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: async () => ({
        description: 'Preview description',
        favicon: 'https://cdn.example.com/favicon.ico',
        image: 'https://cdn.example.com/cover.png',
        siteName: 'example.com',
        title: 'Preview title',
        url: 'https://example.com/article',
      }),
      ok: true,
      statusText: 'OK',
    });
    const fetchLinkPreviewMeta = createFetchLinkPreviewMeta({
      endpoint: '/api/preview-meta',
      fetchFn: fetchFn as unknown as typeof fetch,
      headers: {
        'x-preview-source': 'test',
      },
    });

    await expect(fetchLinkPreviewMeta('https://example.com/article')).resolves.toEqual({
      description: 'Preview description',
      favicon: 'https://cdn.example.com/favicon.ico',
      image: 'https://cdn.example.com/cover.png',
      siteName: 'example.com',
      title: 'Preview title',
      url: 'https://example.com/article',
    });

    expect(fetchFn).toHaveBeenCalledWith(
      '/api/preview-meta?url=https%3A%2F%2Fexample.com%2Farticle',
      {
        headers: {
          'x-preview-source': 'test',
        },
        method: 'GET',
        signal: undefined,
      },
    );
  });

  it('Under a sparse but successful response, createFetchLinkPreviewMeta must fall back to the requested url and empty fields', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: async () => ({
        title: 'Fallback title',
      }),
      ok: true,
      statusText: 'OK',
    });
    const fetchLinkPreviewMeta = createFetchLinkPreviewMeta({
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    await expect(fetchLinkPreviewMeta('https://example.com/article')).resolves.toEqual({
      description: '',
      favicon: null,
      image: null,
      siteName: '',
      title: 'Fallback title',
      url: 'https://example.com/article',
    });
  });

  it('Under createDefaultHostAdapters, the helper must include upload adapters and a link preview fetcher', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: async () => ({
        title: 'Linked article',
        url: 'https://example.com/article',
      }),
      ok: true,
      statusText: 'OK',
    });

    const adapters = createDefaultHostAdapters({
      linkPreviewEndpoint: '/api/link-meta',
      linkPreviewFetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(typeof adapters.uploadFile).toBe('function');
    expect(typeof adapters.uploadImage).toBe('function');
    expect(typeof adapters.uploadVideo).toBe('function');
    await expect(adapters.fetchLinkPreviewMeta?.('https://example.com/article')).resolves.toEqual({
      description: '',
      favicon: null,
      image: null,
      siteName: '',
      title: 'Linked article',
      url: 'https://example.com/article',
    });
    expect(fetchFn).toHaveBeenCalledWith('/api/link-meta?url=https%3A%2F%2Fexample.com%2Farticle', {
      headers: undefined,
      method: 'GET',
      signal: undefined,
    });
  });
});
