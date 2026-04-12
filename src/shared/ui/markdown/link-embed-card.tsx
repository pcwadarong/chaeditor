'use client';

import React, { useEffect, useState } from 'react';
import { css, cx } from 'styled-system/css';

import type { FetchLinkPreviewMeta } from '@/entities/editor-core';
import { type LinkEmbedData, shouldFallbackToPlainLink } from '@/shared/lib/markdown/link-embed';

type LinkEmbedCardProps = {
  className?: string;
  fallbackLabel?: string;
  fetchLinkPreviewMeta?: FetchLinkPreviewMeta;
  url: string;
  variant: 'card' | 'preview';
};

type LinkEmbedState =
  | {
      status: 'loading';
    }
  | {
      data: LinkEmbedData;
      status: 'success';
    }
  | {
      data: LinkEmbedData;
      status: 'fallback';
    };

/**
 * Extracts a hostname from a URL without throwing.
 */
const getSafeSiteName = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

/**
 * Creates fallback metadata for a link preview request failure.
 */
const createFallbackLinkEmbedData = (url: string, fallbackLabel?: string): LinkEmbedData => ({
  description: '',
  favicon: null,
  image: null,
  siteName: getSafeSiteName(url),
  title: fallbackLabel || url,
  url,
});

/**
 * Renders a preview link or card using fetched metadata from an external URL.
 */
export const LinkEmbedCard = ({
  className,
  fallbackLabel,
  fetchLinkPreviewMeta,
  url,
  variant,
}: LinkEmbedCardProps) => {
  const [state, setState] = useState<LinkEmbedState>({
    status: 'loading',
  });

  useEffect(() => {
    if (!fetchLinkPreviewMeta) {
      setState({
        data: createFallbackLinkEmbedData(url, fallbackLabel),
        status: 'fallback',
      });
      return;
    }

    const controller = new AbortController();

    const fetchEmbedData = async () => {
      try {
        const data = await fetchLinkPreviewMeta(url, controller.signal);

        if (!data) {
          throw new Error('link preview data is empty');
        }

        setState({
          data,
          status: shouldFallbackToPlainLink(data) ? 'fallback' : 'success',
        });
      } catch {
        if (controller.signal.aborted) return;

        setState({
          data: createFallbackLinkEmbedData(url, fallbackLabel),
          status: 'fallback',
        });
      }
    };

    void fetchEmbedData();

    return () => controller.abort();
  }, [fallbackLabel, fetchLinkPreviewMeta, url]);

  if (state.status === 'loading') {
    return (
      <span
        aria-live="polite"
        className={cx(variant === 'preview' ? previewSkeletonClass : cardSkeletonClass, className)}
        data-link-embed-card="true"
      >
        <span className={skeletonTextClass}>Loading link information...</span>
      </span>
    );
  }

  if (state.status === 'fallback') {
    return (
      <a
        className={fallbackLinkClass}
        href={state.data.url}
        rel="noreferrer noopener"
        target="_blank"
      >
        {fallbackLabel || state.data.title}
      </a>
    );
  }

  const { data } = state;

  if (variant === 'preview') {
    return (
      <a
        aria-label={data.title}
        className={cx(previewLinkClass, className)}
        data-link-embed-card="true"
        href={data.url}
        rel="noreferrer noopener"
        target="_blank"
      >
        {data.favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" aria-hidden className={faviconClass} src={data.favicon} />
        ) : (
          <span aria-hidden className={faviconFallbackClass} />
        )}
        <span className={previewTitleClass}>{data.title}</span>
      </a>
    );
  }

  return (
    <a
      aria-label={data.title}
      className={cx(cardClass, className)}
      data-link-embed-card="true"
      href={data.url}
      rel="noreferrer noopener"
      target="_blank"
    >
      <span className={cardTextBlockClass}>
        <strong className={titleClass}>{data.title}</strong>
        {data.description ? <span className={descriptionClass}>{data.description}</span> : null}
        <span className={urlRowClass}>
          {data.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" aria-hidden className={faviconClass} src={data.favicon} />
          ) : (
            <span aria-hidden className={faviconFallbackClass} />
          )}
          <span className={urlClass}>{data.url}</span>
        </span>
      </span>
      {data.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" aria-hidden className={previewImageClass} src={data.image} />
      ) : null}
    </a>
  );
};

const sharedCardSurfaceClass = css({
  width: 'full',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  background: 'surface',
  textDecoration: 'none',
  transition: 'common',
  _hover: {
    borderColor: 'borderStrong',
    transform: 'translateY(-1px)',
  },
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});

const previewLinkClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  maxWidth: '[min(100%,24rem)]',
  color: 'text',
  textDecoration: 'underline',
  textDecorationThickness: '[0.08em]',
  textUnderlineOffset: '[0.16em]',
  verticalAlign: 'baseline',
  transition: 'common',
  _hover: {
    color: 'primary',
  },
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
    borderRadius: 'sm',
  },
});

const previewTitleClass = css({
  overflow: 'hidden',
  minWidth: '0',
  fontSize: 'md',
  fontWeight: 'semibold',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const cardClass = cx(
  sharedCardSurfaceClass,
  css({
    display: 'grid',
    gridTemplateColumns: {
      base: '1fr',
      md: 'minmax(0, 1fr) auto',
    },
    gap: '4',
    alignItems: 'start',
    padding: '4',
  }),
);

const cardTextBlockClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  minWidth: '0',
});

const titleClass = css({
  overflow: 'hidden',
  color: 'text',
  fontSize: 'md',
  fontWeight: 'semibold',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const descriptionClass = css({
  overflow: 'hidden',
  color: 'muted',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  lineClamp: '2',
});

const urlRowClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  minWidth: '0',
});

const urlClass = css({
  overflow: 'hidden',
  minWidth: '0',
  color: 'muted',
  fontSize: 'sm',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const previewImageClass = css({
  width: 'full',
  height: '[10rem]',
  objectFit: 'cover',
  borderRadius: 'lg',
  background: 'surfaceMuted',
  flexShrink: '0',
  md: {
    width: '[10rem]',
    height: '[7rem]',
  },
});

const faviconClass = css({
  width: '[1rem]',
  height: '[1rem]',
  borderRadius: 'xs',
  flexShrink: '0',
});

const faviconFallbackClass = css({
  width: '[1rem]',
  height: '[1rem]',
  borderRadius: 'xs',
  flexShrink: '0',
  background: 'surfaceMuted',
});

const cardSkeletonClass = cx(
  sharedCardSurfaceClass,
  css({
    display: 'inline-flex',
    minHeight: '[8.5rem]',
    alignItems: 'center',
    padding: '4',
    background:
      '[linear-gradient(120deg, rgba(148,163,184,0.14), rgba(148,163,184,0.24), rgba(148,163,184,0.14))]',
  }),
);

const previewSkeletonClass = cx(
  css({
    display: 'inline-flex',
    minHeight: '[1.5rem]',
    width: 'auto',
    maxWidth: '[min(100%,42rem)]',
    alignItems: 'center',
    gap: '2',
    verticalAlign: 'baseline',
    borderRadius: 'sm',
    background:
      '[linear-gradient(120deg, rgba(148,163,184,0.14), rgba(148,163,184,0.24), rgba(148,163,184,0.14))]',
  }),
);

const skeletonTextClass = css({
  color: 'muted',
  fontSize: 'sm',
});

const fallbackLinkClass = css({
  color: 'primary',
  textDecoration: 'underline',
  textDecorationThickness: '[0.08em]',
  textUnderlineOffset: '[0.18em]',
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});
