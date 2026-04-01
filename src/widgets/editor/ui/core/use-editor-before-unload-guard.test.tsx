import { cleanup, renderHook } from '@testing-library/react';

import { useEditorBeforeUnloadGuard } from '@/widgets/editor/ui/core/use-editor-before-unload-guard';

describe('useEditorBeforeUnloadGuard', () => {
  afterEach(() => {
    cleanup();
  });

  it('Under a dirty state, useEditorBeforeUnloadGuard must block beforeunload', () => {
    renderHook(() => useEditorBeforeUnloadGuard(true));

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('Under a clean state, useEditorBeforeUnloadGuard must not block beforeunload', () => {
    renderHook(() => useEditorBeforeUnloadGuard(false));

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});
