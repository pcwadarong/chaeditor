import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css, cx } from 'styled-system/css';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import {
  FileEmbedPopover,
  ImageEmbedModal,
  LinkEmbedPopover,
  TextBackgroundColorPopover,
  TextColorPopover,
  VideoEmbedModal,
} from '@/react';
import { RenderImage } from '@/shared/ui/image/render-image';
import { LinkEmbedCard } from '@/shared/ui/markdown';
import {
  createStorybookAdapterSet,
  type StorybookAdapterMode,
} from '@/stories/support/storybook-adapters';
import { customAdapterUsageSnippet } from '@/stories/support/storybook-code-snippets';
import {
  StorybookBulletList,
  StorybookDocsTabBar,
  StorybookGuideList,
  StorybookPageHeader,
} from '@/stories/support/storybook-docs';
import {
  codeBlockClass,
  pageClass,
  StorybookReferenceInvariantSection,
  StorybookReferenceModeSection,
  StorybookSectionCard,
  valuePanelClass,
} from '@/stories/support/storybook-reference-ui';

type EmbedWorkflowsReferenceProps = {
  contentType: EditorContentType;
};

const SAMPLE_LINK_URL = 'https://www.npmjs.com/package/chaeditor';
const SAMPLE_IMAGE_URL =
  'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/45790887-356d-48fd-bf23-6a761d4be524-230805000132660005.jpg';

const MODE_TAB_OPTIONS = [
  { id: 'full', label: 'Default' },
  { id: 'none', label: 'Core only' },
  { id: 'custom', label: 'Custom host adapters' },
] as const satisfies Array<{ id: StorybookAdapterMode; label: string }>;

const getModeSummary = (adapterMode: StorybookAdapterMode) => {
  if (adapterMode === 'none') {
    return {
      description:
        'The helper UI renders using package-owned defaults only. Upload adapters, link-preview metadata, and the host image renderer are all absent. Helpers open but upload-backed actions have no implementation behind them.',
      items: [
        { label: 'Uploads', value: 'No adapter — upload actions disabled' },
        { label: 'Image rendering', value: 'Package default <img> element' },
        { label: 'Link previews', value: 'No host metadata — falls back to plain link' },
        { label: 'Payload log', value: 'Package-side payload shape only' },
      ],
    };
  }

  if (adapterMode === 'custom') {
    return {
      description:
        'A branded host integration is active. The same helper contracts run, but the upload output, image renderer, and link-preview card are all produced by custom host adapters. Useful for verifying that contract shape does not change when the host swaps implementations.',
      items: [
        { label: 'Uploads', value: 'Custom host adapters with branded output' },
        { label: 'Image rendering', value: 'Custom host renderImage override' },
        { label: 'Link previews', value: 'Custom host metadata payload' },
        { label: 'Payload log', value: 'Same contract shape, branded output values' },
      ],
    };
  }

  return {
    description:
      'Default in-memory Storybook adapters are connected. Every authoring flow can be exercised without a real backend: images upload to demo URLs, files return mock metadata, video upload simulates progress, and link previews resolve from a local fixture.',
    items: [
      { label: 'Uploads', value: 'Mock image, file, and video adapters enabled' },
      { label: 'Image rendering', value: 'Host renderImage mock active' },
      { label: 'Link previews', value: 'Mock metadata card from local fixture' },
      { label: 'Payload log', value: 'Full contract payload from each mock adapter' },
    ],
  };
};

const EmbedWorkflowsReference = ({ contentType }: EmbedWorkflowsReferenceProps) => {
  const [adapterMode, setAdapterMode] = React.useState<StorybookAdapterMode>('full');
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);
  const modeSummary = React.useMemo(() => getModeSummary(adapterMode), [adapterMode]);
  const [events, setEvents] = React.useState<string[]>([]);

  const appendEvent = (label: string, value: unknown) => {
    setEvents(current => [`${label}\n${JSON.stringify(value, null, 2)}`, ...current].slice(0, 6));
  };

  return (
    <main className={pageClass}>
      <StorybookPageHeader
        title="Inspect helper flows before you connect them to real storage and preview APIs"
        description="Use this page when you need to review the package helper surfaces in isolation: image, file, video, link, and text color flows. The variants let you compare package-only behavior, the default connected mock, and a branded host integration while verifying the payload contract each helper emits."
      />

      <section className={modeTabSectionClass}>
        <StorybookDocsTabBar
          current={adapterMode}
          onSelect={setAdapterMode}
          options={MODE_TAB_OPTIONS}
        />
      </section>

      <StorybookReferenceModeSection
        description={modeSummary.description}
        eyebrow="Adapter mode"
        items={modeSummary.items}
        title="Current adapter mode"
      />

      <StorybookSectionCard
        description="The three areas below change visually when you switch adapter modes using the controls at the top of the page. Each panel shows the same contract surface under different integration conditions."
        eyebrow="Adapter surface"
        title="How adapters change the surface"
      >
        <StorybookGuideList
          items={[
            {
              eyebrow: 'Uploads',
              title: 'How file-backed helper flows behave',
              media: (
                <div className={specimenChipRowClass}>
                  <span
                    className={
                      adapterMode === 'none' ? statusChipMutedClass : statusChipPositiveClass
                    }
                  >
                    {adapterMode === 'none' ? 'No upload adapters' : 'Upload adapters active'}
                  </span>
                  {adapterMode === 'custom' ? (
                    <span className={statusChipCustomClass}>Custom host output</span>
                  ) : null}
                </div>
              ),
              body:
                adapterMode === 'none'
                  ? 'Helpers open normally. Upload-backed actions are unavailable because no host adapter is connected to handle the file transfer.'
                  : adapterMode === 'custom'
                    ? 'Uploads are enabled and the resulting URLs or attachment metadata come from the custom host adapter, not the default mock.'
                    : 'Uploads are enabled. Image, file, and video adapters return predictable in-memory values so the full flow can be exercised without a real server.',
            },
            {
              eyebrow: 'Image rendering',
              title: 'How host image rendering changes the surface',
              media: (
                <div className={imagePreviewMediaClass}>
                  <div className={imagePreviewFrameClass}>
                    <RenderImage
                      alt="Host integration preview"
                      className={imagePreviewClass}
                      renderImage={adapters?.renderImage}
                      src={SAMPLE_IMAGE_URL}
                    />
                  </div>
                </div>
              ),
              body:
                adapterMode === 'custom'
                  ? 'The custom host adapter wraps the same src in a branded frame. The image contract — src, alt, className, fill — stays unchanged.'
                  : adapterMode === 'full'
                    ? 'The default host adapter passes src through a plain <img> element. The image contract is satisfied without altering the shell.'
                    : 'Without a renderImage adapter, the package falls back to its own <img>-based renderer. The contract is still fulfilled, just by the package default.',
            },
            {
              eyebrow: 'Link previews',
              title: 'How preview metadata changes rendered cards',
              media: (
                <div className={linkPreviewMediaClass}>
                  <LinkEmbedCard
                    fallbackLabel="Getting started"
                    fetchLinkPreviewMeta={adapters?.fetchLinkPreviewMeta}
                    url={SAMPLE_LINK_URL}
                    variant="card"
                  />
                </div>
              ),
              body:
                adapterMode === 'none'
                  ? 'No fetchLinkPreviewMeta adapter is connected. The preview card falls back to a plain external link.'
                  : adapterMode === 'custom'
                    ? 'A custom metadata payload drives the preview card. The card structure stays the same — only the data changes.'
                    : 'A local fixture produces the metadata. The preview card renders the same way it would in a real host integration.',
            },
          ]}
        />
      </StorybookSectionCard>

      <StorybookSectionCard
        description="Open any helper to complete an authoring flow. The payload log below captures the exact onApply value the editor would pass back to your host integration."
        eyebrow="Interactive flows"
        title="Live helper surface"
      >
        <div className={helperGroupClass}>
          <div className={helperSurfaceClass}>
            <div className={helperGroupRowClass}>
              <div className={helperItemClass}>
                <ImageEmbedModal
                  contentType={contentType}
                  onApply={payload => appendEvent('ImageEmbedModal', payload)}
                  onUploadImage={adapters?.uploadImage}
                  renderImage={adapters?.renderImage}
                />
              </div>
              <div className={helperItemClass}>
                <FileEmbedPopover
                  contentType={contentType}
                  onApply={payload => appendEvent('FileEmbedPopover', payload)}
                  onUploadFile={adapters?.uploadFile}
                />
              </div>
              <div className={helperItemClass}>
                <VideoEmbedModal
                  contentType={contentType}
                  onApply={payload => appendEvent('VideoEmbedModal', payload)}
                  onUploadVideo={adapters?.uploadVideo}
                />
              </div>
              <div className={helperItemClass}>
                <LinkEmbedPopover
                  onApply={(url, mode) => appendEvent('LinkEmbedPopover', { mode, url })}
                />
              </div>
              <div className={helperItemClass}>
                <TextColorPopover onApply={color => appendEvent('TextColorPopover', { color })} />
              </div>
              <div className={helperItemClass}>
                <TextBackgroundColorPopover
                  onApply={color => appendEvent('TextBackgroundColorPopover', { color })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={valuePanelClass}>
          <div className={payloadHeaderClass}>
            <p className={payloadTitleClass}>Host callback payload log</p>
            <StorybookBulletList
              items={[
                <>
                  Each entry below shows the exact value passed to the{' '}
                  <code className={payloadInlineCodeClass}>onApply</code> callback when you complete
                  a helper flow.
                </>,
                'This is the payload contract your host integration receives.',
              ]}
            />
          </div>
          {events.length > 0 ? (
            <div className={eventListClass}>
              {events.map(event => (
                <pre className={codeBlockClass} key={event}>
                  {event}
                </pre>
              ))}
            </div>
          ) : (
            <p className={emptyStateClass}>
              No payloads yet. Open a helper above, complete the flow, and the emitted value will
              appear here.
            </p>
          )}
        </div>
      </StorybookSectionCard>

      <StorybookReferenceInvariantSection
        eyebrow="Invariant contract"
        description="Switching adapter modes changes what the helper can do, but the following properties stay constant across all three modes."
        items={[
          'Helper entrypoints and toolbar order remain identical',
          'The onApply payload contract shape is stable regardless of adapter mode',
          'Package-owned helper UI structure and interaction patterns are unchanged',
        ]}
      />
    </main>
  );
};

const meta = {
  argTypes: {
    contentType: {
      control: 'inline-radio',
      options: ['article', 'project', 'resume'],
    },
  },
  args: {
    contentType: 'article',
  },
  component: EmbedWorkflowsReference,
  parameters: {
    docs: {
      source: {
        code: customAdapterUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Reference/EmbedWorkflows',
} satisfies Meta<typeof EmbedWorkflowsReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Layout ──────────────────────────────────────────────────────────────────

const specimenChipRowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
});

const statusChipBaseClass = css({
  alignItems: 'center',
  borderRadius: 'full',
  display: 'inline-flex',
  fontSize: 'xs',
  fontWeight: 'semibold',
  minHeight: '7',
  px: '2.5',
});

const statusChipPositiveClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: '[rgba(34,197,94,0.10)]',
    color: 'success',
  }),
);

const statusChipMutedClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: 'surfaceStrong',
    color: 'textSubtle',
  }),
);

const statusChipCustomClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: 'primarySubtle',
    color: 'primary',
  }),
);

const imagePreviewFrameClass = css({
  backgroundColor: 'surfaceMuted',
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'xl',
  minHeight: '24',
  overflow: 'hidden',
  width: '[9rem]',
});

const imagePreviewClass = css({
  display: 'block',
  height: '24',
  objectFit: 'cover',
  width: 'full',
});

const imagePreviewMediaClass = css({
  display: 'flex',
  gap: '4',
});

const linkPreviewMediaClass = css({
  display: 'grid',
  width: 'full',
});

const helperGroupClass = css({
  display: 'grid',
  gap: '10',
});

const modeTabSectionClass = css({
  marginTop: '8',
  marginBottom: '10',
});

const helperSurfaceClass = css({
  display: 'grid',
  gap: '6',
  paddingTop: '4',
});

const helperItemClass = css({
  display: 'grid',
  placeItems: 'center',
});

const helperGroupRowClass = css({
  alignItems: 'flex-end',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10',
});

const payloadHeaderClass = css({
  display: 'grid',
  gap: '4',
  paddingTop: '2',
});

const payloadTitleClass = css({
  color: 'text',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const payloadInlineCodeClass = css({
  backgroundColor: 'surfaceMuted',
  borderRadius: 'sm',
  color: 'text',
  fontFamily: 'mono',
  fontSize: 'xs',
  paddingInline: '1',
  paddingY: '0.5',
});

const eventListClass = css({
  display: 'grid',
  gap: '4',
  paddingTop: '2',
});

const emptyStateClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  fontStyle: 'italic',
  lineHeight: 'relaxed',
  paddingTop: '2',
});
