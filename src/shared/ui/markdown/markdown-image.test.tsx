import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import type { MarkdownImageViewerItem } from '@/shared/lib/markdown/collect-markdown-images';
import { MarkdownImage } from '@/shared/ui/markdown/markdown-image';

vi.mock('@/shared/ui/image-viewer/image-viewer-modal', () => ({
  ImageViewerModal: ({
    initialIndex,
    items,
    labels,
    onClose,
    onLocateSource,
  }: {
    initialIndex: number | null;
    items: MarkdownImageViewerItem[];
    labels: { imageViewerAriaLabel?: string };
    onClose: () => void;
    onLocateSource?: (currentIndex: number) => void;
  }) =>
    initialIndex !== null ? (
      <div
        aria-label={labels.imageViewerAriaLabel}
        data-alt={items[0]?.alt}
        data-count={String(items.length)}
        data-initial-index={String(initialIndex)}
        data-src={items[0]?.src}
        data-testid="image-viewer-modal"
        role="dialog"
      >
        <button onClick={() => onClose()} type="button">
          close-with-second-image
        </button>
        <button onClick={() => onLocateSource?.(1)} type="button">
          locate-second-image
        </button>
      </div>
    ) : null,
}));

describe('MarkdownImage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Under image rendering, MarkdownImage must render the image itself as the viewer trigger', () => {
    render(<MarkdownImage alt="Description" src="https://example.com/image.png" />);

    const trigger = screen.getByRole('button', { name: 'Description · Open image' });

    expect(trigger.tagName).toBe('IMG');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('Under click, MarkdownImage must open the image viewer', () => {
    render(<MarkdownImage alt="Description" src="https://example.com/image.png" />);

    fireEvent.click(screen.getByRole('button', { name: 'Description · Open image' }));

    const modal = screen.getByTestId('image-viewer-modal');
    expect(modal.getAttribute('data-src')).toBe('https://example.com/image.png');
    expect(modal.getAttribute('data-alt')).toBe('Description');
  });

  it('Under custom viewer labels, MarkdownImage must prefer the host labels over the built-in defaults', () => {
    render(
      <MarkdownImage
        alt="Description"
        imageViewerLabels={{
          imageViewerAriaLabel: 'Custom Image viewer',
          openAriaLabel: 'Custom Open',
        }}
        src="https://example.com/image.png"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Description · Custom Open' }));

    expect(screen.getByRole('dialog', { name: 'Custom Image viewer' })).toBeTruthy();
  });

  it('Under viewerItems, MarkdownImage must pass the full content image list and the current index', () => {
    render(
      <MarkdownImage
        alt="Second Image"
        imageIndex={1}
        src="https://example.com/two.png"
        viewerItems={[
          {
            alt: 'First Image',
            src: 'https://example.com/one.png',
            viewerId: 'markdown-image-0',
          },
          {
            alt: 'Second Image',
            src: 'https://example.com/two.png',
            viewerId: 'markdown-image-1',
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Second Image · Open image' }));

    const modal = screen.getByTestId('image-viewer-modal');
    expect(modal.getAttribute('data-count')).toBe('2');
    expect(modal.getAttribute('data-initial-index')).toBe('1');
  });

  it('Under Enter and Space, MarkdownImage must open the image viewer', () => {
    render(<MarkdownImage alt="Keyboard image" src="https://example.com/keyboard.png" />);

    const trigger = screen.getByRole('button', { name: 'Keyboard image · Open image' });

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'close-with-second-image' }));
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(screen.getByRole('dialog', { name: 'Image viewer' })).toBeTruthy();
  });

  it('Under the image location action, MarkdownImage must restore scroll to the currently viewed image location', () => {
    const scrollToMock = vi.fn();
    const viewerItems = [
      {
        alt: 'First Image',
        src: 'https://example.com/one.png',
        viewerId: 'markdown-image-0',
      },
      {
        alt: 'Second Image',
        src: 'https://example.com/two.png',
        viewerId: 'markdown-image-1',
      },
    ] satisfies MarkdownImageViewerItem[];
    const { container } = render(
      <div data-primary-scroll-region="true">
        <MarkdownImage
          alt="First Image"
          imageIndex={0}
          src="https://example.com/one.png"
          viewerItems={viewerItems}
        />
        <MarkdownImage
          alt="Second Image"
          imageIndex={1}
          src="https://example.com/two.png"
          viewerItems={viewerItems}
        />
      </div>,
    );
    const scrollRegion = container.querySelector(
      '[data-primary-scroll-region="true"]',
    ) as HTMLElement;
    const secondImage = screen.getByRole('button', { name: 'Second Image · Open image' });

    Object.defineProperty(scrollRegion, 'scrollTop', {
      configurable: true,
      value: 120,
      writable: true,
    });
    Object.defineProperty(scrollRegion, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
      writable: true,
    });
    Object.defineProperty(scrollRegion, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ height: 600, left: 0, top: 80, width: 800 }),
    });
    Object.defineProperty(secondImage, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ height: 240, left: 0, top: 420, width: 320 }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'First Image · Open image' }));
    fireEvent.click(screen.getByRole('button', { name: 'locate-second-image' }));

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 280,
    });
  });

  it('Under a close-only action, MarkdownImage must not move scroll to the original image location', () => {
    const scrollToMock = vi.fn();
    const viewerItems = [
      {
        alt: 'First Image',
        src: 'https://example.com/one.png',
        viewerId: 'markdown-image-0',
      },
      {
        alt: 'Second Image',
        src: 'https://example.com/two.png',
        viewerId: 'markdown-image-1',
      },
    ] satisfies MarkdownImageViewerItem[];
    const { container } = render(
      <div data-primary-scroll-region="true">
        <MarkdownImage
          alt="First Image"
          imageIndex={0}
          src="https://example.com/one.png"
          viewerItems={viewerItems}
        />
      </div>,
    );
    const scrollRegion = container.querySelector(
      '[data-primary-scroll-region="true"]',
    ) as HTMLElement;

    Object.defineProperty(scrollRegion, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
      writable: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'First Image · Open image' }));
    fireEvent.click(screen.getByRole('button', { name: 'close-with-second-image' }));

    expect(scrollToMock).not.toHaveBeenCalled();
  });
});
