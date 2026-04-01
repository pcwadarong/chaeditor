import { act, renderHook } from '@testing-library/react';

import { viewportMediaQuery } from '@/shared/config/responsive';
import { useIsMobileEditorLayout } from '@/widgets/editor/ui/core/use-mobile-editor-layout';

type MatchMediaListener = (event: MediaQueryListEvent) => void;

describe('useIsMobileEditorLayout', () => {
  it('Under matchMedia changes, useMobileEditorLayout must update the mobile state', () => {
    let listener: MatchMediaListener | null = null;
    let matches = false;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        addEventListener: (_event: string, nextListener: MatchMediaListener) => {
          listener = nextListener;
        },
        matches,
        media: viewportMediaQuery.tabletDown,
        removeEventListener: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useIsMobileEditorLayout());

    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });
});
