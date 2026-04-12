import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';

import { Modal } from '@/shared/ui/modal/modal';

describe('Modal', () => {
  it('Under a provided dialog label, Modal must expose it as the accessible name', async () => {
    render(
      <Modal
        ariaDescribedBy="modal-description"
        ariaLabelledBy="modal-title"
        closeAriaLabel="Close"
        isOpen
        onClose={vi.fn()}
      >
        <div>
          <h2 id="modal-title">Test modal</h2>
          <p id="modal-description">Description Text</p>
        </div>
      </Modal>,
    );

    const dialog = await screen.findByRole('dialog', { name: 'Test modal' });

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('modal-description');
  });

  it('Under opening, Modal must move focus to the configured initial focus element', async () => {
    const inputRef = createRef<HTMLInputElement>();

    render(
      <Modal closeAriaLabel="Close" initialFocusRef={inputRef} isOpen onClose={vi.fn()}>
        <input ref={inputRef} aria-label="Password" />
      </Modal>,
    );

    await waitFor(() => {
      expect(inputRef.current).toBe(document.activeElement);
    });
  });

  it('Under Tab and Shift+Tab, Modal must trap focus within the dialog', async () => {
    render(
      <Modal closeAriaLabel="Close" isOpen onClose={vi.fn()}>
        <div>
          <button type="button">First</button>
          <button type="button">Last</button>
        </div>
      </Modal>,
    );

    const closeButton = await screen.findByRole('button', { name: 'Close' });
    const lastButton = screen.getByRole('button', { name: 'Last' });

    lastButton.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toBe(document.activeElement);

    closeButton.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(lastButton).toBe(document.activeElement);
  });

  it('Under closing, Modal must restore focus to the previously active element', async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <Modal closeAriaLabel="Close" isOpen={false} onClose={onClose}>
          <div>Content</div>
        </Modal>
      </>,
    );
    const triggerButton = screen.getByRole('button', { name: 'Trigger' });
    triggerButton.focus();
    expect(triggerButton).toBe(document.activeElement);

    rerender(
      <>
        <button type="button">Trigger</button>
        <Modal closeAriaLabel="Close" isOpen onClose={onClose}>
          <div>Content</div>
        </Modal>
      </>,
    );

    await screen.findByRole('dialog');

    rerender(
      <>
        <button type="button">Trigger</button>
        <Modal closeAriaLabel="Close" isOpen={false} onClose={onClose}>
          <div>Content</div>
        </Modal>
      </>,
    );

    await waitFor(() => {
      expect(triggerButton).toBe(document.activeElement);
    });
  });

  it('Under Escape, Modal must prevent the default behavior and call onClose', async () => {
    const onClose = vi.fn();

    render(
      <Modal closeAriaLabel="Close" isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>,
    );

    await screen.findByRole('dialog');
    const isDefaultAllowed = fireEvent.keyDown(window, { cancelable: true, key: 'Escape' });

    expect(isDefaultAllowed).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Under a backdrop click, Modal must call onClose', async () => {
    const onClose = vi.fn();

    render(
      <Modal closeAriaLabel="Close" isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>,
    );

    const dialog = await screen.findByRole('dialog');
    const backdrop = dialog.parentElement as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Under an open modal, Modal must lock body scroll until it closes', async () => {
    const { rerender } = render(
      <Modal closeAriaLabel="Close" isOpen onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    await screen.findByRole('dialog');
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal closeAriaLabel="Close" isOpen={false} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('Under slot className overrides, Modal must merge them into the backdrop frame and close button', async () => {
    render(
      <Modal
        backdropClassName="modal-backdrop-override"
        closeAriaLabel="Close"
        closeButtonClassName="modal-close-override"
        frameClassName="modal-frame-override"
        isOpen
        onClose={vi.fn()}
      >
        <div>Content</div>
      </Modal>,
    );

    const dialog = await screen.findByRole('dialog');
    const closeButton = screen.getByRole('button', { name: 'Close' });
    const backdrop = dialog.parentElement;

    expect(backdrop?.className).toContain('modal-backdrop-override');
    expect(dialog.className).toContain('modal-frame-override');
    expect(closeButton.className).toContain('modal-close-override');
  });
});
