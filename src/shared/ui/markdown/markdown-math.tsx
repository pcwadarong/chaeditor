import katex from 'katex';
import React from 'react';
import { css } from 'styled-system/css';

type MarkdownMathProps = {
  formula: string;
  isBlock?: boolean;
};

type RenderedMathResult =
  | {
      html: string;
      ok: true;
    }
  | {
      errorMessage: string;
      ok: false;
    };

/**
 * Converts a LaTeX expression into KaTeX HTML.
 */
const renderMathHtml = ({ formula, isBlock = false }: MarkdownMathProps): RenderedMathResult => {
  try {
    return {
      html: katex.renderToString(formula, {
        displayMode: isBlock,
        output: 'html',
        strict: 'ignore',
        throwOnError: true,
      }),
      ok: true,
    };
  } catch (error) {
    return {
      errorMessage: error instanceof Error ? error.message : 'Unknown math error',
      ok: false,
    };
  }
};

/**
 * Renders custom markdown math syntax with KaTeX.
 */
export const MarkdownMath = ({ formula, isBlock = false }: MarkdownMathProps) => {
  const result = renderMathHtml({
    formula,
    isBlock,
  });

  if (!result.ok) {
    if (isBlock) {
      return (
        <div
          aria-label="Math formula error"
          className={mathFallbackBlockClass}
          data-markdown-math="block"
          data-markdown-math-error="true"
        >
          <span className={mathFallbackLabelClass}>Formula error</span>
          <code className={mathFallbackFormulaClass}>{formula}</code>
          <span className={mathFallbackHintClass}>{result.errorMessage}</span>
        </div>
      );
    }

    return (
      <span
        aria-label="Math formula error"
        className={mathFallbackInlineClass}
        data-markdown-math="inline"
        data-markdown-math-error="true"
        title={result.errorMessage}
      >
        <code className={mathFallbackFormulaClass}>{formula}</code>
        <span className={mathFallbackInlineHintClass}>Formula error</span>
      </span>
    );
  }

  if (isBlock) {
    return (
      <div
        className={mathBlockClass}
        data-markdown-math="block"
        dangerouslySetInnerHTML={{ __html: result.html }}
      />
    );
  }

  return (
    <span
      className={mathInlineClass}
      data-markdown-math="inline"
      dangerouslySetInnerHTML={{ __html: result.html }}
    />
  );
};

const mathInlineClass = css({
  display: 'inline',
  verticalAlign: 'middle',
  maxWidth: 'full',
  overflow: 'visible',
});

const mathBlockClass = css({
  display: 'block',
  width: 'full',
  overflow: 'visible',
  py: '2',
});

const mathFallbackInlineClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  px: '1.5',
  py: '0.5',
  borderRadius: 'sm',
  backgroundColor: 'surfaceMuted',
  color: 'error',
  verticalAlign: 'middle',
  whiteSpace: 'normal',
});

const mathFallbackBlockClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
  width: 'full',
  px: '3',
  py: '3',
  borderRadius: 'md',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'borderStrong',
  backgroundColor: 'surfaceMuted',
});

const mathFallbackLabelClass = css({
  fontSize: 'xs',
  fontWeight: 'semibold',
  color: 'error',
});

const mathFallbackFormulaClass = css({
  fontFamily: 'mono',
  fontSize: 'sm',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

const mathFallbackHintClass = css({
  fontSize: 'xs',
  color: 'error',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

const mathFallbackInlineHintClass = css({
  fontSize: 'xs',
});
