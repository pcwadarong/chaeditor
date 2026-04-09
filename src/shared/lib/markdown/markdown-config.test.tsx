import type { AnchorHTMLAttributes } from 'react';
import React from 'react';

import { getMarkdownOptions } from '@/shared/lib/markdown/markdown-config';
import { LinkEmbedCard } from '@/shared/ui/markdown/link-embed-card';

describe('markdown-config', () => {
  it('Under a host link preview fetcher, getMarkdownOptions must pass the fetcher to preview link cards', () => {
    const fetchLinkPreviewMeta = vi.fn();
    const anchor = getMarkdownOptions({
      adapters: {
        fetchLinkPreviewMeta,
      },
    }).components?.a as
      | ((props: AnchorHTMLAttributes<HTMLAnchorElement>) => React.ReactNode)
      | undefined;

    const element = anchor?.({
      children: 'preview',
      href: 'https://example.com',
      title: 'preview',
    });

    expect(React.isValidElement(element)).toBe(true);

    if (!React.isValidElement(element)) {
      throw new Error('Link preview element must be a valid React element');
    }

    const linkEmbedElement = element as React.ReactElement<{
      fetchLinkPreviewMeta?: unknown;
    }>;

    expect(linkEmbedElement.type).toBe(LinkEmbedCard);
    expect(linkEmbedElement.props.fetchLinkPreviewMeta).toBe(fetchLinkPreviewMeta);
  });

  it('Under a host link preview fetcher, getMarkdownOptions must pass the fetcher to card link cards', () => {
    const fetchLinkPreviewMeta = vi.fn();
    const anchor = getMarkdownOptions({
      adapters: {
        fetchLinkPreviewMeta,
      },
    }).components?.a as
      | ((props: AnchorHTMLAttributes<HTMLAnchorElement>) => React.ReactNode)
      | undefined;

    const element = anchor?.({
      children: 'card',
      href: 'https://example.com',
      title: 'card',
    });

    expect(React.isValidElement(element)).toBe(true);

    if (!React.isValidElement(element)) {
      throw new Error('Link card element must be a valid React element');
    }

    const linkEmbedElement = element as React.ReactElement<{
      fetchLinkPreviewMeta?: unknown;
    }>;

    expect(linkEmbedElement.type).toBe(LinkEmbedCard);
    expect(linkEmbedElement.props.fetchLinkPreviewMeta).toBe(fetchLinkPreviewMeta);
  });
});
