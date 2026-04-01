import { useCallback, useEffect, useRef, useState } from 'react';

import { EDITOR_ERROR_MESSAGE, parseEditorError } from '@/entities/editor/model/editor-error';
import type { EditorState } from '@/widgets/editor/ui/core/editor-core.types';
import {
  buildEditorStateSnapshot,
  createSaveErrorToast,
  resolveSavedAt,
  shouldScheduleEditorAutosave,
} from '@/widgets/editor/ui/core/editor-core-state';

const AUTOSAVE_DELAY_MS = 180_000;

type SaveSource = 'autosave' | 'manual';

type UseEditorSubmitActionsParams = {
  currentState: Pick<EditorState, 'dirty' | 'slug' | 'tags' | 'translations'>;
  enableAutosave: boolean;
  initialSavedAt?: string | null;
  onDirectPublish?: (state: EditorState) => Promise<void> | void;
  onDirectPublishError?: (error: unknown) => string;
  onDraftSave?: (state: EditorState) => Promise<{ savedAt?: string | null } | void>;
  onOpenPublishPanel?: (state: EditorState) => void;
  onSavedStateChange: (state: EditorState) => void;
  pushToast: (item: ReturnType<typeof createSaveErrorToast>) => void;
  validationCanSave: boolean;
};

type UseEditorSubmitActionsResult = {
  handleManualSave: () => void;
  handlePublishAction: () => Promise<void>;
  isPublishingDirectly: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
};

/**
 * Orchestrates draft save, autosave, and publish actions for the editor shell.
 */
export const useEditorSubmitActions = ({
  currentState,
  enableAutosave,
  initialSavedAt = null,
  onDirectPublish,
  onDirectPublishError,
  onDraftSave,
  onOpenPublishPanel,
  onSavedStateChange,
  pushToast,
  validationCanSave,
}: UseEditorSubmitActionsParams): UseEditorSubmitActionsResult => {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingDirectly, setIsPublishingDirectly] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialSavedAt);
  const saveRequestIdRef = useRef(0);

  /**
   * Validates whether the current editor state can be saved.
   */
  const ensureSavable = useCallback(
    (source: SaveSource) => {
      if (validationCanSave) return true;

      if (source === 'manual') {
        pushToast(
          createSaveErrorToast(
            `To save, ${EDITOR_ERROR_MESSAGE.missingCompleteTranslation.toLowerCase()}`,
          ),
        );
      }

      return false;
    },
    [pushToast, validationCanSave],
  );

  /**
   * Saves the current draft for both manual save and autosave flows.
   */
  const runDraftSave = useCallback(
    async (source: SaveSource) => {
      if (!onDraftSave || !ensureSavable(source)) return;

      const requestId = ++saveRequestIdRef.current;
      const requestState = buildEditorStateSnapshot(currentState);

      setIsSaving(true);

      try {
        const result = await onDraftSave(requestState);

        if (saveRequestIdRef.current !== requestId) return;

        onSavedStateChange({ ...requestState, dirty: false });
        setLastSavedAt(resolveSavedAt(result));
      } catch (error) {
        if (saveRequestIdRef.current !== requestId) return;

        const parsedError = parseEditorError(error, 'draftSaveFailed');
        pushToast(createSaveErrorToast(parsedError.message));
      } finally {
        if (saveRequestIdRef.current === requestId) {
          setIsSaving(false);
        }
      }
    },
    [currentState, ensureSavable, onDraftSave, onSavedStateChange, pushToast],
  );

  /**
   * Schedules autosave after the configured idle delay.
   */
  useEffect(() => {
    if (
      !shouldScheduleEditorAutosave({
        canSave: validationCanSave,
        dirty: currentState.dirty,
        enableAutosave,
        hasDraftSaveHandler: Boolean(onDraftSave),
      })
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runDraftSave('autosave');
    }, AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentState.dirty, enableAutosave, onDraftSave, runDraftSave, validationCanSave]);

  const handleManualSave = useCallback(() => {
    void runDraftSave('manual');
  }, [runDraftSave]);

  /**
   * Chooses either direct publish or publish-panel open for the current snapshot.
   */
  const handlePublishAction = useCallback(async () => {
    const snapshot = buildEditorStateSnapshot(currentState);

    if (onDirectPublish) {
      if (!ensureSavable('manual')) return;

      setIsPublishingDirectly(true);

      try {
        await onDirectPublish(snapshot);
      } catch (error) {
        pushToast(
          createSaveErrorToast(
            onDirectPublishError
              ? onDirectPublishError(error)
              : parseEditorError(error, 'publishFailed').message,
          ),
        );
      } finally {
        setIsPublishingDirectly(false);
      }

      return;
    }

    onOpenPublishPanel?.(snapshot);
  }, [
    currentState,
    ensureSavable,
    onDirectPublish,
    onDirectPublishError,
    onOpenPublishPanel,
    pushToast,
  ]);

  return {
    handleManualSave,
    handlePublishAction,
    isPublishingDirectly,
    isSaving,
    lastSavedAt,
  };
};
