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

export type StorybookAdapterMode = 'custom' | 'full' | 'none';

type StorybookModeSummary = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

type StorybookCompactSummaryProps = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

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
 * Creates a visibly customized adapter set for Storybook override examples.
 */
export const createCustomStorybookAdapters = (): MarkdownEditorHostAdapters => {
  const baseAdapters = createStorybookAdapters();

  return {
    ...baseAdapters,
    fetchLinkPreviewMeta: async url => {
      await wait(90);

      return {
        description: 'Custom host adapter variant used by Storybook to demonstrate overrides.',
        favicon: 'https://www.google.com/s2/favicons?domain=example.com&sz=64',
        image: IMAGE_LIBRARY[2],
        siteName: 'Custom host',
        title: 'Injected preview metadata',
        url,
      };
    },
    imageViewerLabels: {
      ...baseAdapters.imageViewerLabels,
      openAriaLabel: 'Open branded image viewer',
      selectForFrameLabel: 'Use in cover frame',
    },
    renderImage: ({ alt, className, fill = false, src }) => (
      <span
        className={className}
        style={{
          display: 'block',
          position: fill ? 'absolute' : 'relative',
          inset: fill ? 0 : undefined,
          padding: 6,
          borderRadius: 16,
          background:
            'linear-gradient(135deg, rgba(30,64,175,0.18), rgba(14,116,144,0.18), rgba(20,184,166,0.18))',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={alt}
          src={typeof src === 'string' ? src : src.src}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 12,
          }}
        />
      </span>
    ),
  };
};

/**
 * Resolves the Storybook host adapter set for the requested reference mode.
 */
export const createStorybookAdapterSet = (
  mode: StorybookAdapterMode,
): MarkdownEditorHostAdapters | undefined => {
  if (mode === 'none') {
    return undefined;
  }

  return mode === 'custom' ? createCustomStorybookAdapters() : createStorybookAdapters();
};

/**
 * Returns a concise summary of how the current Storybook adapter mode changes the surface.
 */
export const getStorybookModeSummary = (mode: StorybookAdapterMode): StorybookModeSummary => {
  if (mode === 'none') {
    return {
      description:
        'This state keeps the package surface local to the editor shell. Upload adapters, link-preview metadata, and host image overrides are intentionally absent.',
      items: [
        { label: 'Uploads', value: 'Disabled unless the host injects adapters.' },
        { label: 'Link previews', value: 'Fallback to plain links.' },
        { label: 'Images', value: 'Use the package default renderer.' },
        { label: 'Labels', value: 'Use the built-in package labels.' },
      ],
      title: 'Core-only shell',
    };
  }

  if (mode === 'custom') {
    return {
      description:
        'This state shows a host that overrides image rendering, link preview metadata, and viewer labels while keeping the same editor contracts.',
      items: [
        { label: 'Uploads', value: 'Mock adapters with branded output.' },
        { label: 'Link previews', value: 'Custom metadata payload from the host.' },
        { label: 'Images', value: 'Host renderImage override with branded framing.' },
        { label: 'Labels', value: 'Custom viewer labels and story-level toolbar labels.' },
      ],
      title: 'Custom host adapters',
    };
  }

  return {
    description:
      'This state uses the default in-memory Storybook adapters so every authoring flow can be exercised without a real backend.',
    items: [
      { label: 'Uploads', value: 'Mock image, file, and video uploads enabled.' },
      { label: 'Link previews', value: 'Mock metadata cards enabled.' },
      { label: 'Images', value: 'Host renderImage mock enabled.' },
      { label: 'Labels', value: 'Built-in package labels.' },
    ],
    title: 'Host-enabled mock adapters',
  };
};

/**
 * Renders a compact summary block for Storybook reference variants.
 */
export const StorybookCompactSummary = ({
  description,
  items,
  title,
}: StorybookCompactSummaryProps) => (
  <section className={compactSummaryClass}>
    <p className={compactSummaryTitleClass}>{title}</p>
    <p className={compactSummaryDescriptionClass}>{description}</p>
    <dl className={compactSummaryMetaClass}>
      {items.map(item => (
        <div className={compactSummaryMetaItemClass} key={item.label}>
          <dt className={compactSummaryMetaLabelClass}>{item.label}</dt>
          <dd className={compactSummaryMetaValueClass}>{item.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);

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

const compactSummaryClass = css({
  display: 'grid',
  gap: '2',
});

const compactSummaryTitleClass = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  color: 'text',
});

const compactSummaryDescriptionClass = css({
  fontSize: 'sm',
  color: 'textSubtle',
  lineHeight: 'relaxed',
});

const compactSummaryMetaClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: '6',
  rowGap: '2',
});

const compactSummaryMetaItemClass = css({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: '3',
});

const compactSummaryMetaLabelClass = css({
  fontSize: 'xs',
  fontWeight: 'semibold',
  color: 'primary',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const compactSummaryMetaValueClass = css({
  fontSize: 'sm',
  color: 'text',
});
