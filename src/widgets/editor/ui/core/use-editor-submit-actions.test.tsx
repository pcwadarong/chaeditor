import { act, renderHook } from '@testing-library/react';

import { createEmptyTranslations } from '@/widgets/editor/ui/core/editor-core.utils';
import { useEditorSubmitActions } from '@/widgets/editor/ui/core/use-editor-submit-actions';

const AUTO_SAVE_DELAY_MS = 180_000;

const createCurrentState = (
  overrides?: Partial<{
    dirty: boolean;
    slug: string;
    tags: string[];
    title: string;
  }>,
) => ({
  dirty: overrides?.dirty ?? true,
  slug: overrides?.slug ?? '',
  tags: overrides?.tags ?? [],
  translations: {
    ...createEmptyTranslations(),
    ko: {
      content: 'Content',
      description: 'Description',
      download_button_label: '',
      title: overrides?.title ?? 'Title',
    },
  },
});

describe('useEditorSubmitActions', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('Under a successful manual save, useEditorSubmitActions must update the saved state', async () => {
    const onDraftSave = vi.fn().mockResolvedValue({
      savedAt: '2026-03-25T09:00:00.000Z',
    });
    const onSavedStateChange = vi.fn();
    const pushToast = vi.fn();

    const { result } = renderHook(() =>
      useEditorSubmitActions({
        currentState: createCurrentState(),
        enableAutosave: true,
        onDraftSave,
        onSavedStateChange,
        pushToast,
        validationCanSave: true,
      }),
    );

    await act(async () => {
      result.current.handleManualSave();
    });

    expect(onDraftSave).toHaveBeenCalledTimes(1);
    expect(onSavedStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dirty: false,
        translations: expect.objectContaining({
          ko: expect.objectContaining({
            title: 'Title',
          }),
        }),
      }),
    );
    expect(result.current.lastSavedAt).toBe('2026-03-25T09:00:00.000Z');
    expect(pushToast).not.toHaveBeenCalled();
  });

  it('Under satisfied autosave conditions, useEditorSubmitActions must run draft save after the delay', async () => {
    vi.useFakeTimers();
    const onDraftSave = vi.fn().mockResolvedValue(undefined);
    const onSavedStateChange = vi.fn();

    renderHook(() =>
      useEditorSubmitActions({
        currentState: createCurrentState(),
        enableAutosave: true,
        onDraftSave,
        onSavedStateChange,
        pushToast: vi.fn(),
        validationCanSave: true,
      }),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTO_SAVE_DELAY_MS - 1);
    });
    expect(onDraftSave).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(onDraftSave).toHaveBeenCalledTimes(1);
  });

  it('Under no direct publish handler, useEditorSubmitActions must call the publish panel open callback', async () => {
    const onOpenPublishPanel = vi.fn();

    const { result } = renderHook(() =>
      useEditorSubmitActions({
        currentState: createCurrentState(),
        enableAutosave: true,
        onOpenPublishPanel,
        onSavedStateChange: vi.fn(),
        pushToast: vi.fn(),
        validationCanSave: true,
      }),
    );

    await act(async () => {
      await result.current.handlePublishAction();
    });

    expect(onOpenPublishPanel).toHaveBeenCalledWith(
      expect.objectContaining({
        dirty: true,
      }),
    );
  });

  it('Under publish panel opening, useEditorSubmitActions must pass the dirty state and current editor snapshot', async () => {
    const onOpenPublishPanel = vi.fn();

    const { result, rerender } = renderHook(
      ({ currentState }) =>
        useEditorSubmitActions({
          currentState,
          enableAutosave: true,
          onOpenPublishPanel,
          onSavedStateChange: vi.fn(),
          pushToast: vi.fn(),
          validationCanSave: true,
        }),
      {
        initialProps: {
          currentState: createCurrentState({
            dirty: false,
            tags: [],
            title: '',
          }),
        },
      },
    );

    await act(async () => {
      await result.current.handlePublishAction();
    });

    expect(onOpenPublishPanel).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        dirty: false,
        slug: '',
        tags: [],
        translations: expect.objectContaining({
          ko: expect.objectContaining({
            title: '',
          }),
        }),
      }),
    );

    rerender({
      currentState: createCurrentState({
        dirty: true,
        title: 'publish-title',
      }),
    });

    await act(async () => {
      await result.current.handlePublishAction();
    });

    expect(onOpenPublishPanel).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        dirty: true,
        slug: '',
        tags: [],
        translations: expect.objectContaining({
          ko: expect.objectContaining({
            title: 'publish-title',
          }),
        }),
      }),
    );
  });

  it('Under a direct publish failure, useEditorSubmitActions must leave a toast', async () => {
    const pushToast = vi.fn();
    const onDirectPublish = vi.fn().mockRejectedValue(new Error('publish failed'));

    const { result } = renderHook(() =>
      useEditorSubmitActions({
        currentState: createCurrentState(),
        enableAutosave: true,
        onDirectPublish,
        onSavedStateChange: vi.fn(),
        pushToast,
        validationCanSave: true,
      }),
    );

    await act(async () => {
      await result.current.handlePublishAction();
    });

    expect(pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
      }),
    );
    expect(result.current.isPublishingDirectly).toBe(false);
  });

  it('Under a state that cannot be manually saved, useEditorSubmitActions must leave a toast instead of saving', async () => {
    const pushToast = vi.fn();
    const onDraftSave = vi.fn();

    const { result } = renderHook(() =>
      useEditorSubmitActions({
        currentState: {
          ...createCurrentState(),
          dirty: true,
        },
        enableAutosave: true,
        onDraftSave,
        onSavedStateChange: vi.fn(),
        pushToast,
        validationCanSave: false,
      }),
    );

    await act(async () => {
      result.current.handleManualSave();
    });

    expect(onDraftSave).not.toHaveBeenCalled();
    expect(pushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: 'error',
      }),
    );
  });
});
