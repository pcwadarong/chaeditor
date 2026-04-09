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

    if (!imageRenderer || typeof imageRenderer === 'string') {
      throw new Error('Image renderer must be a function component');
    }

    const renderImage = imageRenderer as (props: {
      alt?: string;
      node?: {
        position?: {
          start?: {
            offset?: number;
          };
        };
      };
      src?: string;
    }) => React.ReactElement;

    const firstElement = renderImage({
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
    const secondElement = renderImage({
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

    const firstMarkdownImage = firstElement as React.ReactElement<
      React.ComponentProps<typeof MarkdownImage>
    >;
    const secondMarkdownImage = secondElement as React.ReactElement<
      React.ComponentProps<typeof MarkdownImage>
    >;

    expect(firstMarkdownImage.props.imageIndex).toBe(0);
    expect(secondMarkdownImage.props.imageIndex).toBe(1);
  });
});
