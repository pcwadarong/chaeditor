import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import { MarkdownEditor } from '@/react';
import {
  createStorybookAdapters,
  pageClass,
  panelClass,
  sampleMarkdown,
  sectionDescriptionClass,
  sectionTitleClass,
} from '@/stories/storybook-fixtures';

const MarkdownEditorReference = () => {
  const [value, setValue] = React.useState(sampleMarkdown);
  const adapters = React.useMemo(() => createStorybookAdapters(), []);

  return (
    <main className={pageClass}>
      <section className={panelClass}>
        <div>
          <h2 className={sectionTitleClass}>MarkdownEditor</h2>
          <p className={sectionDescriptionClass}>
            This reference shows the integrated authoring surface with toolbar actions, live
            preview, and host adapters connected to uploads, image rendering, and link previews.
          </p>
        </div>
        <MarkdownEditor
          adapters={adapters}
          contentType="article"
          onChange={setValue}
          value={value}
        />
      </section>
    </main>
  );
};

const meta = {
  component: MarkdownEditorReference,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Reference/MarkdownEditor',
} satisfies Meta<typeof MarkdownEditorReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
