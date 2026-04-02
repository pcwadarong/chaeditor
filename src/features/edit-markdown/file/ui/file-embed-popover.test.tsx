import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { FileEmbedPopover } from '@/features/edit-markdown/file';

type PopoverMockProps = {
  children: React.ReactNode | ((args: { closePopover: () => void }) => React.ReactNode);
  triggerAriaLabel?: string;
  triggerContent?: React.ReactNode;
};

vi.mock('@/shared/ui/popover/popover', () => ({
  Popover: ({ children, triggerAriaLabel, triggerContent }: PopoverMockProps) => (
    <div>
      <button aria-label={triggerAriaLabel} type="button">
        {triggerContent ?? triggerAriaLabel}
      </button>
      {typeof children === 'function' ? children({ closePopover: vi.fn() }) : children}
    </div>
  ),
}));

describe('FileEmbedPopover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Under a successful attachment upload, FileEmbedPopover must pass the uploaded metadata to onApply', async () => {
    const onApply = vi.fn();
    const onUploadFile = vi.fn(async () => ({
      contentType: 'application/pdf',
      fileName: 'resume.pdf',
      fileSize: 2048,
      url: 'https://example.com/resume.pdf',
    }));

    render(
      <FileEmbedPopover contentType="article" onApply={onApply} onUploadFile={onUploadFile} />,
    );

    const fileInput = screen.getByLabelText('Upload attachment');
    fireEvent.change(fileInput, {
      target: {
        files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('resume.pdf')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    expect(onApply).toHaveBeenCalledWith(
      {
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        fileSize: 2048,
        url: 'https://example.com/resume.pdf',
      },
      expect.any(Function),
    );
  });

  it('Under an upload failure, FileEmbedPopover must show an error and skip onApply', async () => {
    const onApply = vi.fn();
    const onUploadFile = vi.fn().mockRejectedValueOnce(new Error('upload failed'));

    render(
      <FileEmbedPopover contentType="article" onApply={onApply} onUploadFile={onUploadFile} />,
    );

    fireEvent.change(screen.getByLabelText('Upload attachment'), {
      target: {
        files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Failed to upload the file. Please try again.',
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    expect(onApply).not.toHaveBeenCalled();
  });

  it('Under a retry after upload failure, FileEmbedPopover must allow insertion after a successful retry', async () => {
    const onApply = vi.fn();
    const onUploadFile = vi
      .fn()
      .mockRejectedValueOnce(new Error('upload failed'))
      .mockResolvedValue({
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        fileSize: 2048,
        url: 'https://example.com/resume.pdf',
      });

    render(
      <FileEmbedPopover contentType="article" onApply={onApply} onUploadFile={onUploadFile} />,
    );

    fireEvent.change(screen.getByLabelText('Upload attachment'), {
      target: {
        files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Failed to upload the file. Please try again.',
      );
    });

    fireEvent.change(screen.getByLabelText('Upload attachment'), {
      target: {
        files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('resume.pdf')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    expect(onApply).toHaveBeenCalledWith(
      {
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        fileSize: 2048,
        url: 'https://example.com/resume.pdf',
      },
      expect.any(Function),
    );
  });
});
