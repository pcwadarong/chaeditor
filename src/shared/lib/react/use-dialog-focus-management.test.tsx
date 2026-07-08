import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { Modal } from '@/shared/ui/modal';

import '@testing-library/jest-dom/vitest';

describe('useDialogFocusManagement dialog stack', () => {
  it('Under stacked dialogs, Escape must close only the top-most dialog', () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();

    render(
      <>
        <Modal ariaLabel="First" closeAriaLabel="Close" isOpen onClose={onCloseFirst}>
          <button type="button">first</button>
        </Modal>
        <Modal ariaLabel="Second" closeAriaLabel="Close" isOpen onClose={onCloseSecond}>
          <button type="button">second</button>
        </Modal>
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseSecond).toHaveBeenCalledTimes(1);
    expect(onCloseFirst).not.toHaveBeenCalled();
  });

  it('Under a closed top dialog, Escape must then close the dialog below it', () => {
    const onCloseFirst = vi.fn();

    const { rerender } = render(
      <>
        <Modal ariaLabel="First" closeAriaLabel="Close" isOpen onClose={onCloseFirst}>
          <button type="button">first</button>
        </Modal>
        <Modal ariaLabel="Second" closeAriaLabel="Close" isOpen onClose={() => {}}>
          <button type="button">second</button>
        </Modal>
      </>,
    );

    // Close the top dialog; the one below becomes top-most.
    rerender(
      <>
        <Modal ariaLabel="First" closeAriaLabel="Close" isOpen onClose={onCloseFirst}>
          <button type="button">first</button>
        </Modal>
        <Modal ariaLabel="Second" closeAriaLabel="Close" isOpen={false} onClose={() => {}}>
          <button type="button">second</button>
        </Modal>
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseFirst).toHaveBeenCalledTimes(1);
  });
});
