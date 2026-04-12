'use client';

import type mermaid from 'mermaid';
import React from 'react';
import { css } from 'styled-system/css';

type MarkdownMermaidProps = {
  chart: string;
};

let isMermaidInitialized = false;

/**
 * Initializes the Mermaid runtime once.
 *
 * @param mermaid Mermaid module instance.
 */
const ensureMermaidInitialized = (mermaidModule: typeof mermaid) => {
  if (isMermaidInitialized) return;

  mermaidModule.initialize({
    securityLevel: 'strict',
    startOnLoad: false,
    suppressErrorRendering: true,
    theme: 'neutral',
  });
  isMermaidInitialized = true;
};

/**
 * Renders a fenced `mermaid` block as a diagram with a code fallback.
 *
 * @param props Mermaid source string.
 * @returns The rendered Mermaid diagram or an error fallback.
 */
export const MarkdownMermaid = ({ chart }: MarkdownMermaidProps) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSourceVisible, setIsSourceVisible] = React.useState(false);
  const [svgMarkup, setSvgMarkup] = React.useState<string | null>(null);
  const chartId = React.useId().replace(/:/g, '-');
  const sourcePanelId = `${chartId}-source`;

  React.useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        ensureMermaidInitialized(mermaid);

        const { svg } = await mermaid.render(`markdown-mermaid-${chartId}`, chart);

        if (!isMounted) return;

        setSvgMarkup(svg);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) return;

        setSvgMarkup(null);
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to render the Mermaid diagram.',
        );
      }
    };

    void renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, chartId]);

  if (errorMessage) {
    return (
      <figure className={mermaidFrameClass} data-markdown-mermaid="true">
        <header className={mermaidHeaderClass}>
          <figcaption className={mermaidTitleClass}>Mermaid</figcaption>
        </header>
        <p className={mermaidErrorClass} role="alert">
          Mermaid render error
        </p>
        <pre className={mermaidFallbackClass} id={sourcePanelId}>
          {chart}
        </pre>
      </figure>
    );
  }

  if (!svgMarkup) {
    return (
      <figure className={mermaidFrameClass} data-markdown-mermaid="true">
        <header className={mermaidHeaderClass}>
          <figcaption className={mermaidTitleClass}>Mermaid</figcaption>
        </header>
        <div aria-live="polite" className={mermaidLoadingClass} role="status">
          Rendering the diagram...
        </div>
      </figure>
    );
  }

  return (
    <figure className={mermaidFrameClass} data-markdown-mermaid="true">
      <header className={mermaidHeaderClass}>
        <figcaption className={mermaidTitleClass}>Mermaid</figcaption>
        <button
          aria-controls={sourcePanelId}
          aria-expanded={isSourceVisible}
          className={mermaidSourceToggleClass}
          onClick={() => setIsSourceVisible(current => !current)}
          type="button"
        >
          {isSourceVisible ? 'Hide source' : 'View source'}
        </button>
      </header>
      <div className={mermaidSvgWrapClass} dangerouslySetInnerHTML={{ __html: svgMarkup }} />
      {isSourceVisible ? (
        <pre className={mermaidFallbackClass} id={sourcePanelId}>
          {chart}
        </pre>
      ) : null}
    </figure>
  );
};

const mermaidFrameClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  width: 'full',
  px: '4',
  py: '4',
  borderRadius: 'xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'surface',
  overflowX: 'auto',
});

const mermaidHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
});

const mermaidTitleClass = css({
  fontSize: 'xs',
  fontWeight: 'semibold',
  color: 'muted',
  textTransform: 'uppercase',
  letterSpacing: '[0.08em]',
});

const mermaidSourceToggleClass = css({
  flexShrink: '0',
  px: '3',
  py: '1.5',
  borderRadius: 'full',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  fontSize: 'xs',
  fontWeight: 'medium',
  bg: 'surface',
  transition: 'common',
  _hover: {
    bg: 'surfaceMuted',
  },
  _focusVisible: {
    outline: '[2px solid var(--colors-focus-ring)]',
    outlineOffset: '[2px]',
  },
});

const mermaidLoadingClass = css({
  fontSize: 'sm',
  color: 'muted',
});

const mermaidErrorClass = css({
  fontSize: 'sm',
  fontWeight: 'medium',
  color: 'error',
});

const mermaidFallbackClass = css({
  m: '0',
  p: '4',
  borderRadius: 'lg',
  bg: 'surfaceMuted',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  whiteSpace: 'pre-wrap',
});

const mermaidSvgWrapClass = css({
  '& svg': {
    display: 'block',
    width: 'full',
    height: 'auto',
    maxWidth: 'full',
  },
});
