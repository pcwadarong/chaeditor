import React from 'react';

import type { MarkdownImageViewerItem } from '@/entities/editor-core/model/collect-markdown-images';
import { createMarkdownComponents } from '@/shared/lib/markdown/markdown-components';
import { MarkdownImage } from '@/shared/ui/markdown/markdown-image';

describe('markdown-components', () => {
  it('Under duplicate image src values, createMarkdownComponents must resolve image indices by source offset', () => {
    const items: MarkdownImageViewerItem[] = [
      {
        alt: 'First',
        sourceOffset: 0,
        src: 'https://example.com/repeated.png',
        viewerId: 'markdown-image-0',
      },
      {
        alt: 'Second',
        sourceOffset: 48,
        src: 'https://example.com/repeated.png',
        viewerId: 'markdown-image-1',
      },
    ];

    const imageRenderer = createMarkdownComponents({
      items,
    }).img;

    const firstElement = imageRenderer?.({
      alt: 'First',
      node: {
        position: {
          start: {
            offset: 0,
          },
        },
      },
      src: 'https://example.com/repeated.png',
    } as never);
    const secondElement = imageRenderer?.({
      alt: 'Second',
      node: {
        position: {
          start: {
            offset: 48,
          },
        },
      },
      src: 'https://example.com/repeated.png',
    } as never);

    expect(React.isValidElement(firstElement)).toBe(true);
    expect(React.isValidElement(secondElement)).toBe(true);

    if (!React.isValidElement(firstElement) || !React.isValidElement(secondElement)) {
      throw new Error('Image renderer must return valid React elements');
    }

    expect(firstElement.type).toBe(MarkdownImage);
    expect(secondElement.type).toBe(MarkdownImage);
    expect(firstElement.props.imageIndex).toBe(0);
    expect(secondElement.props.imageIndex).toBe(1);
  });
});
