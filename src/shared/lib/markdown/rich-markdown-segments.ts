import type { ReactNode } from 'react';

import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';

type MarkdownFragmentRenderer = (markdown: string, key: string) => ReactNode;

type ToggleHeadingLevel = 1 | 2 | 3 | 4 | null;

export type MarkdownSegment =
  | {
      markdown: string;
      type: 'markdown';
    }
  | {
      align: 'center' | 'left' | 'right';
      content: string;
      type: 'align';
    }
  | {
      content: string;
      type: 'subtext';
    }
  | {
      content: string;
      headingLevel: ToggleHeadingLevel;
      title: string;
      type: 'toggle';
    }
  | {
      contentType?: string;
      fileName: string;
      fileSize?: number;
      href: string;
      type: 'attachment';
    }
  | {
      formula: string;
      isBlock: boolean;
      type: 'math';
    }
  | {
      items: ReturnType<typeof collectMarkdownImages>;
      type: 'gallery';
    }
  | {
      provider: 'upload' | 'youtube';
      src?: string;
      type: 'video';
      videoId?: string;
    };

export type RichMarkdownRenderArgs = {
  markdown: string;
  renderMarkdownFragment: MarkdownFragmentRenderer;
};

type FenceState = {
  delimiter: '`' | '~';
  size: number;
} | null;

const toggleStartPrefix = ':::toggle ';
const galleryStartPattern = /^:::gallery\s*$/;
const alignStartPattern = /^:::align (left|center|right)\s*$/;
const legacyYoutubePattern = /^<YouTube id="([^"]+)" \/>$/;
const videoPattern = /^<Video provider="([^"]+)"(?: id="([^"]+)")?(?: src="([^"]+)")? \/>$/;
const attachmentPattern =
  /^<Attachment href="([^"]+)" name="([^"]+)"(?: size="(\d+)")?(?: type="([^"]+)")? \/>$/;
const mathPattern = /^<Math(?: block="(true)")?>([\s\S]+?)<\/Math>$/;
const subtextPrefix = '-# ';
const fenceBoundaryPattern = /^\s*(`{3,}|~{3,})/;

/**
 * Restores HTML entities escaped inside custom tag attributes.
 *
 * @param value Raw attribute value.
 * @returns A decoded string.
 */
export const decodeHtmlAttributeEntities = (value: string) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

/**
 * Detects whether the current line opens or closes a fenced code block.
 *
 * @param line Current markdown line.
 * @param activeFence Active fence state.
 * @returns Fence metadata or null.
 */
const getFenceBoundary = (line: string, activeFence: FenceState) => {
  const match = line.match(fenceBoundaryPattern);

  if (!match) return null;

  const delimiter = match[1][0] as '`' | '~';
  const size = match[1].length;

  if (!activeFence) {
    return {
      delimiter,
      size,
    };
  }

  if (activeFence.delimiter !== delimiter || size < activeFence.size) {
    return null;
  }

  return {
    delimiter,
    size,
  };
};

/**
 * Splits a toggle title into heading level metadata and visible text.
 *
 * @param rawTitle Raw title text after the toggle marker.
 * @returns Parsed heading level and title.
 */
export const parseToggleTitle = (rawTitle: string) => {
  const trimmedTitle = rawTitle.trim();
  const headingMatch = trimmedTitle.match(/^(#{1,4})(?:\s+(.*))?$/);
  const fallbackTitle = 'Untitled toggle';

  if (!trimmedTitle) {
    return {
      headingLevel: null,
      title: fallbackTitle,
    };
  }

  if (!headingMatch) {
    return {
      headingLevel: null,
      title: trimmedTitle || fallbackTitle,
    };
  }

  return {
    headingLevel: headingMatch[1].length as ToggleHeadingLevel,
    title: headingMatch[2]?.trim() || fallbackTitle,
  };
};

/**
 * Consumes a custom block body while ignoring closing markers inside fenced code blocks.
 *
 * @param lines Full markdown line list.
 * @param startIndex First body line index.
 * @returns Body lines and the closing cursor position.
 */
const consumeCustomBlockBody = (lines: string[], startIndex: number) => {
  const bodyLines: string[] = [];
  let activeFence: FenceState = null;
  let cursor = startIndex;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const fenceBoundary = getFenceBoundary(line, activeFence);

    if (fenceBoundary) {
      bodyLines.push(line);
      activeFence = activeFence ? null : fenceBoundary;
      cursor += 1;
      continue;
    }

    if (!activeFence && line === ':::') {
      break;
    }

    bodyLines.push(line);
    cursor += 1;
  }

  return {
    bodyLines,
    cursor,
  };
};

/**
 * Splits markdown into plain fragments and custom block segments.
 *
 * @param markdown Raw markdown string that may contain custom syntax.
 * @returns Parsed segment list for rendering.
 */
export const parseRichMarkdownSegments = (markdown: string): MarkdownSegment[] => {
  const lines = markdown.split('\n');
  const segments: MarkdownSegment[] = [];
  const currentMarkdownLines: string[] = [];
  let activeFence: FenceState = null;

  /**
   * Flushes accumulated plain markdown into a single segment.
   */
  const flushMarkdown = () => {
    if (currentMarkdownLines.length === 0) return;

    segments.push({
      markdown: currentMarkdownLines.join('\n'),
      type: 'markdown',
    });
    currentMarkdownLines.length = 0;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceBoundary = getFenceBoundary(line, activeFence);

    if (fenceBoundary) {
      currentMarkdownLines.push(line);
      activeFence = activeFence ? null : fenceBoundary;
      continue;
    }

    if (activeFence) {
      currentMarkdownLines.push(line);
      continue;
    }

    if (line.startsWith(toggleStartPrefix)) {
      flushMarkdown();
      const { bodyLines, cursor } = consumeCustomBlockBody(lines, index + 1);

      const { headingLevel, title } = parseToggleTitle(line.slice(toggleStartPrefix.length));

      segments.push({
        content: bodyLines.join('\n'),
        headingLevel,
        title,
        type: 'toggle',
      });

      index = cursor;
      continue;
    }

    const alignMatch = line.match(alignStartPattern);

    if (alignMatch) {
      flushMarkdown();
      const { bodyLines, cursor } = consumeCustomBlockBody(lines, index + 1);

      segments.push({
        align: alignMatch[1] as 'center' | 'left' | 'right',
        content: bodyLines.join('\n'),
        type: 'align',
      });

      index = cursor;
      continue;
    }

    if (galleryStartPattern.test(line)) {
      flushMarkdown();
      const { bodyLines, cursor } = consumeCustomBlockBody(lines, index + 1);

      segments.push({
        items: collectMarkdownImages(bodyLines.join('\n')),
        type: 'gallery',
      });

      index = cursor;
      continue;
    }

    const videoMatch = line.match(videoPattern);

    if (videoMatch && (videoMatch[1] === 'youtube' || videoMatch[1] === 'upload')) {
      flushMarkdown();
      segments.push({
        provider: videoMatch[1],
        src: videoMatch[3] ? decodeHtmlAttributeEntities(videoMatch[3]) : undefined,
        type: 'video',
        videoId: videoMatch[2] ? decodeHtmlAttributeEntities(videoMatch[2]) : undefined,
      });
      continue;
    }

    const legacyYoutubeMatch = line.match(legacyYoutubePattern);

    if (legacyYoutubeMatch) {
      flushMarkdown();
      segments.push({
        provider: 'youtube',
        type: 'video',
        videoId: decodeHtmlAttributeEntities(legacyYoutubeMatch[1]),
      });
      continue;
    }

    const attachmentMatch = line.match(attachmentPattern);

    if (attachmentMatch) {
      flushMarkdown();
      segments.push({
        contentType: attachmentMatch[4]
          ? decodeHtmlAttributeEntities(attachmentMatch[4])
          : undefined,
        fileName: decodeHtmlAttributeEntities(attachmentMatch[2]),
        fileSize: attachmentMatch[3] ? Number(attachmentMatch[3]) : undefined,
        href: decodeHtmlAttributeEntities(attachmentMatch[1]),
        type: 'attachment',
      });
      continue;
    }

    const mathMatch = line.match(mathPattern);

    if (mathMatch) {
      flushMarkdown();
      segments.push({
        formula: mathMatch[2],
        isBlock: mathMatch[1] === 'true',
        type: 'math',
      });
      continue;
    }

    if (line.startsWith(subtextPrefix)) {
      flushMarkdown();

      const subtextLines = [line.slice(subtextPrefix.length)];
      let cursor = index + 1;

      while (cursor < lines.length && lines[cursor].startsWith(subtextPrefix)) {
        subtextLines.push(lines[cursor].slice(subtextPrefix.length));
        cursor += 1;
      }

      segments.push({
        content: subtextLines.join('\n'),
        type: 'subtext',
      });

      index = cursor - 1;
      continue;
    }

    currentMarkdownLines.push(line);
  }

  flushMarkdown();

  return segments;
};
