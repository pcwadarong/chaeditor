import { Children, type ReactNode } from 'react';

import { normalizeHttpUrl } from '@/shared/lib/url/normalize-http-url';

export type MarkdownLinkRenderMode = 'card' | 'embed' | 'link' | 'noembed' | 'preview';

export type LinkEmbedData = {
  description: string;
  favicon: string | null;
  image: string | null;
  siteName: string;
  title: string;
  url: string;
};

type HtmlAttributeMap = Record<string, string>;

/**
 * Extracts HTML attributes into a key-value map.
 */
const extractHtmlAttributes = (tag: string): HtmlAttributeMap => {
  const attributes: HtmlAttributeMap = {};

  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*["']([^"']*)["']/giu)) {
    const [, key, value] = match;
    if (!key) continue;

    attributes[key.toLowerCase()] = value.trim();
  }

  return attributes;
};

/**
 * Finds a matching `content` value from HTML meta tags.
 */
const findMetaContent = (html: string, matcher: (attributes: HtmlAttributeMap) => boolean) => {
  for (const match of html.matchAll(/<meta\b[^>]*>/giu)) {
    const tag = match[0];
    if (!tag) continue;

    const attributes = extractHtmlAttributes(tag);
    if (matcher(attributes) && attributes.content) {
      return attributes.content;
    }
  }

  return '';
};

/**
 * Finds a matching `href` value from HTML link tags.
 */
const findLinkHref = (html: string, matcher: (attributes: HtmlAttributeMap) => boolean) => {
  for (const match of html.matchAll(/<link\b[^>]*>/giu)) {
    const tag = match[0];
    if (!tag) continue;

    const attributes = extractHtmlAttributes(tag);
    if (matcher(attributes) && attributes.href) {
      return attributes.href;
    }
  }

  return '';
};

/**
 * Checks whether markdown link text uses an embed keyword.
 */
export const isEmbedKeyword = (children: ReactNode) => {
  const text = Children.toArray(children)
    .map(child => (typeof child === 'string' ? child : ''))
    .join('')
    .trim()
    .toLowerCase();

  return text === 'embed';
};

/**
 * Extracts the display label from markdown link children.
 */
export const getLinkText = (children: ReactNode) =>
  Children.toArray(children)
    .map(child => (typeof child === 'string' ? child : ''))
    .join('')
    .trim();

/**
 * Resolves the link render mode from the markdown link title attribute.
 */
export const getMarkdownLinkRenderMode = (
  title: string | null | undefined,
): MarkdownLinkRenderMode => {
  if (title === 'preview') return 'preview';
  if (title === 'card') return 'card';
  if (title === 'embed') return 'embed';
  if (title === 'noembed') return 'noembed';

  return 'link';
};

/**
 * Checks whether the metadata is too sparse for an embed card.
 */
export const shouldFallbackToPlainLink = (data: LinkEmbedData) =>
  data.title === data.url &&
  data.description.length === 0 &&
  data.image === null &&
  data.favicon === null;

/**
 * Normalizes a relative or absolute URL into an HTTP(S) absolute URL.
 */
export const resolveEmbedAssetUrl = (baseUrl: string, rawUrl?: string | null) => {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  try {
    const resolved = new URL(trimmed, baseUrl).toString();
    return normalizeHttpUrl(resolved);
  } catch {
    return null;
  }
};

/**
 * Extracts fallback embed metadata from an HTML document.
 */
export const extractEmbedMetaFromHtml = (url: string, html: string): LinkEmbedData => {
  const title =
    findMetaContent(html, attributes => attributes.property === 'og:title') ||
    findMetaContent(html, attributes => attributes.name === 'twitter:title') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/iu)?.[1]?.trim() ||
    url;
  const description =
    findMetaContent(html, attributes => attributes.property === 'og:description') ||
    findMetaContent(html, attributes => attributes.name === 'description') ||
    '';
  const siteName =
    findMetaContent(html, attributes => attributes.property === 'og:site_name') ||
    new URL(url).hostname;
  const image = resolveEmbedAssetUrl(
    url,
    findMetaContent(html, attributes => attributes.property === 'og:image') ||
      findMetaContent(html, attributes => attributes.name === 'twitter:image'),
  );
  const favicon = resolveEmbedAssetUrl(
    url,
    findLinkHref(
      html,
      attributes =>
        typeof attributes.rel === 'string' &&
        /(icon|shortcut icon)/iu.test(attributes.rel.toLowerCase()),
    ),
  );

  return {
    description,
    favicon,
    image,
    siteName,
    title,
    url,
  };
};
