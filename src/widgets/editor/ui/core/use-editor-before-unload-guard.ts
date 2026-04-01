'use client';

import { useEffect } from 'react';

/**
 * Registers a browser unload warning only while the editor is dirty.
 *
 * @param dirty Whether unsaved changes exist.
 */
export const useEditorBeforeUnloadGuard = (dirty: boolean) => {
  useEffect(() => {
    if (!dirty || typeof window === 'undefined') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirty]);
};
