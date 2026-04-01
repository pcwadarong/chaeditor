import {
  createEmptyTranslations,
  formatSavedAtLabel,
  isEditorStateEqual,
  normalizeTagSlugs,
  validateEditorState,
} from '@/widgets/editor/ui/core/editor-core.utils';

describe('editor-core utils', () => {
  it('Under content without a title, the locale must be treated as invalid', () => {
    const translations = createEmptyTranslations();
    translations.ko.content = 'Content';

    const result = validateEditorState(translations);

    expect(result.localeValidation.ko.hasContentWithoutTitle).toBe(true);
    expect(result.canSave).toBe(false);
  });

  it('Under both title and content present, the editor state helper must allow saving', () => {
    const translations = createEmptyTranslations();
    translations.ko.title = 'Title';
    translations.ko.content = 'Content';

    const result = validateEditorState(translations);

    expect(result.localeValidation.ko.hasCompleteTranslation).toBe(true);
    expect(result.canSave).toBe(true);
  });

  it('Under all locales empty, the editor state helper must not allow saving', () => {
    const result = validateEditorState(createEmptyTranslations());

    expect(result.hasAnyCompleteTranslation).toBe(false);
    expect(result.canSave).toBe(false);
  });

  it('Under only tag order changes, the editor state helper must treat the state as unchanged', () => {
    const left = {
      dirty: false,
      slug: 'editor-core',
      tags: ['react', 'nextjs'],
      translations: createEmptyTranslations(),
    };
    const right = {
      dirty: false,
      slug: 'editor-core',
      tags: ['nextjs', 'react'],
      translations: createEmptyTranslations(),
    };

    expect(isEditorStateEqual(left, right)).toBe(true);
    expect(normalizeTagSlugs(['nextjs', 'react', 'react'])).toEqual(['nextjs', 'react']);
  });

  it('Under changed slug or translations, the editor state helper must treat the state as changed', () => {
    const baseTranslations = createEmptyTranslations();
    baseTranslations.ko.title = 'Original';
    const nextTranslations = createEmptyTranslations();
    nextTranslations.ko.title = 'Updated';

    expect(
      isEditorStateEqual(
        {
          dirty: false,
          slug: 'same-slug',
          tags: [],
          translations: baseTranslations,
        },
        {
          dirty: false,
          slug: 'other-slug',
          tags: [],
          translations: baseTranslations,
        },
      ),
    ).toBe(false);

    expect(
      isEditorStateEqual(
        {
          dirty: false,
          slug: 'same-slug',
          tags: [],
          translations: baseTranslations,
        },
        {
          dirty: false,
          slug: 'same-slug',
          tags: [],
          translations: nextTranslations,
        },
      ),
    ).toBe(false);
  });

  it('Under a save timestamp, the formatter must zero-pad it as HH:MM', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-12T00:00:00.000Z'));

    expect(formatSavedAtLabel('2026-03-12T09:07:00+09:00')).toBe('09:07');
    vi.useRealTimers();
  });
});
