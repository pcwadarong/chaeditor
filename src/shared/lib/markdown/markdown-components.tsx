import React, {
  type AnchorHTMLAttributes,
  Children,
  type ImgHTMLAttributes,
  isValidElement,
  type JSX,
  type ReactNode,
} from 'react';
import type { Components } from 'react-markdown';
import { cx } from 'styled-system/css';

import type { MarkdownRendererHostAdapters } from '@/entities/editor-core';
import type { MarkdownImageViewerItem } from '@/entities/editor-core/model/collect-markdown-images';
import {
  getLinkText,
  getMarkdownLinkRenderMode,
  isEmbedKeyword,
} from '@/shared/lib/markdown/link-embed';
import { getMarkdownColorPreset } from '@/shared/lib/markdown/markdown-color-presets';
import { parseMarkdownInlineDirective } from '@/shared/lib/markdown/markdown-inline-directives';
import {
  markdownBlockquoteClass,
  markdownCodeBlockCodeClass,
  markdownCodeBlockFrameClass,
  markdownCodeBlockHeaderClass,
  markdownCodeBlockLanguageClass,
  markdownCodeBlockPreClass,
  markdownColoredTextClass,
  markdownH1Class,
  markdownH2Class,
  markdownH3Class,
  markdownH4Class,
  markdownHighlightedTextClass,
  markdownHorizontalRuleClass,
  markdownImageClass,
  markdownInlineCodeClass,
  markdownLinkClass,
  markdownListItemClass,
  markdownOrderedListClass,
  markdownParagraphClass,
  markdownTableClass,
  markdownTableScrollClass,
  markdownTrafficLightClass,
  markdownTrafficLightGreenClass,
  markdownTrafficLightRedClass,
  markdownTrafficLightRowClass,
  markdownTrafficLightYellowClass,
  markdownUnderlineClass,
  markdownUnorderedListClass,
} from '@/shared/lib/markdown/markdown-styles.panda';
import { normalizeHttpUrl } from '@/shared/lib/url/normalize-http-url';
import { LinkEmbedCard } from '@/shared/ui/markdown/link-embed-card';
import { MarkdownImage } from '@/shared/ui/markdown/markdown-image';
import { MarkdownMath } from '@/shared/ui/markdown/markdown-math';
import { MarkdownMermaid } from '@/shared/ui/markdown/markdown-mermaid';
import { MarkdownSpoilerButton } from '@/shared/ui/markdown/markdown-spoiler-button';

export type MarkdownViewerConfig = {
  adapters?: MarkdownRendererHostAdapters;
  items?: MarkdownImageViewerItem[];
};

/**
 * Checks whether a URL points to an external destination.
 */
const isExternalHref = (href?: string) => Boolean(href && /^https?:\/\//.test(href));

/**
 * Extracts a display language label from a code block node.
 */
const getCodeBlockLanguage = (children: ReactNode) => {
  const firstChild = Children.toArray(children)[0];
  if (!isValidElement<JSX.IntrinsicElements['code']>(firstChild)) return 'text';

  const codeProps = firstChild.props as JSX.IntrinsicElements['code'] & Record<string, unknown>;
  const language = codeProps['data-language'];
  if (typeof language === 'string' && language.length > 0) return language;

  const className = codeProps.className;
  if (typeof className !== 'string') return 'text';

  return className.replace('language-', '') || 'text';
};

/**
 * Creates an accessibility label for a scrollable code block.
 */
const getCodeBlockAriaLabel = (children: ReactNode) =>
  `Code block: ${getCodeBlockLanguage(children)}`;

/**
 * Collects the raw code string from nested code block children.
 */
const getCodeBlockText = (children: ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  if (Array.isArray(children)) return children.map(getCodeBlockText).join('');
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return getCodeBlockText(children.props.children);
  }

  return '';
};

/**
 * Checks whether the current code node represents a fenced code block.
 */
const isBlockCode = ({
  className,
  node,
  props,
}: {
  className?: string;
  node?: { meta?: string | null; properties?: Record<string, unknown> } | null;
  props?: Record<string, unknown>;
}) => {
  if (className && className.length > 0) return true;

  const rawStyle = props?.style ?? node?.properties?.style;
  const styleText =
    typeof rawStyle === 'string'
      ? rawStyle
      : rawStyle && typeof rawStyle === 'object'
        ? Object.entries(rawStyle)
            .map(([key, value]) => `${key}:${String(value)}`)
            .join(';')
        : '';
  const dataMeta = props?.['data-meta'] ?? props?.['dataMeta'] ?? node?.properties?.['data-meta'];

  return Boolean(
    /display\s*:\s*grid/i.test(styleText) ||
    (typeof dataMeta === 'string' && dataMeta.length > 0) ||
    (typeof node?.meta === 'string' && node.meta.length > 0),
  );
};

/**
 * Renders markdown images as responsive viewer triggers.
 */
const renderMarkdownImage = ({
  alt,
  imageIndex,
  imageViewerLabels,
  src,
  viewerItems,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & {
  imageIndex?: number;
  imageViewerLabels?: MarkdownRendererHostAdapters['imageViewerLabels'];
  viewerItems?: MarkdownImageViewerItem[];
}) => {
  const resolvedAlt = alt ?? '';
  const resolvedImageIndex = imageIndex ?? 0;

  return (
    <MarkdownImage
      alt={resolvedAlt}
      className={markdownImageClass}
      imageIndex={resolvedImageIndex}
      imageViewerLabels={imageViewerLabels}
      src={src}
      viewerItems={viewerItems}
      {...props}
    />
  );
};

/**
 * Resolves the matching viewer item index without relying on render-time mutation.
 */
const resolveMarkdownImageIndex = ({
  sourceOffset,
  src,
  viewerItems,
}: {
  sourceOffset?: number;
  src?: string;
  viewerItems: MarkdownImageViewerItem[];
}) => {
  const resolvedSrc = typeof src === 'string' ? src.trim() : '';

  if (!resolvedSrc) return undefined;

  if (typeof sourceOffset === 'number') {
    const sourceOffsetMatchIndex = viewerItems.findIndex(
      item => item.src === resolvedSrc && item.sourceOffset === sourceOffset,
    );

    if (sourceOffsetMatchIndex >= 0) return sourceOffsetMatchIndex;
  }

  const firstSrcMatchIndex = viewerItems.findIndex(item => item.src === resolvedSrc);

  return firstSrcMatchIndex >= 0 ? firstSrcMatchIndex : undefined;
};

/**
 * Maps Markdown AST nodes to the service-specific React components.
 */
export const createMarkdownComponents = ({
  adapters,
  items = [],
}: MarkdownViewerConfig = {}): Components => {
  const viewerItems = items.filter(item => item.src.trim().length > 0);

  return {
    a: ({ href, children, title, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const inlineDirective = parseMarkdownInlineDirective(href);

      if (inlineDirective?.type === 'color') {
        const preset = getMarkdownColorPreset(inlineDirective.value);

        return (
          <span
            className={markdownColoredTextClass}
            style={{ color: preset?.textColor ?? inlineDirective.value }}
          >
            {children}
          </span>
        );
      }

      if (inlineDirective?.type === 'background') {
        const preset = getMarkdownColorPreset(inlineDirective.value);

        return (
          <span
            className={markdownHighlightedTextClass}
            style={{
              backgroundColor: preset?.softBackgroundColor ?? `${inlineDirective.value}29`,
            }}
          >
            {children}
          </span>
        );
      }

      if (inlineDirective?.type === 'style') {
        const textPreset = inlineDirective.color
          ? getMarkdownColorPreset(inlineDirective.color)
          : null;
        const backgroundPreset = inlineDirective.background
          ? getMarkdownColorPreset(inlineDirective.background)
          : null;

        return (
          <span
            className={cx(
              inlineDirective.background ? markdownHighlightedTextClass : undefined,
              inlineDirective.color ? markdownColoredTextClass : undefined,
            )}
            style={{
              backgroundColor: inlineDirective.background
                ? (backgroundPreset?.softBackgroundColor ?? `${inlineDirective.background}29`)
                : undefined,
              color: inlineDirective.color
                ? (textPreset?.textColor ?? inlineDirective.color)
                : undefined,
            }}
          >
            {children}
          </span>
        );
      }

      if (inlineDirective?.type === 'spoiler') {
        return <MarkdownSpoilerButton>{children}</MarkdownSpoilerButton>;
      }

      if (inlineDirective?.type === 'underline') {
        return <u className={markdownUnderlineClass}>{children}</u>;
      }

      if (inlineDirective?.type === 'math') {
        return <MarkdownMath formula={inlineDirective.formula} />;
      }

      const normalizedHref = normalizeHttpUrl(href);
      const linkText = getLinkText(children);
      const renderMode = isEmbedKeyword(children) ? 'embed' : getMarkdownLinkRenderMode(title);

      if (normalizedHref && renderMode === 'preview') {
        return (
          <LinkEmbedCard
            fallbackLabel={linkText || normalizedHref}
            fetchLinkPreviewMeta={adapters?.fetchLinkPreviewMeta}
            url={normalizedHref}
            variant="preview"
          />
        );
      }

      if (normalizedHref && (renderMode === 'card' || renderMode === 'embed')) {
        return (
          <LinkEmbedCard
            fallbackLabel={renderMode === 'embed' ? normalizedHref : linkText || normalizedHref}
            fetchLinkPreviewMeta={adapters?.fetchLinkPreviewMeta}
            url={normalizedHref}
            variant="card"
          />
        );
      }

      return (
        <a
          href={href}
          className={markdownLinkClass}
          rel={isExternalHref(href) ? 'noreferrer noopener' : undefined}
          target={isExternalHref(href) ? '_blank' : undefined}
          title={title}
          {...props}
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className={markdownBlockquoteClass}>{children}</blockquote>
    ),
    code: ({ children, className, node, style, ...props }) => {
      const codeProps = {
        ...props,
        style,
      };

      if (isBlockCode({ className, node, props: codeProps })) {
        return (
          <code
            className={cx(markdownCodeBlockCodeClass, className)}
            style={style as React.CSSProperties | undefined}
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code className={cx(markdownInlineCodeClass, className)} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className={markdownH1Class}>{children}</h1>,
    h2: ({ children }) => <h2 className={markdownH2Class}>{children}</h2>,
    h3: ({ children }) => <h3 className={markdownH3Class}>{children}</h3>,
    h4: ({ children }) => <h4 className={markdownH4Class}>{children}</h4>,
    hr: () => <hr className={markdownHorizontalRuleClass} />,
    img: ({ alt, node, src, ...props }) =>
      renderMarkdownImage({
        ...props,
        alt,
        imageIndex: resolveMarkdownImageIndex({
          sourceOffset:
            typeof node?.position?.start?.offset === 'number'
              ? node.position.start.offset
              : undefined,
          src,
          viewerItems,
        }),
        imageViewerLabels: adapters?.imageViewerLabels,
        src,
        viewerItems,
      }),
    li: ({ children, className, ...props }) => (
      <li className={cx(markdownListItemClass, className)} {...props}>
        {children}
      </li>
    ),
    ol: ({ children, className, ...props }) => (
      <ol className={cx(markdownOrderedListClass, className)} {...props}>
        {children}
      </ol>
    ),
    p: ({ children, className, ...props }) => (
      <p className={cx(markdownParagraphClass, className)} {...props}>
        {children}
      </p>
    ),
    pre: ({ children, className, ...props }) =>
      getCodeBlockLanguage(children) === 'mermaid' ? (
        <MarkdownMermaid chart={getCodeBlockText(children).trim()} />
      ) : (
        <div className={markdownCodeBlockFrameClass}>
          <div className={markdownCodeBlockHeaderClass}>
            <div aria-hidden className={markdownTrafficLightRowClass}>
              <span className={cx(markdownTrafficLightClass, markdownTrafficLightRedClass)} />
              <span className={cx(markdownTrafficLightClass, markdownTrafficLightYellowClass)} />
              <span className={cx(markdownTrafficLightClass, markdownTrafficLightGreenClass)} />
            </div>
            <span className={markdownCodeBlockLanguageClass}>{getCodeBlockLanguage(children)}</span>
          </div>
          <pre
            aria-label={getCodeBlockAriaLabel(children)}
            className={
              className ? `${markdownCodeBlockPreClass} ${className}` : markdownCodeBlockPreClass
            }
            tabIndex={0}
            {...props}
          >
            {children}
          </pre>
        </div>
      ),
    table: ({ children }) => (
      <div aria-label="Markdown table" className={markdownTableScrollClass} tabIndex={0}>
        <table className={markdownTableClass}>{children}</table>
      </div>
    ),
    th: ({ children, className, ...props }) => (
      <th className={className} suppressHydrationWarning {...props}>
        {children}
      </th>
    ),
    ul: ({ children, className, ...props }) => (
      <ul className={cx(markdownUnorderedListClass, className)} {...props}>
        {children}
      </ul>
    ),
  };
};
