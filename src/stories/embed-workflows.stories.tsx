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
  codeBlockClass,
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  pageClass,
  panelClass,
  sectionTitleClass,
  type StorybookAdapterMode,
  StorybookCheckList,
  StorybookMetaTable,
  StorybookSectionCard,
  StorybookStatusBadge,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type EmbedWorkflowsReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
};

const SAMPLE_LINK_URL = 'https://chaeditor.dev/docs/getting-started';
const SAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

const getEmbedWorkflowSummary = (adapterMode: StorybookAdapterMode) => {
  if (adapterMode === 'none') {
    return {
      description: 'Package-owned helper UI only. No upload, image render, or metadata adapters.',
      items: [
        { label: 'Uploads', value: 'Off' },
        { label: 'Image renderer', value: 'Package default' },
        { label: 'Link previews', value: 'No host metadata' },
        { label: 'Payload log', value: 'Package payload shape only' },
      ],
      title: 'Core-only helper surface',
    };
  }

  if (adapterMode === 'custom') {
    return {
      description:
        'Branded host integration. The same helper contracts run through custom adapters.',
      items: [
        { label: 'Uploads', value: 'Custom host adapters' },
        { label: 'Image renderer', value: 'Branded host shell' },
        { label: 'Link previews', value: 'Custom metadata payload' },
        { label: 'Payload log', value: 'Contract + branded output values' },
      ],
      title: 'Custom host helper integration',
    };
  }

  return {
    description:
      'Mock host integration. This is the baseline “connected product” state for Storybook.',
    items: [
      { label: 'Uploads', value: 'Default mock adapters' },
      { label: 'Image renderer', value: 'Mock host renderer' },
      { label: 'Link previews', value: 'Default mock metadata' },
      { label: 'Payload log', value: 'Contract + mock output values' },
    ],
    title: 'Default helper integration',
  };
};

const EmbedWorkflowsReference = ({ adapterMode, contentType }: EmbedWorkflowsReferenceProps) => {
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);
  const summary = React.useMemo(() => getEmbedWorkflowSummary(adapterMode), [adapterMode]);
  const [events, setEvents] = React.useState<string[]>([]);

  const appendEvent = (label: string, value: unknown) => {
    setEvents(current => [`${label}\n${JSON.stringify(value, null, 2)}`, ...current].slice(0, 6));
  };

  return (
    <main className={pageClass}>
      <StorybookSectionCard description={summary.description} title={summary.title}>
        <StorybookMetaTable items={summary.items} />
      </StorybookSectionCard>
      <StorybookSectionCard
        description="These specimen panels show what actually changes when the same helper contracts run without adapters, with default mock adapters, or through a custom host integration."
        title="Visible integration differences"
      >
        <section className={specimenSectionClass}>
          <div className={specimenCardClass}>
            <p className={specimenLabelClass}>Uploads</p>
            <div className={specimenChipRowClass}>
              <span
                className={adapterMode === 'none' ? statusChipMutedClass : statusChipPositiveClass}
              >
                {adapterMode === 'none' ? 'No upload adapters' : 'Upload adapters active'}
              </span>
              {adapterMode === 'custom' ? (
                <span className={statusChipBrandedClass}>Custom host output</span>
              ) : null}
            </div>
            <p className={specimenBodyClass}>
              {adapterMode === 'none'
                ? 'Helpers still open, but only package-side payload values can be emitted.'
                : adapterMode === 'custom'
                  ? 'Uploads stay enabled and the resulting URLs or metadata are visibly branded by the host adapter.'
                  : 'Uploads stay enabled and return predictable local Storybook mock values.'}
            </p>
          </div>
          <div className={specimenCardClass}>
            <p className={specimenLabelClass}>Image renderer</p>
            <div className={imagePreviewFrameClass}>
              <RenderImage
                alt="Host integration preview"
                className={imagePreviewClass}
                renderImage={adapters?.renderImage}
                src={SAMPLE_IMAGE_URL}
              />
            </div>
            <p className={specimenBodyClass}>
              {adapterMode === 'custom'
                ? 'The custom host adapter wraps the same image contract in a branded frame.'
                : adapterMode === 'full'
                  ? 'The default host adapter keeps the package image contract connected without changing the shell.'
                  : 'Without a host renderer, the package fallback image element is used directly.'}
            </p>
          </div>
          <div className={specimenCardClass}>
            <p className={specimenLabelClass}>Link previews</p>
            <div className={linkPreviewFrameClass}>
              <LinkEmbedCard
                fallbackLabel="Getting started"
                fetchLinkPreviewMeta={adapters?.fetchLinkPreviewMeta}
                url={SAMPLE_LINK_URL}
                variant="card"
              />
            </div>
            <p className={specimenBodyClass}>
              {adapterMode === 'none'
                ? 'No host metadata means the preview falls back to a regular external link.'
                : adapterMode === 'custom'
                  ? 'The same link helper now resolves a custom host metadata card.'
                  : 'The default Storybook host adapter resolves a local mock preview card.'}
            </p>
          </div>
        </section>
      </StorybookSectionCard>
      <section className={panelClass}>
        <StorybookSectionCard
          description="Open a helper, finish the flow, and inspect the exact payload that would be sent back to your host application."
          title="Interactive helper surface"
        >
          <StorybookStatusBadge>
            {adapterMode === 'none'
              ? 'Helper UI without host integration'
              : adapterMode === 'custom'
                ? 'Helper UI with custom host integration'
                : 'Helper UI with default mock host integration'}
          </StorybookStatusBadge>
        </StorybookSectionCard>
        <div className={toolbarRowClass}>
          <ImageEmbedModal
            contentType={contentType}
            onApply={payload => appendEvent('ImageEmbedModal', payload)}
            onUploadImage={adapters?.uploadImage}
            renderImage={adapters?.renderImage}
          />
          <FileEmbedPopover
            contentType={contentType}
            onApply={payload => appendEvent('FileEmbedPopover', payload)}
            onUploadFile={adapters?.uploadFile}
          />
          <VideoEmbedModal
            contentType={contentType}
            onApply={payload => appendEvent('VideoEmbedModal', payload)}
            onUploadVideo={adapters?.uploadVideo}
          />
          <LinkEmbedPopover
            onApply={(url, mode) => appendEvent('LinkEmbedPopover', { mode, url })}
          />
          <TextColorPopover onApply={color => appendEvent('TextColorPopover', { color })} />
          <TextBackgroundColorPopover
            onApply={color => appendEvent('TextBackgroundColorPopover', { color })}
          />
        </div>

        <div className={valuePanelClass}>
          <div className={payloadHeaderClass}>
            <h3 className={sectionTitleClass}>Host callback payload log</h3>
            <p className={payloadDescriptionClass}>
              Finish any helper flow and this panel shows the exact `onApply` value your app would
              receive.
            </p>
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
              Open a helper, complete the flow, and compare the emitted host callback payload here.
            </p>
          )}
        </div>
        <StorybookSectionCard
          description="These guarantees stay intact even when the host integration changes."
          title="What stays the same"
        >
          <StorybookCheckList
            items={[
              'Same helper entrypoints and toolbar order',
              'Same onApply payload contract shape',
              'Same package-owned helper UI structure',
            ]}
          />
        </StorybookSectionCard>
      </section>
    </main>
  );
};

const meta = {
  argTypes: {
    contentType: {
      control: 'inline-radio',
      options: ['article', 'project', 'resume'],
    },
    adapterMode: {
      control: 'inline-radio',
      options: ['full', 'custom', 'none'],
    },
  },
  args: {
    adapterMode: 'full',
    contentType: 'article',
  },
  component: EmbedWorkflowsReference,
  parameters: {
    docs: {
      description: {
        component:
          'Standalone embed and formatting helper reference for image, file, video, link, and color workflows. Use these stories to compare the package helper UI on its own, with the default mock host wiring, and with a branded host integration while keeping the same payload contract in view.',
      },
      source: {
        code: customAdapterUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Reference/EmbedWorkflows',
} satisfies Meta<typeof EmbedWorkflowsReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
Default.parameters = {
  docs: {
    description: {
      story:
        'Use this story as the baseline integration reference. It shows the helpers in the state that most closely matches a connected product, while still staying fully local to Storybook.',
    },
  },
};

export const CoreOnly: Story = {
  args: {
    adapterMode: 'none',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this story when you want to review the package helper UI in isolation. The same entrypoints stay visible, but upload-backed actions no longer have any host implementation behind them.',
      },
    },
  },
};

export const CustomHostAdapters: Story = {
  args: {
    adapterMode: 'custom',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this story to compare the helper flows under a branded host integration. The event log makes it easy to see that the helper contract stays the same even when the host behavior changes.',
      },
    },
  },
};

const toolbarRowClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  flexWrap: 'wrap',
});

const specimenSectionClass = css({
  display: 'grid',
  gap: '4',
  gridTemplateColumns: {
    base: '1fr',
    xl: 'repeat(3, minmax(0, 1fr))',
  },
});

const specimenCardClass = css({
  display: 'grid',
  gap: '3',
  alignContent: 'start',
  backgroundColor: 'surface',
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'xl',
  padding: '5',
});

const specimenLabelClass = css({
  color: 'primary',
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: 'wide',
  textTransform: 'uppercase',
});

const specimenBodyClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

const specimenChipRowClass = css({
  display: 'flex',
  gap: '2',
  flexWrap: 'wrap',
});

const statusChipBaseClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '8',
  borderRadius: 'full',
  px: '3',
  fontSize: 'xs',
  fontWeight: 'semibold',
});

const statusChipPositiveClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: 'primarySubtle',
    color: 'primary',
  }),
);

const statusChipMutedClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: 'surfaceStrong',
    color: 'textSubtle',
  }),
);

const statusChipBrandedClass = cx(
  statusChipBaseClass,
  css({
    backgroundColor: '[rgba(180,83,9,0.12)]',
    color: '[#9a3412]',
  }),
);

const imagePreviewFrameClass = css({
  overflow: 'hidden',
  borderRadius: 'lg',
  border: '[1px solid var(--colors-border)]',
  minHeight: '40',
  backgroundColor: 'surfaceMuted',
});

const imagePreviewClass = css({
  width: 'full',
  height: '40',
  objectFit: 'cover',
  display: 'block',
});

const linkPreviewFrameClass = css({
  minHeight: '40',
  display: 'grid',
  alignItems: 'start',
});

const eventListClass = css({
  display: 'grid',
  gap: '3',
});

const payloadHeaderClass = css({
  display: 'grid',
  gap: '2',
});

const payloadDescriptionClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'relaxed',
});

const emptyStateClass = css({
  fontSize: 'sm',
  color: 'muted',
  lineHeight: 'relaxed',
});
