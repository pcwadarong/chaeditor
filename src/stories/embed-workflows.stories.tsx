import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css } from 'styled-system/css';

import type { EditorContentType } from '@/entities/editor/model/editor-types';
import {
  FileEmbedPopover,
  ImageEmbedPopover,
  LinkEmbedPopover,
  TextBackgroundColorPopover,
  TextColorPopover,
  VideoEmbedModal,
} from '@/react';
import {
  codeBlockClass,
  createStorybookAdapters,
  pageClass,
  panelClass,
  sectionDescriptionClass,
  sectionTitleClass,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type EmbedWorkflowsReferenceProps = {
  contentType: EditorContentType;
};

const EmbedWorkflowsReference = ({ contentType }: EmbedWorkflowsReferenceProps) => {
  const adapters = React.useMemo(() => createStorybookAdapters(), []);
  const [events, setEvents] = React.useState<string[]>([]);

  const appendEvent = (label: string, value: unknown) => {
    setEvents(current => [`${label}\n${JSON.stringify(value, null, 2)}`, ...current].slice(0, 6));
  };

  return (
    <main className={pageClass}>
      <section className={panelClass}>
        <div>
          <h2 className={sectionTitleClass}>Embed workflows</h2>
          <p className={sectionDescriptionClass}>
            These stories focus on the standalone helper UI used by the toolbar. Each trigger writes
            its apply payload into a small event log so host integration points stay visible.
          </p>
        </div>

        <div className={toolbarRowClass}>
          <ImageEmbedPopover
            contentType={contentType}
            onApply={payload => appendEvent('ImageEmbedPopover', payload)}
            onUploadImage={adapters.uploadImage}
            renderImage={adapters.renderImage}
          />
          <FileEmbedPopover
            contentType={contentType}
            onApply={payload => appendEvent('FileEmbedPopover', payload)}
            onUploadFile={adapters.uploadFile}
          />
          <VideoEmbedModal
            contentType={contentType}
            onApply={payload => appendEvent('VideoEmbedModal', payload)}
            onUploadVideo={adapters.uploadVideo}
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
            <p className={sectionDescriptionClass}>
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
  },
  args: {
    contentType: 'article',
  },
  component: EmbedWorkflowsReference,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Reference/EmbedWorkflows',
} satisfies Meta<typeof EmbedWorkflowsReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

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
