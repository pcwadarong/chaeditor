import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ToastViewport } from '@/shared/ui/toast/toast';

import '@testing-library/jest-dom/vitest';

describe('ToastViewport', () => {
  it('Under mixed toast tones, ToastViewport must expose alert and status semantics correctly', () => {
    render(
      <ToastViewport
        items={[
          {
            id: 'success-toast',
            message: 'Saved',
            tone: 'success',
          },
          {
            description: 'Try again in a moment.',
            id: 'error-toast',
            message: 'Failed',
            tone: 'error',
          },
        ]}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  });

  it('Under a close button click, ToastViewport must forward the toast id to onClose', () => {
    const onClose = vi.fn();

    render(
      <ToastViewport
        items={[
          {
            id: 'toast-1',
            message: 'Saved',
            tone: 'success',
          },
        ]}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledWith('toast-1');
  });
});
