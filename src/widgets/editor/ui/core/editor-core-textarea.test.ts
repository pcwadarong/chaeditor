import type { Locale } from '@/widgets/editor/ui/core/editor-core.types';
import {
  rememberTextareaScroll,
  resizeTextareaToContent,
} from '@/widgets/editor/ui/core/editor-core-textarea';

describe('editor-core textarea helpers', () => {
  it('Under auto resize, the textarea helper must recalculate height from scrollHeight', () => {
    const textarea = document.createElement('textarea');

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 128,
    });

    resizeTextareaToContent(textarea);

    expect(textarea.style.height).toBe('128px');
  });

  it('Under locale scroll updates, the textarea helper must save scrollTop by locale in the ref', () => {
    const koTextarea = document.createElement('textarea');
    koTextarea.scrollTop = 96;

    const scrollTopByLocaleRef = {
      current: { en: 0, fr: 0, ja: 0, ko: 0 },
    } as { current: Record<Locale, number> };
    const textareaRefs = {
      en: { current: null },
      fr: { current: null },
      ja: { current: null },
      ko: { current: koTextarea },
    } satisfies Record<Locale, { current: HTMLTextAreaElement | null }>;

    rememberTextareaScroll('ko', scrollTopByLocaleRef, textareaRefs);

    expect(scrollTopByLocaleRef.current.ko).toBe(96);
  });
});
