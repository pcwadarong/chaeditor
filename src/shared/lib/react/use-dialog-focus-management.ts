import { type RefObject, useEffect, useRef } from 'react';

import { getFocusableElements } from '@/shared/lib/a11y/get-focusable-elements';

type UseDialogFocusManagementParams = {
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isEnabled: boolean;
  onEscape: () => void;
  restoreFocusRef?: RefObject<boolean>;
};

/**
 * Manages focus entry, focus trapping, and focus restoration for dialogs.
 */
export const useDialogFocusManagement = ({
  containerRef,
  initialFocusRef,
  isEnabled,
  onEscape,
  restoreFocusRef,
}: UseDialogFocusManagementParams) => {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!isEnabled) return;

    // Store the current active element so focus can be restored on close.
    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus to the initial element when the dialog opens.
    const requestFocus = () => {
      const container = containerRef.current;
      if (!container) return;

      // Fall back to the first focusable element inside the dialog.
      const fallbackTarget =
        initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container;
      fallbackTarget.focus();
    };

    const rafId = window.requestAnimationFrame(requestFocus);

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onEscapeRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      // Collect focusable elements inside the dialog.
      const focusableElements = getFocusableElements(container);

      // Keep focus on the dialog itself when no focusable children exist.
      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      // Find the index of the current active element.
      const activeElement = document.activeElement as HTMLElement | null;
      const activeIndex = activeElement ? focusableElements.indexOf(activeElement) : -1;

      // Shift+Tab: loop from the first item back to the last item.
      if (event.shiftKey && (activeIndex <= 0 || activeIndex === -1)) {
        event.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        return;
      }

      // Tab: loop from the last item back to the first item.
      if (!event.shiftKey && (activeIndex === -1 || activeIndex === focusableElements.length - 1)) {
        event.preventDefault();
        focusableElements[0]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeydown);
      // Restore focus to the previous active element when the dialog closes.
      if (restoreFocusRef?.current !== false) {
        previousActiveElementRef.current?.focus();
      }
      if (restoreFocusRef) {
        restoreFocusRef.current = true;
      }
    };
  }, [containerRef, initialFocusRef, isEnabled, restoreFocusRef]);
};
