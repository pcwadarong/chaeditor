import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ImageViewerModal } from '@/shared/ui/image-viewer/image-viewer-modal';

describe('ImageViewerModal', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
      writable: true,
    });
  });

  const labels = {
    actionBarAriaLabel: 'Image Action bar',
    closeAriaLabel: 'Close',
    fitToScreenAriaLabel: 'Fit to screen',
    imageViewerAriaLabel: 'Image viewer',
    locateSourceAriaLabel: 'Jump to image location',
    nextAriaLabel: 'Next Image',
    previousAriaLabel: 'Previous Image',
    selectForFrameAriaLabel: 'Select as frame image',
    selectForFrameLabel: 'Select this image',
    thumbnailListAriaLabel: 'Thumbnail List',
    zoomInAriaLabel: 'Zoom in',
    zoomOutAriaLabel: 'Zoom out',
  };

  const items = [
    { alt: 'First Image', src: '/one.jpg' },
    { alt: 'Second Image', src: '/two.jpg' },
  ];

  it('Under thumbnail buttons, ImageViewerModal must provide descriptive accessibility labels and the current state', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'First Image 1' }).getAttribute('aria-current')).toBe(
      'true',
    );
    expect(
      screen.getByRole('button', { name: 'Second Image 2' }).getAttribute('aria-current'),
    ).toBeNull();
  });

  it('Under an empty alt value, ImageViewerModal must use the image viewer label fallback', () => {
    render(
      <ImageViewerModal
        initialIndex={0}
        items={[{ alt: '', src: '/empty-alt.jpg' }]}
        labels={labels}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Image viewer 1' })).toBeTruthy();
  });

  it('Under ArrowRight and ArrowLeft, ImageViewerModal must switch images', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(
      screen.getByRole('button', { name: 'Second Image 2' }).getAttribute('aria-current'),
    ).toBe('true');

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByRole('button', { name: 'First Image 1' }).getAttribute('aria-current')).toBe(
      'true',
    );
  });

  it('Under an external image URL outside remotePatterns, ImageViewerModal must render it as-is', () => {
    render(
      <ImageViewerModal
        initialIndex={0}
        items={[{ alt: 'External image', src: 'https://github.com/user-attachments/assets/demo' }]}
        labels={labels}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen
        .getAllByAltText('External image')
        .every(
          node => node.getAttribute('src') === 'https://github.com/user-attachments/assets/demo',
        ),
    ).toBe(true);
  });

  it('Under a backdrop click, ImageViewerModal must close', () => {
    const handleClose = vi.fn();

    render(
      <ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={handleClose} />,
    );

    fireEvent.click(document.querySelector('[data-image-viewer-backdrop="true"]') as HTMLElement);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('Under dialog rendering, ImageViewerModal must include the close and navigation buttons in the focus trap', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'First Image' });

    expect(dialog.contains(screen.getByRole('button', { name: 'Close' }))).toBe(true);
    expect(dialog.contains(screen.getByRole('button', { name: 'Previous Image' }))).toBe(true);
    expect(dialog.contains(screen.getByRole('button', { name: 'Next Image' }))).toBe(true);
  });

  it('Under the action bar source button, ImageViewerModal must request a jump to the original image location', () => {
    const handleLocateSource = vi.fn();

    render(
      <ImageViewerModal
        initialIndex={0}
        items={items}
        labels={labels}
        onClose={vi.fn()}
        onLocateSource={handleLocateSource}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Jump to image location' }));

    expect(handleLocateSource).toHaveBeenCalledWith(0);
  });

  it('Under no source-location handler, ImageViewerModal must not render the locate button', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Jump to image location' })).toBeNull();
  });

  it('Under the frame selection button, ImageViewerModal must pass the selected index outward', () => {
    const handleSelectCurrentImage = vi.fn();

    render(
      <ImageViewerModal
        initialIndex={0}
        items={items}
        labels={labels}
        onClose={vi.fn()}
        onSelectCurrentImage={handleSelectCurrentImage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select as frame image' }));

    expect(handleSelectCurrentImage).toHaveBeenCalledWith(0);
  });

  it('Under a frame selection button click, ImageViewerModal must not bubble into backdrop close', () => {
    const handleClose = vi.fn();
    const handleSelectCurrentImage = vi.fn();

    render(
      <ImageViewerModal
        initialIndex={0}
        items={items}
        labels={labels}
        onClose={handleClose}
        onSelectCurrentImage={handleSelectCurrentImage}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select as frame image' }));

    expect(handleSelectCurrentImage).toHaveBeenCalledWith(0);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Under frame selection rendering, ImageViewerModal must render a visible text label', () => {
    render(
      <ImageViewerModal
        initialIndex={0}
        items={items}
        labels={labels}
        onClose={vi.fn()}
        onSelectCurrentImage={vi.fn()}
      />,
    );

    expect(screen.getByText('Select this image')).toBeTruthy();
  });

  it('Under no frame selection handler, ImageViewerModal must not render the selection button', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Select as frame image' })).toBeNull();
  });

  it('Under action bar button hover, ImageViewerModal must show the top tooltip and hide it on leave', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    const fitToScreenButton = screen.getByRole('button', { name: 'Fit to screen' });

    fireEvent.mouseEnter(fitToScreenButton);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe('Fit to screen');
    expect(tooltip.closest('[role="toolbar"]')).toBeNull();

    fireEvent.mouseLeave(fitToScreenButton);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('Under action bar button press start, ImageViewerModal must show the top tooltip', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    const fitToScreenButton = screen.getByRole('button', { name: 'Fit to screen' });

    fireEvent.pointerDown(fitToScreenButton);

    expect(screen.getByRole('tooltip').textContent).toBe('Fit to screen');
  });

  it('Under clicks inside the image, ImageViewerModal must not bubble into backdrop close', () => {
    const handleClose = vi.fn();

    render(
      <ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={handleClose} />,
    );

    fireEvent.click(document.querySelector('[data-image-viewer-image="true"]') as HTMLElement);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Under thumbnail clicks, ImageViewerModal must not bubble into backdrop close', () => {
    const handleClose = vi.fn();

    render(
      <ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={handleClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Second Image 2' }));

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Under action bar button clicks, ImageViewerModal must not bubble into backdrop close', () => {
    const handleClose = vi.fn();

    render(
      <ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={handleClose} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Fit to screen' }));

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('Under a zoomed-in state, ImageViewerModal must move the image through pointer dragging', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);
    const viewport = document.querySelector(
      '[data-image-viewer-viewport="true"]',
    ) as HTMLDivElement;
    const image = document.querySelector('[data-image-viewer-image="true"]') as HTMLImageElement;

    Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(viewport, 'setPointerCapture', { configurable: true, value: vi.fn() });
    Object.defineProperty(viewport, 'hasPointerCapture', {
      configurable: true,
      value: vi.fn(() => true),
    });
    Object.defineProperty(viewport, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(image, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(image, 'clientHeight', { configurable: true, value: 100 });

    for (let step = 0; step < 4; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    }

    fireEvent.pointerDown(viewport, { button: 0, clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(viewport, { clientX: 160, clientY: 120, pointerId: 1 });

    expect(image.style.transform).toContain('translate3d(');
    expect(image.style.transform).toContain('scale(2)');
    expect(image.style.transform).not.toContain('translate3d(0px, 0px, 0)');
  });

  it('Under repeated zoom-in button presses, ImageViewerModal must keep zooming in', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    for (let step = 0; step < 6; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    }

    expect(screen.getByText('250%')).toBeTruthy();
  });

  it('Under previous and next navigation, ImageViewerModal must apply the direction data attribute', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next Image' }));

    expect(
      document
        .querySelector('[data-transition-direction="next"]')
        ?.querySelector('[data-image-viewer-image="true"]'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Previous Image' }));

    expect(
      document
        .querySelector('[data-transition-direction="previous"]')
        ?.querySelector('[data-image-viewer-image="true"]'),
    ).toBeTruthy();
  });

  it('Under a mouse wheel interaction, ImageViewerModal must zoom in the image', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);
    const viewport = document.querySelector(
      '[data-image-viewer-viewport="true"]',
    ) as HTMLDivElement;

    fireEvent.wheel(viewport, { deltaY: -100 });

    expect(screen.getByText('125%')).toBeTruthy();
  });

  it('Under a zoomed-in state, ImageViewerModal must keep the zoom dock buttons clickable', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(screen.getByText('125%')).toBeTruthy();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Zoom in' }), { pointerId: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));

    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('Under two-finger pointer movement, ImageViewerModal must support pinch zoom', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);
    const viewport = document.querySelector(
      '[data-image-viewer-viewport="true"]',
    ) as HTMLDivElement;

    Object.defineProperty(viewport, 'setPointerCapture', { configurable: true, value: vi.fn() });
    Object.defineProperty(viewport, 'hasPointerCapture', {
      configurable: true,
      value: vi.fn(() => true),
    });
    Object.defineProperty(viewport, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    });

    fireEvent.pointerDown(viewport, {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      pointerType: 'touch',
    });
    fireEvent.pointerDown(viewport, {
      clientX: 200,
      clientY: 100,
      pointerId: 2,
      pointerType: 'touch',
    });
    fireEvent.pointerMove(viewport, {
      clientX: 260,
      clientY: 100,
      pointerId: 2,
      pointerType: 'touch',
    });

    expect(screen.getByText('160%')).toBeTruthy();
  });

  it('Under the fit-to-screen button, ImageViewerModal must restore the default scale from a zoomed-in state', () => {
    render(<ImageViewerModal initialIndex={0} items={items} labels={labels} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fit to screen' }));

    expect(screen.getByText('100%')).toBeTruthy();
  });
});
