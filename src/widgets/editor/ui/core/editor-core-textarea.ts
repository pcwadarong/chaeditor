import type React from 'react';

import type { Locale } from '@/widgets/editor/ui/core/editor-core.types';

type TextareaRefMap = Record<Locale, { current: HTMLTextAreaElement | null }>;

/**
 * Recalculates textarea height after it mounts in a hidden panel.
 */
export const resizeTextareaToContent = (element: HTMLTextAreaElement | null) => {
  if (!element) return;

  element.style.height = '0px';
  element.style.height = `${element.scrollHeight}px`;
};

/**
 * Stores the current locale textarea scroll position.
 */
export const rememberTextareaScroll = (
  locale: Locale,
  scrollTopByLocaleRef: React.RefObject<Record<Locale, number>>,
  textareaRefs: TextareaRefMap,
) => {
  scrollTopByLocaleRef.current[locale] = textareaRefs[locale].current?.scrollTop ?? 0;
};
