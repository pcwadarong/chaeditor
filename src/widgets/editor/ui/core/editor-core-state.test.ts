import { createEmptyTranslations } from '@/widgets/editor/ui/core/editor-core.utils';
import {
  buildEditorStateSnapshot,
  createSaveErrorToast,
  getEditorSaveStatusLabel,
  resolveSavedAt,
  shouldScheduleEditorAutosave,
} from '@/widgets/editor/ui/core/editor-core-state';

describe('editor-core state helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('Under missing locale fields, the snapshot helper must fill them with empty values', () => {
    const snapshot = buildEditorStateSnapshot({
      dirty: true,
      slug: 'editor-core',
      tags: ['nextjs'],
      translations: {
        ...createEmptyTranslations(),
        ko: {
          content: 'Content',
          description: 'Description',
          download_button_label: '',
          title: 'Title',
        },
      },
    });

    expect(snapshot.dirty).toBe(true);
    expect(snapshot.tags).toEqual(['nextjs']);
    expect(snapshot.translations.ko.title).toBe('Title');
    expect(snapshot.translations.en.title).toBe('');
    expect(snapshot.translations.fr.content).toBe('');
  });

  it('Under a save failure toast, the helper must assign the error tone and id', () => {
    const toast = createSaveErrorToast('Save failed');

    expect(toast.message).toBe('Save failed');
    expect(toast.tone).toBe('error');
    expect(toast.id).toMatch(/^save-error-/);
  });

  it('Under a missing savedAt value, the helper must fall back to the current time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-17T12:34:56.000Z'));

    expect(resolveSavedAt(undefined)).toBe('2026-03-17T12:34:56.000Z');
    expect(resolveSavedAt({ savedAt: '2026-03-10T00:00:00.000Z' })).toBe(
      '2026-03-10T00:00:00.000Z',
    );
  });

  it('Under save status text resolution, the helper must prioritize saving, dirty, then the last saved time', () => {
    expect(
      getEditorSaveStatusLabel({
        dirty: false,
        formatSavedAtLabel: () => '09:07',
        isSaving: true,
        lastSavedAt: '2026-03-12T09:07:00+09:00',
      }),
    ).toBe('Saving...');

    expect(
      getEditorSaveStatusLabel({
        dirty: true,
        formatSavedAtLabel: () => '09:07',
        isSaving: false,
        lastSavedAt: '2026-03-12T09:07:00+09:00',
      }),
    ).toBe('Unsaved changes');

    expect(
      getEditorSaveStatusLabel({
        dirty: false,
        formatSavedAtLabel: () => '09:07',
        isSaving: false,
        lastSavedAt: '2026-03-12T09:07:00+09:00',
      }),
    ).toBe('Saved 09:07');
  });

  it('Under autosave scheduling, the helper must schedule only when saving is allowed and a draft save handler exists', () => {
    expect(
      shouldScheduleEditorAutosave({
        canSave: true,
        dirty: true,
        enableAutosave: true,
        hasDraftSaveHandler: true,
      }),
    ).toBe(true);

    expect(
      shouldScheduleEditorAutosave({
        canSave: false,
        dirty: true,
        enableAutosave: true,
        hasDraftSaveHandler: true,
      }),
    ).toBe(false);

    expect(
      shouldScheduleEditorAutosave({
        canSave: true,
        dirty: false,
        enableAutosave: true,
        hasDraftSaveHandler: true,
      }),
    ).toBe(false);

    expect(
      shouldScheduleEditorAutosave({
        canSave: true,
        dirty: true,
        enableAutosave: true,
        hasDraftSaveHandler: false,
      }),
    ).toBe(false);
  });
});
