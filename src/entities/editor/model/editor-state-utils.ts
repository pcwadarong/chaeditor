import {
  EDITOR_LOCALES,
  type EditorState,
  type EditorValidationResult,
  type Locale,
  type TranslationField,
} from '@/entities/editor/model/editor-types';

/**
 * Creates an empty localized record with a stable locale order.
 */
export const createEmptyTranslations = (): Record<Locale, TranslationField> => ({
  en: {
    content: '',
    description: '',
    download_button_label: '',
    title: '',
  },
  fr: {
    content: '',
    description: '',
    download_button_label: '',
    title: '',
  },
  ja: {
    content: '',
    description: '',
    download_button_label: '',
    title: '',
  },
  ko: {
    content: '',
    description: '',
    download_button_label: '',
    title: '',
  },
});

/**
 * Normalizes tags for equality checks by removing duplicates and ordering noise.
 */
export const normalizeTagSlugs = (tags: string[]) =>
  [...new Set(tags)].sort((left, right) => left.localeCompare(right));

/**
 * Normalizes editor state for save and dirty-state comparisons.
 */
export const normalizeEditorState = (state: EditorState): EditorState => ({
  dirty: state.dirty,
  slug: state.slug,
  tags: normalizeTagSlugs(state.tags),
  translations: EDITOR_LOCALES.reduce<Record<Locale, TranslationField>>((accumulator, locale) => {
    accumulator[locale] = {
      content: state.translations[locale]?.content ?? '',
      description: state.translations[locale]?.description ?? '',
      download_button_label: state.translations[locale]?.download_button_label ?? '',
      title: state.translations[locale]?.title ?? '',
    };

    return accumulator;
  }, createEmptyTranslations()),
});

/**
 * Checks whether the current editor state matches the baseline snapshot.
 */
export const isEditorStateEqual = (left: EditorState, right: EditorState) => {
  if (left.slug !== right.slug) return false;

  const leftTags = normalizeTagSlugs(left.tags);
  const rightTags = normalizeTagSlugs(right.tags);

  if (leftTags.length !== rightTags.length) return false;

  for (let index = 0; index < leftTags.length; index += 1) {
    if (leftTags[index] !== rightTags[index]) return false;
  }

  return EDITOR_LOCALES.every(locale => {
    const leftTranslation = left.translations[locale];
    const rightTranslation = right.translations[locale];

    return (
      leftTranslation.title === rightTranslation.title &&
      leftTranslation.description === rightTranslation.description &&
      leftTranslation.content === rightTranslation.content &&
      (leftTranslation.download_button_label ?? '') ===
        (rightTranslation.download_button_label ?? '')
    );
  });
};

/**
 * Validates localized title and content state and derives save availability.
 */
export const validateEditorState = (
  translations: Record<Locale, TranslationField>,
): EditorValidationResult => {
  let hasAnyCompleteTranslation = false;

  const localeValidation = EDITOR_LOCALES.reduce<
    Record<Locale, { hasCompleteTranslation: boolean; hasContentWithoutTitle: boolean }>
  >(
    (accumulator, locale) => {
      const translation = translations[locale];
      const hasTitle = translation.title.trim().length > 0;
      const hasContent = translation.content.trim().length > 0;
      const hasCompleteTranslation = hasTitle && hasContent;

      if (hasCompleteTranslation) {
        hasAnyCompleteTranslation = true;
      }

      accumulator[locale] = {
        hasCompleteTranslation,
        hasContentWithoutTitle: hasContent && !hasTitle,
      };

      return accumulator;
    },
    {
      en: { hasCompleteTranslation: false, hasContentWithoutTitle: false },
      fr: { hasCompleteTranslation: false, hasContentWithoutTitle: false },
      ja: { hasCompleteTranslation: false, hasContentWithoutTitle: false },
      ko: { hasCompleteTranslation: false, hasContentWithoutTitle: false },
    },
  );

  return {
    canSave:
      hasAnyCompleteTranslation &&
      EDITOR_LOCALES.every(locale => !localeValidation[locale].hasContentWithoutTitle),
    hasAnyCompleteTranslation,
    localeValidation,
  };
};

/**
 * Formats a saved-at timestamp as an `HH:MM` string for the footer.
 */
export const formatSavedAtLabel = (savedAt: string | null) => {
  if (!savedAt) return null;

  const date = new Date(savedAt);

  if (Number.isNaN(date.getTime())) return null;

  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${hours}:${minutes}`;
};
