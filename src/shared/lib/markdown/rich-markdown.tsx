import React, { Fragment, type ReactNode } from 'react';
import { css, cx } from 'styled-system/css';

import type { MarkdownRendererHostAdapters } from '@/entities/editor-core';
import {
  normalizeMarkdownHtmlAliases,
  preprocessMarkdownInlineSyntax,
} from '@/entities/editor-core/model/markdown-inline';
import {
  parseRichMarkdownSegments,
  type RichMarkdownRenderArgs,
} from '@/entities/editor-core/model/markdown-segments';
import {
  markdownH1Class,
  markdownH2Class,
  markdownH3Class,
  markdownH4Class,
} from '@/shared/lib/markdown/markdown-config';
import {
  createRichMarkdownRendererRegistry,
  type PartialRichMarkdownRendererRegistry,
} from '@/shared/lib/markdown/rich-markdown-renderers';
import { ChevronRightIcon } from '@/shared/ui/icons/app-icons';

type MarkdownFragmentRenderer = (markdown: string, key: string) => ReactNode;

type RenderRichMarkdownArgs = RichMarkdownRenderArgs & {
  adapters?: MarkdownRendererHostAdapters;
  renderMarkdownFragment: MarkdownFragmentRenderer;
  renderers?: PartialRichMarkdownRendererRegistry;
};

/**
 * Converts parsed markdown fragments and custom segments into React nodes.
 *
 * @param markdown Raw markdown string.
 * @param renderMarkdownFragment Renderer for plain markdown fragments.
 * @param adapters Optional host adapters used by segment renderers.
 * @param renderers Optional custom renderer overrides.
 * @returns A list of rendered React nodes.
 */
export const renderRichMarkdown = ({
  adapters,
  markdown,
  renderMarkdownFragment,
  renderers,
}: RenderRichMarkdownArgs) => {
  const resolvedRenderers = createRichMarkdownRendererRegistry(renderers, adapters);

  return parseRichMarkdownSegments(normalizeMarkdownHtmlAliases(markdown)).map((segment, index) => {
    const key = `rich-markdown-${index}`;

    if (segment.type === 'markdown') {
      return (
        <Fragment key={key}>
          {renderMarkdownFragment(preprocessMarkdownInlineSyntax(segment.markdown), key)}
        </Fragment>
      );
    }

    if (segment.type === 'video') {
      return resolvedRenderers.video({ key, segment });
    }

    if (segment.type === 'attachment') {
      return resolvedRenderers.attachment({ key, segment });
    }

    if (segment.type === 'math') {
      return resolvedRenderers.math({ key, segment });
    }

    if (segment.type === 'gallery') {
      return resolvedRenderers.gallery({ key, segment });
    }

    if (segment.type === 'subtext') {
      return (
        <p className={subtextClass} key={key}>
          {segment.content}
        </p>
      );
    }

    if (segment.type === 'align') {
      return (
        <div className={alignedBlockClass} key={key} style={{ textAlign: segment.align }}>
          {renderRichMarkdown({
            adapters,
            markdown: segment.content,
            renderMarkdownFragment,
            renderers: resolvedRenderers,
          })}
        </div>
      );
    }

    if (segment.type !== 'toggle') {
      return null;
    }

    const summaryClassName =
      segment.headingLevel === 1
        ? toggleSummaryH1Class
        : segment.headingLevel === 2
          ? toggleSummaryH2Class
          : segment.headingLevel === 3
            ? toggleSummaryH3Class
            : segment.headingLevel === 4
              ? toggleSummaryH4Class
              : toggleListSummaryClass;

    return (
      <details className={toggleClass} key={key}>
        <summary className={summaryClassName}>
          <ChevronRightIcon
            aria-hidden
            className={toggleChevronClass}
            color="muted"
            data-toggle-chevron="true"
            size="sm"
          />
          <span>{segment.title}</span>
        </summary>
        <div className={toggleContentClass}>
          {renderRichMarkdown({
            adapters,
            markdown: segment.content,
            renderMarkdownFragment,
            renderers: resolvedRenderers,
          })}
        </div>
      </details>
    );
  });
};

const subtextClass = css({
  m: '0',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  color: 'muted',
});

const alignedBlockClass = css({
  '& > * + *': {
    mt: '5',
  },
});

const toggleClass = css({
  '& summary::-webkit-details-marker': {
    display: 'none',
  },
  '&[open] [data-toggle-chevron="true"]': {
    transform: 'rotate(90deg)',
  },
});

const toggleSummaryBaseClass = css({
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2',
  width: 'full',
  listStyle: 'none',
  px: '0',
  py: '1',
  fontWeight: 'semibold',
  lineHeight: 'snug',
  _marker: {
    display: 'none',
  },
});

const toggleSummaryH1Class = cx(toggleSummaryBaseClass, markdownH1Class);

const toggleSummaryH2Class = cx(toggleSummaryBaseClass, markdownH2Class);

const toggleSummaryH3Class = cx(toggleSummaryBaseClass, markdownH3Class);

const toggleSummaryH4Class = cx(toggleSummaryBaseClass, markdownH4Class);

const toggleListSummaryClass = cx(
  toggleSummaryBaseClass,
  markdownH4Class,
  css({
    px: '0',
    py: '1',
  }),
);

const toggleChevronClass = css({
  flex: 'none',
  transition: 'transform',
});

const toggleContentClass = css({
  pl: '[1.75rem]',
  pb: '3',
  '& > * + *': {
    mt: '4',
  },
});
