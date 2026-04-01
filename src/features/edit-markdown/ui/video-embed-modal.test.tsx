import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { VideoEmbedModal } from '@/features/edit-markdown/ui/video-embed-modal';

describe('VideoEmbedModal', () => {
  it('Under a valid video URL, VideoEmbedModal must call onApply with the extracted video id', async () => {
    const onApply = vi.fn();

    render(<VideoEmbedModal contentType="article" onApply={onApply} />);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Video URL' }), {
      target: { value: 'https://youtu.be/dQw4w9WgXcQ/extra' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({
        provider: 'youtube',
        videoId: 'dQw4w9WgXcQ',
      });
    });
  });

  it('Under an invalid video URL, VideoEmbedModal must not call onApply', async () => {
    const onApply = vi.fn();

    render(<VideoEmbedModal contentType="article" onApply={onApply} />);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Video URL' }), {
      target: { value: 'https://example.com/not-a-video' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(onApply).not.toHaveBeenCalled();
    });
  });

  it('Under a successful video upload, VideoEmbedModal must call onApply with an upload provider payload', async () => {
    const onApply = vi.fn();
    const onUploadVideo = vi.fn().mockResolvedValue('https://example.com/videos/demo.mp4');

    render(
      <VideoEmbedModal contentType="project" onApply={onApply} onUploadVideo={onUploadVideo} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByLabelText('Upload video'), {
      target: {
        files: [new File(['binary'], 'demo.mp4', { type: 'video/mp4' })],
      },
    });

    await waitFor(() => {
      expect(onUploadVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: 'project',
          file: expect.any(File),
          onProgress: expect.any(Function),
          signal: expect.any(AbortSignal),
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(onApply).toHaveBeenCalledWith({
        provider: 'upload',
        src: 'https://example.com/videos/demo.mp4',
      });
    });
  });

  it('Under an in-progress upload, VideoEmbedModal must show progress and disable insertion', async () => {
    const onApply = vi.fn();
    const onUploadVideo = vi.fn().mockImplementation(async ({ onProgress }) => {
      onProgress?.(42);
      return await new Promise(() => {});
    });

    render(
      <VideoEmbedModal contentType="article" onApply={onApply} onUploadVideo={onUploadVideo} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByLabelText('Upload video'), {
      target: {
        files: [new File(['binary'], 'demo.mp4', { type: 'video/mp4' })],
      },
    });

    expect(await screen.findByText('Uploading video... 42%')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Insert' })).toHaveProperty('disabled', true);
  });

  it('Under upload cancelation, VideoEmbedModal must abort the upload and show the canceled state', async () => {
    const onApply = vi.fn();
    const onUploadVideo = vi.fn().mockImplementation(
      ({ onProgress, signal }) =>
        new Promise((_, reject) => {
          onProgress?.(30);
          signal?.addEventListener(
            'abort',
            () => {
              const error = new Error('Video upload aborted');

              error.name = 'AbortError';
              reject(error);
            },
            { once: true },
          );
        }),
    );

    render(
      <VideoEmbedModal contentType="article" onApply={onApply} onUploadVideo={onUploadVideo} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByLabelText('Upload video'), {
      target: {
        files: [new File(['binary'], 'demo.mp4', { type: 'video/mp4' })],
      },
    });

    expect(await screen.findByText('Uploading video... 30%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel upload' }));

    await waitFor(() => {
      expect(screen.getByText('The video upload was canceled.')).toBeTruthy();
    });
    expect(onApply).not.toHaveBeenCalled();
  });

  it('Under an unsupported video file, VideoEmbedModal must show an error without starting an upload', async () => {
    const onApply = vi.fn();
    const invalidFile = new File(['binary'], 'demo.exe', { type: 'application/octet-stream' });

    Object.defineProperty(invalidFile, 'size', {
      configurable: true,
      value: 600 * 1024 * 1024,
    });

    const onUploadVideo = vi.fn();

    render(
      <VideoEmbedModal contentType="article" onApply={onApply} onUploadVideo={onUploadVideo} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByLabelText('Upload video'), {
      target: {
        files: [invalidFile],
      },
    });

    expect(await screen.findByText(/Unsupported video file/)).toBeTruthy();
    expect(onUploadVideo).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });
});
