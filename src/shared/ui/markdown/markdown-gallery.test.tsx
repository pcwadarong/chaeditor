/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { MarkdownGallery } from '@/shared/ui/markdown/markdown-gallery';

vi.mock('@/shared/ui/markdown/markdown-image', () => ({
  MarkdownImage: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

describe('MarkdownGallery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Under a next button click, MarkdownGallery must request scrolling to the next slide', () => {
    render(
      <MarkdownGallery
        galleryId="gallery-test"
        items={[
          { alt: 'First', src: 'https://example.com/one.png', viewerId: 'image-0' },
          { alt: 'Second', src: 'https://example.com/two.png', viewerId: 'image-1' },
        ]}
      />,
    );

    const gallery = document.querySelector('[data-markdown-gallery="true"]');
    const scrollContainer = gallery?.querySelector(
      '[data-markdown-gallery-track="true"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer).toBeTruthy();
    if (!scrollContainer) throw new Error('scroll container is required');

    Object.defineProperty(scrollContainer, 'clientWidth', {
      configurable: true,
      value: 360,
    });
    const slides = Array.from(
      scrollContainer.querySelectorAll<HTMLElement>('[data-markdown-gallery-slide="true"]'),
    );
    Object.defineProperty(slides[0], 'offsetLeft', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(slides[1], 'offsetLeft', {
      configurable: true,
      value: 302,
    });
    scrollContainer.scrollTo = vi.fn();

    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      left: 302,
    });
  });

  it('Under a scroll to the end, MarkdownGallery must activate the last slide state', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    render(
      <MarkdownGallery
        galleryId="gallery-test"
        items={[
          { alt: 'First', src: 'https://example.com/one.png', viewerId: 'image-0' },
          { alt: 'Second', src: 'https://example.com/two.png', viewerId: 'image-1' },
        ]}
      />,
    );

    const gallery = document.querySelector('[data-markdown-gallery="true"]');
    const scrollContainer = gallery?.querySelector(
      '[data-markdown-gallery-track="true"]',
    ) as HTMLDivElement | null;

    expect(scrollContainer).toBeTruthy();
    if (!scrollContainer) throw new Error('scroll container is required');

    Object.defineProperty(scrollContainer, 'clientWidth', {
      configurable: true,
      value: 360,
    });
    Object.defineProperty(scrollContainer, 'scrollWidth', {
      configurable: true,
      value: 662,
    });

    Object.defineProperty(scrollContainer, 'scrollLeft', {
      configurable: true,
      value: 302,
      writable: true,
    });

    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous image' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Next image' })).toBeNull();
      expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe('Image 2 of 2');
      expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2');
    });
  });
});
