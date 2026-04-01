import { type MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Locale, TranslationField } from '@/widgets/editor/ui/core/editor-core.types';
import { rememberTextareaScroll } from '@/widgets/editor/ui/core/editor-core-textarea';

type UseEditorLocaleStateParams = {
  initialLocale?: Locale;
  initialTranslations: Record<Locale, TranslationField>;
};

type UseEditorLocaleStateResult = {
  activeLocale: Locale;
  handleLocaleChange: (nextLocale: Locale) => void;
  handleTextareaScroll: (locale: Locale, scrollTop: number) => void;
  textareaRefs: Record<Locale, MutableRefObject<HTMLTextAreaElement | null>>;
  translations: Record<Locale, TranslationField>;
  updateTranslationField: (locale: Locale, field: keyof TranslationField, value: string) => void;
};

/**
 * Manages active locale state, localized fields, and textarea scroll restoration.
 *
 * @param initialLocale Initially active locale.
 * @param initialTranslations Initial localized field values.
 * @returns Locale state, translation state, refs, and update handlers.
 */
export const useEditorLocaleState = ({
  initialLocale = 'ko',
  initialTranslations,
}: UseEditorLocaleStateParams): UseEditorLocaleStateResult => {
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale);
  const [translations, setTranslations] =
    useState<Record<Locale, TranslationField>>(initialTranslations);
  const scrollTopByLocaleRef = useRef<Record<Locale, number>>({
    en: 0,
    fr: 0,
    ja: 0,
    ko: 0,
  });
  const enTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const frTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const jaTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const koTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRefs = useMemo(
    () => ({
      en: enTextareaRef,
      fr: frTextareaRef,
      ja: jaTextareaRef,
      ko: koTextareaRef,
    }),
    [],
  );

  useEffect(() => {
    const textarea = textareaRefs[activeLocale].current;

    if (!textarea) return;

    textarea.scrollTop = scrollTopByLocaleRef.current[activeLocale];
  }, [activeLocale, textareaRefs]);

  /**
   * Updates a localized field while reusing the previous object when possible.
   */
  const updateTranslationField = useCallback(
    (locale: Locale, field: keyof TranslationField, value: string) => {
      setTranslations(previous => {
        if (previous[locale][field] === value) return previous;

        return {
          ...previous,
          [locale]: {
            ...previous[locale],
            [field]: value,
          },
        };
      });
    },
    [],
  );

  /**
   * Stores the current textarea scroll position before switching locales.
   */
  const handleLocaleChange = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === activeLocale) return;

      rememberTextareaScroll(activeLocale, scrollTopByLocaleRef, textareaRefs);
      setActiveLocale(nextLocale);
    },
    [activeLocale, textareaRefs],
  );

  /**
   * Stores the scroll position of the active locale textarea.
   */
  const handleTextareaScroll = useCallback((locale: Locale, scrollTop: number) => {
    scrollTopByLocaleRef.current[locale] = scrollTop;
  }, []);

  return {
    activeLocale,
    handleLocaleChange,
    handleTextareaScroll,
    textareaRefs,
    translations,
    updateTranslationField,
  };
};
