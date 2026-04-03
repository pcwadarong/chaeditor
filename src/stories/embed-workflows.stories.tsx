import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css } from 'styled-system/css';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import {
  FileEmbedPopover,
  ImageEmbedModal,
  LinkEmbedPopover,
  TextBackgroundColorPopover,
  TextColorPopover,
  VideoEmbedModal,
} from '@/react';
import {
  codeBlockClass,
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  pageClass,
  panelClass,
  sectionTitleClass,
  type StorybookAdapterMode,
  StorybookCompactSummary,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type EmbedWorkflowsReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
};

const getEmbedWorkflowSummary = (adapterMode: StorybookAdapterMode) => {
  if (adapterMode === 'none') {
    return {
      description:
        'Use this state when you want to inspect the package-owned helper UI without any host upload or preview integration behind it.',
      items: [
        { label: 'Mode', value: 'Host adapters off' },
        { label: 'Outputs', value: 'Only package-side payload UI is available' },
      ],
      title: 'Core-only helper surface',
    };
  }

  if (adapterMode === 'custom') {
    return {
      description:
        'Use this state to compare the same helper flows against a branded host integration and review how the resulting payload log changes in a product-specific setup.',
      items: [
        { label: 'Mode', value: 'Custom host adapters enabled' },
        { label: 'Outputs', value: 'Branded upload and preview behavior' },
      ],
      title: 'Custom host helper integration',
    };
  }

  return {
    description:
      'Use this baseline state to exercise the helper flows with realistic mock payloads before introducing any product-specific host customization.',
    items: [
      { label: 'Mode', value: 'Default mock host adapters enabled' },
      { label: 'Outputs', value: 'Default mock payloads and preview behavior' },
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
      <StorybookCompactSummary
        description={summary.description}
        items={summary.items}
        title={summary.title}
      />
      <section className={panelClass}>
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
          <h3 className={sectionTitleClass}>Recent apply payloads</h3>
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
              Open a helper, complete the flow, and the resulting payload will appear here.
            </p>
          )}
        </div>
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

const eventListClass = css({
  display: 'grid',
  gap: '3',
});

const emptyStateClass = css({
  fontSize: 'sm',
  color: 'muted',
  lineHeight: 'relaxed',
});
