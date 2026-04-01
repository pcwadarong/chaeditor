import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import { ImageEmbedPopover } from '@/features/edit-markdown/ui/image-embed-popover';

vi.mock('@/shared/ui/modal/modal', () => ({
  Modal: ({
    ariaLabel,
    children,
    isOpen,
  }: {
    ariaLabel?: string;
    children: React.ReactNode;
    isOpen: boolean;
  }) =>
    isOpen ? (
      <div aria-label={ariaLabel} role="dialog">
        {children}
      </div>
    ) : null,
}));

const renderImageModal = ({
  onApply = vi.fn(),
  onUploadImage = vi.fn(),
}: {
  onApply?: ReturnType<typeof vi.fn>;
  onUploadImage?: ReturnType<typeof vi.fn>;
} = {}) => {
  render(
    <ImageEmbedPopover contentType="article" onApply={onApply} onUploadImage={onUploadImage} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Image' }));

  return {
    dialog: screen.getByRole('dialog', { name: 'Insert images' }),
    onApply,
    onUploadImage,
  };
};

const addUrls = async (dialog: HTMLElement, urls: string[]) => {
  const urlToggle = within(dialog).queryByRole('button', { name: 'Add URLs' });
  if (urlToggle) {
    fireEvent.click(urlToggle);
  }
  const urlInput = await within(dialog).findByLabelText('Add web URLs');
  fireEvent.change(urlInput, {
    target: { value: urls.join('\n') },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Add' }));
};

describe('ImageEmbedPopover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Under trigger hover and focus, ImageEmbedPopover must close the tooltip immediately when opening the modal', async () => {
    render(<ImageEmbedPopover contentType="article" onApply={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Image' });
    fireEvent.mouseEnter(trigger);
    expect(await screen.findByRole('tooltip')).toBeTruthy();

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).toBeNull();
    });
  });

  it('Under the initial state, ImageEmbedPopover must render only the dropzone and the default URL input', () => {
    const { dialog } = renderImageModal();

    expect(within(dialog).getByText('Drop images here.')).toBeTruthy();
    expect(within(dialog).getByLabelText('Dropzone image upload')).toBeTruthy();
    expect(within(dialog).getByLabelText('Add web URLs')).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: 'URL Add' })).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: 'Insert as individual images' }),
    ).toBeNull();
  });

  it('Under a file drop on the initial dropzone, ImageEmbedPopover must render the edit layout and top actions', async () => {
    const { dialog, onUploadImage } = renderImageModal({
      onUploadImage: vi.fn().mockResolvedValue('https://cdn.example.com/dropped.png'),
    });

    const dropzone = dialog.querySelector('[data-image-empty-dropzone]');
    expect(dropzone).toBeTruthy();

    fireEvent.drop(dropzone as HTMLElement, {
      dataTransfer: {
        files: [new File([''], 'dropped.png', { type: 'image/png' })],
      },
    });

    await waitFor(() => {
      expect(within(dialog).getAllByText('Images').length).toBeGreaterThan(0);
    });
    expect(onUploadImage).toHaveBeenCalled();

    expect(within(dialog).getByLabelText('Upload image files')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Add URLs' })).toBeTruthy();
    expect(within(dialog).getByLabelText('URL')).toBeTruthy();
    expect(within(dialog).getByLabelText('Upload selected image')).toBeTruthy();
  });

  it('Under multiline URL input, ImageEmbedPopover must create edit-state rows', async () => {
    const { dialog } = renderImageModal();

    await addUrls(dialog, ['https://example.com/one.png', 'https://example.com/two.png']);

    expect(within(dialog).getAllByText('Images').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByRole('button', { name: /https:\/\/example\.com/ })).toHaveLength(
      2,
    );
  });

  it('Under individual image insertion, ImageEmbedPopover must pass the edited image list payload', async () => {
    const { dialog, onApply } = renderImageModal();

    await addUrls(dialog, ['https://example.com/one.png', 'https://example.com/two.png']);
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://example.com/one.png' },
    });
    fireEvent.change(within(dialog).getByLabelText('Alt text'), {
      target: { value: 'First Description' },
    });

    fireEvent.click(within(dialog).getByRole('button', { name: /two\.png/ }));
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://example.com/two.png' },
    });
    fireEvent.change(within(dialog).getByLabelText('Alt text'), {
      target: { value: 'Second Description' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Insert as individual images' }));

    expect(onApply).toHaveBeenCalledWith({
      items: [
        { altText: 'First Description', url: 'https://example.com/one.png' },
        { altText: 'Second Description', url: 'https://example.com/two.png' },
      ],
      mode: 'individual',
    });
  });

  it('Under only one valid image, ImageEmbedPopover must disable the gallery insert button', async () => {
    const { dialog } = renderImageModal();

    await addUrls(dialog, ['https://example.com/one.png']);
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://example.com/one.png' },
    });

    expect(
      (within(dialog).getByRole('button', { name: 'Insert as gallery' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('Under mixed uploads and URL additions, ImageEmbedPopover must merge them into a single insert flow', async () => {
    const onUploadImage = vi.fn().mockResolvedValue('https://cdn.example.com/uploaded.png');
    const { dialog, onApply } = renderImageModal({ onUploadImage });

    await addUrls(dialog, ['https://example.com/first.png']);
    fireEvent.change(within(dialog).getByLabelText('URL'), {
      target: { value: 'https://example.com/first.png' },
    });

    const fileInput = within(dialog).getByLabelText('Upload image files');
    fireEvent.change(fileInput, {
      target: {
        files: [new File([''], 'from-upload.png', { type: 'image/png' })],
      },
    });

    await addUrls(dialog, ['https://example.com/second.png']);

    await waitFor(() => {
      expect(onUploadImage).toHaveBeenCalledWith({
        contentType: 'article',
        file: expect.any(File),
        imageKind: 'content',
      });
    });

    await screen.findByRole('button', { name: /from-upload\.png/ });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Insert as individual images' }));
    expect(onApply).toHaveBeenCalledWith({
      items: expect.arrayContaining([
        { altText: 'Image description', url: 'https://example.com/first.png' },
        { altText: 'from-upload.png', url: 'https://cdn.example.com/uploaded.png' },
        { altText: 'Image description', url: 'https://example.com/second.png' },
      ]),
      mode: 'individual',
    });
  });
});
