import { act, renderHook } from '@testing-library/react';

import { createEmptyTranslations } from '@/widgets/editor/ui/core/editor-core.utils';
import { useEditorLocaleState } from '@/widgets/editor/ui/core/use-editor-locale-state';

describe('useEditorLocaleState', () => {
  it('Under an identical update, useEditorLocaleState must reuse the translations object', () => {
    const initialTranslations = createEmptyTranslations();
    const { result } = renderHook(() =>
      useEditorLocaleState({
        initialTranslations,
      }),
    );

    const previousTranslations = result.current.translations;

    act(() => {
      result.current.updateTranslationField('ko', 'title', '');
    });

    expect(result.current.translations).toBe(previousTranslations);
  });

  it('Under per-locale updates, useEditorLocaleState must keep field values isolated', () => {
    const { result } = renderHook(() =>
      useEditorLocaleState({
        initialTranslations: createEmptyTranslations(),
      }),
    );

    act(() => {
      result.current.updateTranslationField('ko', 'title', 'Korean Title');
      result.current.updateTranslationField('en', 'title', 'English title');
    });

    expect(result.current.translations.ko.title).toBe('Korean Title');
    expect(result.current.translations.en.title).toBe('English title');
  });

  it('Under locale switching, useEditorLocaleState must save the previous scrollTop and restore it for the next locale', () => {
    const { result } = renderHook(() =>
      useEditorLocaleState({
        initialTranslations: createEmptyTranslations(),
      }),
    );

    const koTextarea = document.createElement('textarea');
    const enTextarea = document.createElement('textarea');

    result.current.textareaRefs.ko.current = koTextarea;
    result.current.textareaRefs.en.current = enTextarea;
    koTextarea.scrollTop = 120;

    act(() => {
      result.current.handleLocaleChange('en');
    });

    expect(result.current.activeLocale).toBe('en');

    act(() => {
      result.current.handleTextareaScroll('en', 48);
      result.current.handleLocaleChange('ko');
    });

    expect(koTextarea.scrollTop).toBe(120);
  });
});
