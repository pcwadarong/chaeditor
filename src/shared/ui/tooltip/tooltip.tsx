'use client';

import React, {
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { css, cx } from 'styled-system/css';

import { resolveTooltipViewportPosition } from '@/shared/lib/overlay/overlay-position';
import type {
  TooltipProps,
  TooltipTriggerProps,
} from '@/shared/ui/primitive-registry/markdown-primitive-props';

export type { TooltipProps, TooltipTriggerProps };

/**
 * Lightweight tooltip that shows helper text on hover or focus.
 */
export const Tooltip = ({
  children,
  className,
  content,
  contentClassName,
  forceOpen = false,
  openOnFocus = true,
  portalClassName,
  preferredPlacement = 'top',
  viewportPadding = 8,
}: TooltipProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();
  const isOpen = forceOpen || isHovering || (openOnFocus && isFocused);

  if (!isValidElement(children)) {
    throw new Error('Tooltip requires a single React element child.');
  }

  const triggerElement = children as React.ReactElement<TooltipTriggerProps>;
  const childProps = triggerElement.props;
  const describedBy = [childProps['aria-describedby'], isOpen ? tooltipId : null]
    .filter(Boolean)
    .join(' ');

  useLayoutEffect(() => {
    if (!isOpen) {
      setTooltipStyle(undefined);
      return;
    }

    /**
     * Resolves the tooltip viewport position from the trigger wrapper.
     */
    const updateTooltipPosition = () => {
      if (!rootRef.current || !tooltipRef.current) return;

      const triggerRect = rootRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const position = resolveTooltipViewportPosition({
        gap: 8,
        preferredPlacement,
        tooltipHeight: tooltipRect.height,
        tooltipWidth: tooltipRect.width,
        triggerRect,
        viewportHeight: window.innerHeight,
        viewportPadding,
        viewportWidth: window.innerWidth,
      });

      setTooltipStyle({
        left: position.left,
        position: 'fixed',
        top: position.top,
      });
    };

    updateTooltipPosition();

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [isOpen, preferredPlacement, viewportPadding]);

  return (
    <span
      className={cx(rootClass, className)}
      ref={rootRef}
      onBlurCapture={() => {
        if (!openOnFocus) return;
        setIsFocused(false);
      }}
      onFocusCapture={() => {
        if (!openOnFocus) return;
        setIsFocused(true);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {cloneElement<TooltipTriggerProps>(triggerElement, {
        'aria-describedby': describedBy || undefined,
      })}
      {isOpen
        ? createPortal(
            <span
              className={cx(tooltipPortalClass, portalClassName)}
              id={tooltipId}
              ref={tooltipRef}
              role="tooltip"
              style={{
                ...tooltipStyle,
                visibility: tooltipStyle ? 'visible' : 'hidden',
              }}
            >
              <span className={cx(tooltipClass, contentClassName)}>{content}</span>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
};

const rootClass = css({
  display: 'inline-flex',
});

const tooltipClass = css({
  px: '2',
  py: '1',
  borderRadius: 'md',
  backgroundColor: '[rgba(15,23,42,0.92)]',
  color: 'white',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '[rgba(255,255,255,0.08)]',
  fontSize: 'xs',
  lineHeight: 'tight',
  whiteSpace: 'nowrap',
  boxShadow: '[0_12px_28px_rgba(15,23,42,0.28)]',
});

const tooltipPortalClass = css({
  zIndex: '[9999]',
  pointerEvents: 'none',
});
