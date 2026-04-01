import type { ToastItem } from '@/shared/ui/toast/toast';
import {
  type DraftSaveResult,
  EDITOR_LOCALES,
  type EditorState,
  type Locale,
} from '@/widgets/editor/ui/core/editor-core.types';
import { createEmptyTranslations } from '@/widgets/editor/ui/core/editor-core.utils';

/**
 * Builds an editor snapshot for callback payloads.
 */
export const buildEditorStateSnapshot = ({
  dirty,
  slug,
  tags,
  translations,
}: Pick<EditorState, 'dirty' | 'slug' | 'tags' | 'translations'>): EditorState => ({
  dirty,
  slug,
  tags,
  translations: EDITOR_LOCALES.reduce<Record<Locale, EditorState['translations'][Locale]>>(
    (accumulator, locale) => {
      accumulator[locale] = {
        content: translations[locale]?.content ?? '',
        description: translations[locale]?.description ?? '',
        download_button_label: translations[locale]?.download_button_label ?? '',
        title: translations[locale]?.title ?? '',
      };

      return accumulator;
    },
    createEmptyTranslations(),
  ),
});

/**
 * Creates a toast descriptor for save and validation failures.
 */
export const createSaveErrorToast = (message: string): ToastItem => ({
  id: `save-error-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  message,
  tone: 'error',
});

/**
 * Returns the current timestamp string used for saved-at state.
 */
const createTimestamp = () => new Date().toISOString();

/**
 * Extracts the last saved timestamp from a draft save result.
 */
export const resolveSavedAt = (result: DraftSaveResult | void) =>
  result?.savedAt ?? createTimestamp();

type EditorSaveStatusLabelParams = {
  dirty: boolean;
  formatSavedAtLabel: (savedAt: string | null) => string | null;
  isSaving: boolean;
  lastSavedAt: string | null;
};

type EditorAutosaveEligibilityParams = {
  canSave: boolean;
  dirty: boolean;
  enableAutosave: boolean;
  hasDraftSaveHandler: boolean;
};

/**
 * Resolves the status text shown in the save state badge.
 */
export const getEditorSaveStatusLabel = ({
  dirty,
  formatSavedAtLabel,
  isSaving,
  lastSavedAt,
}: EditorSaveStatusLabelParams) => {
  if (isSaving) return 'Saving...';
  if (dirty) return 'Unsaved changes';

  const formattedSavedAt = formatSavedAtLabel(lastSavedAt);

  return formattedSavedAt ? `Saved ${formattedSavedAt}` : '';
};

/**
 * Checks whether autosave is allowed for the current editor state.
 */
export const shouldScheduleEditorAutosave = ({
  canSave,
  dirty,
  enableAutosave,
  hasDraftSaveHandler,
}: EditorAutosaveEligibilityParams) => enableAutosave && hasDraftSaveHandler && dirty && canSave;
