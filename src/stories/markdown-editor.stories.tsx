import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor/model/editor-types';
import { MarkdownEditor } from '@/react';
import {
  createStorybookAdapters,
  pageClass,
  panelClass,
  sampleMarkdown,
} from '@/stories/storybook-fixtures';

type MarkdownEditorReferenceProps = {
  contentType: EditorContentType;
  initialValue: string;
  placeholder?: string;
  previewEmptyText?: string;
};

const MarkdownEditorReference = ({
  contentType,
  initialValue,
  placeholder,
  previewEmptyText,
}: MarkdownEditorReferenceProps) => {
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapters(), []);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <section className={panelClass}>
        <MarkdownEditor
          adapters={adapters}
          contentType={contentType}
          onChange={setValue}
          placeholder={placeholder}
          previewEmptyText={previewEmptyText}
          value={value}
        />
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
    initialValue: {
      control: 'object',
    },
  },
  args: {
    contentType: 'article',
    initialValue: sampleMarkdown,
    placeholder: 'Write markdown content',
    previewEmptyText: 'Nothing to preview yet.',
  },
  component: MarkdownEditorReference,
  parameters: {
    docs: {
      description: {
        component:
          'Integrated authoring surface with toolbar actions, live preview, and host adapters for uploads, image rendering, and link previews.',
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Reference/MarkdownEditor',
} satisfies Meta<typeof MarkdownEditorReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
