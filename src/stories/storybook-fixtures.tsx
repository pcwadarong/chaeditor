import React from 'react';
import { css } from 'styled-system/css';

import type { MarkdownEditorHostAdapters } from '@/react';

const IMAGE_LIBRARY = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
] as const;

const VIDEO_DEMO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

let uploadImageCallCount = 0;
let uploadFileCallCount = 0;
let uploadVideoCallCount = 0;

export type StorybookAdapterMode = 'full' | 'none';

/**
 * Sleeps for the given number of milliseconds.
 */
const wait = (durationMs: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, durationMs);
  });

/**
 * Returns a stable demo image URL while cycling through a small library.
 */
const getNextDemoImageUrl = () => {
  const imageUrl = IMAGE_LIBRARY[uploadImageCallCount % IMAGE_LIBRARY.length];
  uploadImageCallCount += 1;

  return imageUrl;
};

/**
 * Creates mock host adapters used by Storybook reference stories.
 *
 * These adapters are intentionally in-memory and demo-oriented. The reference stories do
 * not call the package's default-host network adapters because Storybook should stay
 * self-contained and predictable without a backend.
 */
export const createStorybookAdapters = (): MarkdownEditorHostAdapters => ({
  fetchLinkPreviewMeta: async url => {
    await wait(120);

    return {
      description:
        'A host-provided link preview adapter can enrich markdown links without coupling the package to one API.',
      favicon: 'https://www.google.com/s2/favicons?domain=chaeditor.dev&sz=64',
      image: IMAGE_LIBRARY[0],
      siteName: 'chaeditor.dev',
      title: 'Composable Markdown Editing Toolkit',
      url,
    };
  },
  imageViewerLabels: {
    actionBarAriaLabel: 'Image actions',
    closeAriaLabel: 'Close image viewer',
    fitToScreenAriaLabel: 'Fit image to screen',
    locateSourceAriaLabel: 'Locate source image',
    nextAriaLabel: 'Next image',
    openAriaLabel: 'Open image viewer',
    previousAriaLabel: 'Previous image',
    selectForFrameAriaLabel: 'Select image for frame',
    selectForFrameLabel: 'Select for frame',
    thumbnailListAriaLabel: 'Image thumbnails',
    zoomInAriaLabel: 'Zoom in',
    zoomOutAriaLabel: 'Zoom out',
  },
  renderImage: ({ alt, className, fill = false, src }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      src={typeof src === 'string' ? src : src.src}
      style={
        fill
          ? {
              inset: 0,
              position: 'absolute',
            }
          : undefined
      }
    />
  ),
  resolveAttachmentHref: ({ href }) => href,
  uploadFile: async ({ file }) => {
    uploadFileCallCount += 1;
    await wait(180);

    return {
      contentType: file.type || 'application/pdf',
      fileName: file.name || `document-${uploadFileCallCount}.pdf`,
      fileSize: file.size || 24_576,
      url: `https://cdn.chaeditor.dev/attachments/${encodeURIComponent(file.name || `document-${uploadFileCallCount}.pdf`)}`,
    };
  },
  uploadImage: async ({ file }) => {
    await wait(160);

    return `${getNextDemoImageUrl()}&name=${encodeURIComponent(file.name || 'image.png')}`;
  },
  uploadVideo: async ({ file, onProgress, signal }) => {
    for (const percentage of [20, 48, 76, 100]) {
      if (signal?.aborted) {
        throw new DOMException('The upload was aborted.', 'AbortError');
      }

      onProgress?.(percentage);
      await wait(120);
    }

    uploadVideoCallCount += 1;

    return `${VIDEO_DEMO_URL}?v=${uploadVideoCallCount}&name=${encodeURIComponent(file.name || 'video.mp4')}`;
  },
});

/**
 * Resolves the Storybook host adapter set for the requested reference mode.
 */
export const createStorybookAdapterSet = (
  mode: StorybookAdapterMode,
): MarkdownEditorHostAdapters | undefined => {
  if (mode === 'none') {
    return undefined;
  }

  return createStorybookAdapters();
};

export const sampleMarkdown = [
  '# chaeditor Reference',
  '',
  'A renderer story should cover headings, inline emphasis, and fenced blocks while staying readable.',
  '',
  ':::toggle ## Why this matters',
  'The markdown pipeline supports nested custom blocks and still falls back to regular markdown where possible.',
  ':::',
  '',
  '[Composable link preview](https://chaeditor.dev "card")',
  '',
  '<Attachment href="https://cdn.chaeditor.dev/attachments/reference.pdf" name="reference.pdf" size="24576" type="application/pdf" />',
  '',
  '<Math block="true">a^2 + b^2 = c^2</Math>',
  '',
  ':::gallery',
  `![Authoring surface](${IMAGE_LIBRARY[0]})`,
  `![Preview reference](${IMAGE_LIBRARY[1]})`,
  ':::',
  '',
  '<Video provider="upload" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />',
  '',
  '```mermaid',
  'flowchart LR',
  '  Editor["Editor"] --> Toolbar["Toolbar"]',
  '  Toolbar --> Renderer["Renderer"]',
  '```',
].join('\n');

export const panelClass = css({
  display: 'grid',
  gap: '5',
  p: '6',
  borderRadius: '2xl',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'surface',
  boxShadow: 'sm',
});

export const pageClass = css({
  display: 'grid',
  gap: '6',
  padding: '8',
  bg: 'surface',
});

export const splitLayoutClass = css({
  display: 'grid',
  gap: '6',
  gridTemplateColumns: {
    base: '1fr',
    xl: '[minmax(0,1.2fr)_minmax(18rem,0.8fr)]',
  },
});

export const sectionTitleClass = css({
  fontSize: 'xl',
  fontWeight: 'semibold',
  color: 'text',
});

export const sectionDescriptionClass = css({
  fontSize: 'sm',
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

export const valuePanelClass = css({
  display: 'grid',
  gap: '3',
  p: '4',
  borderRadius: 'xl',
  bg: 'surfaceMuted',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
});

export const codeBlockClass = css({
  display: 'block',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: 'mono',
  fontSize: 'sm',
  lineHeight: 'relaxed',
  color: 'text',
});
