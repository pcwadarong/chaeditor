import type { MarkdownEditorHostAdapters } from '@/react';

/**
 * Storybook reference 스토리에서 공통으로 쓰는 in-memory adapter와 모드 요약을 정의합니다.
 */

const imageLibrary = [
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/45790887-356d-48fd-bf23-6a761d4be524-230805000132660005.jpg',
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/9f5108c5-3d52-49b2-ac29-da15fbbc1dee-135.jpg',
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/e9332863-9d66-4cd5-8368-79382845162a-010.jpg',
] as const;

const videoDemoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

let uploadImageCallCount = 0;
let uploadFileCallCount = 0;
let uploadVideoCallCount = 0;

export type StorybookAdapterMode = 'custom' | 'full' | 'none';

type StorybookModeSummary = {
  description: string;
  items: Array<{ label: string; value: string }>;
  title: string;
};

/**
 * 지정한 시간만큼 비동기 대기합니다.
 */
const wait = (durationMs: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, durationMs);
  });

/**
 * 데모용 이미지 URL을 순환 방식으로 반환합니다.
 */
const getNextDemoImageUrl = () => {
  const imageUrl = imageLibrary[uploadImageCallCount % imageLibrary.length];
  uploadImageCallCount += 1;

  return imageUrl;
};

/**
 * Storybook reference 스토리에서 사용하는 기본 mock host adapter 세트를 생성합니다.
 */
export const createStorybookAdapters = (): MarkdownEditorHostAdapters => ({
  fetchLinkPreviewMeta: async url => {
    await wait(120);

    return {
      description:
        'A host-provided link preview adapter can enrich markdown links without coupling the package to one API.',
      favicon: 'https://www.google.com/s2/favicons?domain=chaeditor.dev&sz=64',
      image: imageLibrary[0],
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

    return `${videoDemoUrl}?v=${uploadVideoCallCount}&name=${encodeURIComponent(file.name || 'video.mp4')}`;
  },
});

/**
 * 기본 adapter 계약은 유지하면서 더 눈에 띄는 override를 보여주는 커스텀 adapter 세트를 생성합니다.
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
        image: imageLibrary[2],
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
          background:
            'linear-gradient(135deg, rgba(30,64,175,0.18), rgba(14,116,144,0.18), rgba(20,184,166,0.18))',
          borderRadius: 16,
          display: 'block',
          inset: fill ? 0 : undefined,
          padding: 6,
          position: fill ? 'absolute' : 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={alt}
          src={typeof src === 'string' ? src : src.src}
          style={{
            borderRadius: 12,
            display: 'block',
            height: '100%',
            objectFit: 'cover',
            width: '100%',
          }}
        />
      </span>
    ),
  };
};

/**
 * reference 스토리에서 사용할 adapter 세트를 모드에 따라 선택합니다.
 */
export const createStorybookAdapterSet = (
  mode: StorybookAdapterMode,
): MarkdownEditorHostAdapters | undefined => {
  if (mode === 'none') return undefined;
  return mode === 'custom' ? createCustomStorybookAdapters() : createStorybookAdapters();
};

/**
 * 현재 adapter 모드가 surface에 주는 영향을 사람이 읽기 쉬운 설명으로 정리합니다.
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
