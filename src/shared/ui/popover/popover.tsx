'use client';

import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { css, cx } from 'styled-system/css';

import { useDialogFocusManagement } from '@/shared/lib/react/use-dialog-focus-management';
import type { ButtonSize, ButtonTone, ButtonVariant } from '@/shared/ui/button/button';
import { Button } from '@/shared/ui/button/button';
import { focusVisibleRingStyles } from '@/shared/ui/styles/primitive-theme';
import { srOnlyClass } from '@/shared/ui/styles/sr-only-style';
import { Tooltip } from '@/shared/ui/tooltip/tooltip';

export type ClosePopover = (options?: { restoreFocus?: boolean }) => void;

type PopoverRenderArgs = {
  closePopover: ClosePopover;
};

type PopoverProps = {
  children: ReactNode | ((args: PopoverRenderArgs) => ReactNode);
  isOpen?: boolean;
  label?: string;
  onOpenChange?: (nextOpen: boolean) => void;
  onTriggerMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  panelClassName?: string;
  panelLabel: string;
  portalPlacement?: 'end' | 'start';
  renderInPortal?: boolean;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  triggerContent?: ReactNode;
  triggerSize?: ButtonSize;
  triggerTone?: ButtonTone;
  triggerTooltip?: string;
  triggerVariant?: ButtonVariant;
  value?: string;
};

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
  triggerAriaLabel,
  triggerClassName,
  triggerContent,
  triggerSize = 'sm',
  triggerTone = 'white',
  triggerTooltip,
  triggerVariant = 'ghost',
  value,
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
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const baseTop = triggerRect.bottom + 9;

      if (portalPlacement === 'start') {
        setPortalStyle({
          left: triggerRect.left,
          position: 'fixed',
          top: baseTop,
        });
        return;
      }

      setPortalStyle({
        position: 'fixed',
        right: Math.max(window.innerWidth - triggerRect.right, 0),
        top: baseTop,
      });
    };

    updatePortalPosition();

    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);

    return () => {
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [isOpen, portalPlacement, renderInPortal]);

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
          <span className={triggerLabelClass}>{label}</span>
          <span className={triggerValueClass} id={valueId}>
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
    <div className={rootClass} ref={rootRef}>
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
  p: '2',
  borderRadius: '2xl',
  border: '[1px solid var(--colors-border)]',
  backgroundColor: 'surface',
  boxShadow: 'floating',
  display: 'grid',
  gap: '1',
  zIndex: '30',
});

const portaledPanelClass = css({
  top: '[auto]',
  right: '[auto]',
});
