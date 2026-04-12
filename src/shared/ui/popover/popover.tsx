'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { css, cx } from 'styled-system/css';

import { resolvePopoverPortalLeft } from '@/shared/lib/overlay/overlay-position';
import { useDialogFocusManagement } from '@/shared/lib/react/use-dialog-focus-management';
import { Button } from '@/shared/ui/button/button';
import type {
  ClosePopover,
  PopoverProps,
} from '@/shared/ui/primitive-registry/markdown-primitive-props';
import { focusVisibleRingStyles } from '@/shared/ui/styles/primitive-theme';
import { srOnlyClass } from '@/shared/ui/styles/sr-only-style';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';

export type { ClosePopover, PopoverProps };

/**
 * Shared popover shell with click-triggered dialog content.
 */
export const Popover = ({
  children,
  isOpen: controlledIsOpen,
  label,
  onOpenChange,
  onTriggerMouseDown,
  panelClassName,
  panelLabel,
  portalPlacement = 'end',
  renderInPortal = false,
  rootClassName,
  triggerAriaLabel,
  triggerClassName,
  triggerContent,
  triggerLabelClassName,
  triggerSize = 'sm',
  triggerTone = 'white',
  triggerTooltip,
  triggerValueClassName,
  triggerVariant = 'ghost',
  value,
  viewportPadding = 8,
}: PopoverProps) => {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = typeof controlledIsOpen === 'boolean';
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef(true);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>();
  const panelId = useId();
  const panelLabelId = useId();
  const triggerLabelId = useId();
  const valueId = useId();
  const resolvedTriggerLabel = triggerAriaLabel ?? panelLabel;
  const usesSharedLabel = resolvedTriggerLabel === panelLabel;

  /**
   * Updates the open state for both controlled and uncontrolled modes.
   */
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledIsOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  useEffect(() => {
    if (!isOpen) return;

    /**
     * Closes the panel when the user presses outside the popover.
     */
    const handleOutsideInteraction = (event: Event) => {
      const eventTarget = event.target as Node;

      if (!rootRef.current?.contains(eventTarget) && !panelRef.current?.contains(eventTarget)) {
        setOpen(false);
      }
    };

    window.addEventListener('click', handleOutsideInteraction);
    window.addEventListener('pointerdown', handleOutsideInteraction);

    return () => {
      window.removeEventListener('click', handleOutsideInteraction);
      window.removeEventListener('pointerdown', handleOutsideInteraction);
    };
  }, [isOpen, setOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !renderInPortal) return;

    /**
     * Resolves the viewport position of the portal panel from the trigger.
     */
    const updatePortalPosition = () => {
      if (!triggerRef.current || !panelRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const panelRect = panelRef.current.getBoundingClientRect();
      const baseTop = triggerRect.bottom + 9;
      const baseStyle: React.CSSProperties = {
        maxWidth: 'calc(100vw - 1rem)',
        position: 'fixed',
        top: baseTop,
        width: 'max-content',
      };

      setPortalStyle({
        ...baseStyle,
        left: resolvePopoverPortalLeft({
          overlayWidth: panelRect.width,
          placement: portalPlacement,
          triggerLeft: triggerRect.left,
          triggerRight: triggerRect.right,
          viewportPadding,
          viewportWidth: window.innerWidth,
        }),
      });
    };

    updatePortalPosition();

    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);

    return () => {
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [isOpen, portalPlacement, renderInPortal, viewportPadding]);

  useDialogFocusManagement({
    containerRef: panelRef,
    initialFocusRef: undefined,
    isEnabled: isOpen,
    onEscape: () => {
      setOpen(false);
    },
    restoreFocusRef,
  });

  /**
   * Closes the popover panel.
   */
  const closePopover: ClosePopover = options => {
    restoreFocusRef.current = options?.restoreFocus ?? true;
    setOpen(false);
  };

  const triggerButton = (
    <Button
      aria-controls={isOpen ? panelId : undefined}
      aria-describedby={!triggerContent && value ? valueId : undefined}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-labelledby={usesSharedLabel ? panelLabelId : triggerLabelId}
      className={cx(triggerButtonClass, triggerClassName)}
      onClick={() => setOpen(!isOpen)}
      onMouseDown={onTriggerMouseDown}
      ref={triggerRef}
      size={triggerSize}
      tone={triggerTone}
      type="button"
      variant={triggerVariant}
    >
      {triggerContent ? (
        triggerContent
      ) : (
        <>
          <span className={cx(triggerLabelClass, triggerLabelClassName)}>{label}</span>
          <span className={cx(triggerValueClass, triggerValueClassName)} id={valueId}>
            {value}
          </span>
        </>
      )}
    </Button>
  );

  const panel = isOpen ? (
    <div
      aria-labelledby={panelLabelId}
      className={cx(panelClass, renderInPortal ? portaledPanelClass : undefined, panelClassName)}
      id={panelId}
      ref={panelRef}
      role="dialog"
      style={renderInPortal ? portalStyle : undefined}
      tabIndex={-1}
    >
      {typeof children === 'function' ? children({ closePopover }) : children}
    </div>
  ) : null;

  return (
    <div className={cx(rootClass, rootClassName)} ref={rootRef}>
      <span className={srOnlyClass} id={panelLabelId}>
        {panelLabel}
      </span>
      {!usesSharedLabel ? (
        <span className={srOnlyClass} id={triggerLabelId}>
          {resolvedTriggerLabel}
        </span>
      ) : null}
      {triggerTooltip ? <Tooltip content={triggerTooltip}>{triggerButton}</Tooltip> : triggerButton}
      {renderInPortal && panel ? createPortal(panel, document.body) : panel}
    </div>
  );
};

const rootClass = css({
  position: 'relative',
});

const triggerButtonClass = css({
  _hover: {
    color: 'primary',
  },
  _focusVisible: {
    ...focusVisibleRingStyles,
    color: 'primary',
  },
});

const triggerLabelClass = css({
  fontSize: 'xs',
  fontWeight: 'bold',
  letterSpacing: '[0.12em]',
  textTransform: 'uppercase',
  color: 'muted',
});

const triggerValueClass = css({
  fontSize: 'sm',
  color: 'text',
});

const panelClass = css({
  position: 'absolute',
  top: '[calc(100% + 0.55rem)]',
  right: '0',
  minWidth: '48',
  maxHeight: 'calc(100vh - 1rem)',
  p: '2',
  borderRadius: '2xl',
  border: '[1px solid var(--colors-border)]',
  backgroundColor: 'surface',
  boxShadow: 'floating',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  overflowY: 'auto',
  zIndex: '30',
});

const portaledPanelClass = css({
  top: '[auto]',
  right: '[auto]',
});
