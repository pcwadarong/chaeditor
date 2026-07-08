import { uploadEditorVideo } from '@/integrations/default-host/api/upload-editor-video';

/**
 * Minimal XMLHttpRequest stand-in. The Node test environment has no XHR, and
 * these tests only need to observe how uploadEditorVideo drives it.
 */
class MockXHR {
  upload: Record<string, unknown> = {};
  status = 0;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  open = vi.fn();
  abort = vi.fn();
  send = vi.fn();
}

describe('uploadEditorVideo', () => {
  it('rejects immediately when the signal is already aborted, instead of hanging', async () => {
    const sent = vi.fn();

    class PreAbortXHR extends MockXHR {
      send = sent;
    }
    vi.stubGlobal('XMLHttpRequest', PreAbortXHR);

    const controller = new AbortController();
    controller.abort();
    const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' });

    await expect(
      uploadEditorVideo({ contentType: 'article', file, signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });

    // The request must not be sent when the signal is already aborted.
    expect(sent).not.toHaveBeenCalled();
  });

  it('resolves with the uploaded url on a successful response', async () => {
    class SuccessXHR extends MockXHR {
      send = vi.fn(() => {
        this.status = 200;
        this.responseText = JSON.stringify({ url: 'https://cdn.example.com/clip.mp4' });
        this.onload?.();
      });
    }
    vi.stubGlobal('XMLHttpRequest', SuccessXHR);

    const file = new File(['data'], 'clip.mp4', { type: 'video/mp4' });

    await expect(uploadEditorVideo({ contentType: 'article', file })).resolves.toBe(
      'https://cdn.example.com/clip.mp4',
    );
  });
});
