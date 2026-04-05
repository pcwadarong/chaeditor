'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { css, cx } from 'styled-system/css';

import { useDialogFocusManagement } from '@/shared/lib/react/use-dialog-focus-management';
import type { ModalProps } from '@/shared/ui/primitive-registry/markdown-primitive-props';
import {
  overlayBackdropColor,
  overlayBackdropStyleValue,
} from '@/shared/ui/styles/primitive-theme';
import { XButton } from '@/shared/ui/x-button/x-button';

export type { ModalProps };

/**
 * Renders a shared portal-based modal shell.
 */
export const Modal = ({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  backdropClassName,
  children,
  closeAriaLabel,
  closeButtonClassName,
  frameClassName,
  initialFocusRef,
  isOpen,
  onClose,
}: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
    };
  }, [isMounted, isOpen]);

  useDialogFocusManagement({
    containerRef: frameRef,
    initialFocusRef,
    isEnabled: isOpen && isMounted,
    onEscape: onClose,
  });

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cx(backdropClass, backdropClassName)}
      style={{ background: overlayBackdropStyleValue }}
    >
      <div
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-modal="true"
        ref={frameRef}
        role="dialog"
        tabIndex={-1}
        className={cx(frameBaseClass, frameClassName)}
      >
        <XButton
          ariaLabel={closeAriaLabel}
          className={cx(closeButtonClass, closeButtonClassName)}
          onClick={onClose}
        />
        {children}
      </div>
    </div>,
    document.body,
  );
};

const backdropClass = css({
  position: 'fixed',
  inset: '0',
  zIndex: '1200',
  backgroundColor: overlayBackdropColor,
  p: '4',
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
});

const frameBaseClass = css({
  position: 'relative',
  borderRadius: '3xl',
  maxWidth: 'full',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'full',
  minWidth: '0',
  minHeight: '0',
  overflow: 'hidden',
});

const closeButtonClass = css({
  position: 'absolute',
  top: '[0.6rem]',
  right: '[0.5rem]',
  zIndex: '10',
  lineHeight: 'none',
});
