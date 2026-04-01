// @vitest-environment node

import { EDITOR_ERROR_MESSAGE } from '@/entities/editor/model/editor-error';
import {
  normalizeEmbedInput,
  normalizeEmbedInputList,
  uploadImageEmbedSource,
} from '@/features/edit-markdown/model/embed-popover-state';

describe('embed-popover-state', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Under whitespace-only input, normalizeEmbedInput must trim the value and return null for empty results', () => {
    expect(normalizeEmbedInput('  https://openai.com  ')).toBe('https://openai.com');
    expect(normalizeEmbedInput('   ')).toBeNull();
  });

  it('Under newline-separated URL input, normalizeEmbedInputList must remove empty lines and duplicates', () => {
    expect(
      normalizeEmbedInputList(
        [
          ' https://example.com/one.png ',
          '',
          'https://example.com/two.png',
          'https://example.com/one.png',
        ].join('\n'),
      ),
    ).toEqual(['https://example.com/one.png', 'https://example.com/two.png']);
  });

  it('Under a successful image upload, uploadImageEmbedSource must return the uploaded URL', async () => {
    const uploadEditorImage = vi.fn().mockResolvedValue('https://example.com/uploaded.webp');
    const file = new File(['binary'], 'inline.png', { type: 'image/png' });

    await expect(
      uploadImageEmbedSource({
        contentType: 'article',
        file,
        uploadEditorImage,
      }),
    ).resolves.toEqual({
      errorMessage: null,
      url: 'https://example.com/uploaded.webp',
    });

    expect(uploadEditorImage).toHaveBeenCalledWith({
      contentType: 'article',
      file,
      imageKind: 'content',
    });
  });

  it('Under a failed image upload, uploadImageEmbedSource must return a user-facing error message', async () => {
    const uploadEditorImage = vi.fn().mockRejectedValue(new Error('upload failed'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const file = new File(['binary'], 'inline.png', { type: 'image/png' });

    await expect(
      uploadImageEmbedSource({
        contentType: 'article',
        file,
        uploadEditorImage,
      }),
    ).resolves.toEqual({
      errorMessage: EDITOR_ERROR_MESSAGE.imageUploadFailedWithRetry,
      url: null,
    });

    expect(uploadEditorImage).toHaveBeenCalledWith({
      contentType: 'article',
      file,
      imageKind: 'content',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'uploadImageEmbedSource failed',
      expect.objectContaining({
        contentType: 'article',
        error: expect.any(Error),
        imageKind: 'content',
      }),
    );
  });
});
