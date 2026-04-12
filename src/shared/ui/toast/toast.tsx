'use client';

import React from 'react';
import { css, cva, cx } from 'styled-system/css';

import { ReportIcon } from '@/shared/ui/icons/app-icons';
import { XButton } from '@/shared/ui/x-button/x-button';

export type ToastItem = {
  description?: string;
  id: string;
  message: string;
  tone: 'error' | 'info' | 'success';
};

type ToastViewportProps = {
  closeLabel?: string;
  items: ToastItem[];
  onClose?: (id: string) => void;
};

/**
 * Lightweight toast viewport for page-level usage without global state.
 */
export const ToastViewport = ({ closeLabel: _closeLabel, items, onClose }: ToastViewportProps) => (
  <div aria-live="polite" className={viewportClass}>
    {items.map(item => (
      <div
        className={toastRecipe({ tone: item.tone })}
        key={item.id}
        role={item.tone === 'error' ? 'alert' : 'status'}
      >
        <span aria-hidden className={cx(toneIconClass, toneIconRecipe({ tone: item.tone }))}>
          <ReportIcon color="current" size="lg" />
        </span>
        <div className={contentClass}>
          <p className={titleClass}>{item.message}</p>
          {item.description ? <p className={descriptionClass}>{item.description}</p> : null}
        </div>
        {onClose ? (
          <XButton ariaLabel={_closeLabel ?? 'Close'} onClick={() => onClose(item.id)} />
        ) : null}
      </div>
    ))}
  </div>
);

const viewportClass = css({
  position: 'fixed',
  right: '3',
  bottom: '3',
  zIndex: '70',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  width: '[min(24rem,calc(100vw-1.5rem))]',
  lg: {
    right: '4',
    bottom: '4',
  },
});

const toastRecipe = cva({
  base: {
    display: 'flex',
    gap: '2',
    borderRadius: '2xl',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: 'surface',
    color: 'text',
    px: '4',
    py: '4',
    boxShadow: 'floating',
  },
  variants: {
    tone: {
      error: {
        borderColor: {
          base: 'red.200',
          _dark: 'red.800',
        },
        backgroundColor: {
          base: 'red.50',
          _dark: 'gray.900',
        },
      },
      info: {
        borderColor: {
          base: 'blue.100',
          _dark: 'blue.800',
        },
        backgroundColor: {
          base: 'blue.50',
          _dark: 'gray.900',
        },
      },
      success: {
        borderColor: {
          base: 'green.200',
          _dark: 'green.800',
        },
        backgroundColor: {
          base: 'green.50',
          _dark: 'gray.900',
        },
      },
    },
  },
});

const toneIconClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const toneIconRecipe = cva({
  variants: {
    tone: {
      error: {
        color: 'error',
      },
      info: {
        color: {
          base: 'blue.400',
          _dark: 'blue.300',
        },
      },
      success: {
        color: 'success',
      },
    },
  },
});

const contentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const titleClass = css({
  fontSize: 'lg',
  lineHeight: 'tight',
  fontWeight: '[700]',
  letterSpacing: '[-0.02em]',
  color: 'text',
});

const descriptionClass = css({
  m: '0',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  letterSpacing: '[-0.01em]',
  color: {
    base: 'muted',
    _dark: 'gray.300',
  },
});
