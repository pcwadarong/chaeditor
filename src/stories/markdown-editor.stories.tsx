import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownEditor } from '@/react';
import {
  createStorybookAdapterSet,
  pageClass,
  panelClass,
  sampleMarkdown,
  type StorybookAdapterMode,
} from '@/stories/storybook-fixtures';

type MarkdownEditorReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
  initialValue: string;
  placeholder?: string;
  previewEmptyText?: string;
};

const MarkdownEditorReference = ({
  adapterMode,
  contentType,
  initialValue,
  placeholder,
  previewEmptyText,
}: MarkdownEditorReferenceProps) => {
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);

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
    adapterMode: {
      control: 'inline-radio',
      options: ['full', 'none'],
    },
    contentType: {
      control: 'inline-radio',
      options: ['article', 'project', 'resume'],
    },
    initialValue: {
      control: 'object',
    },
  },
  args: {
    adapterMode: 'full',
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
          'Integrated authoring surface reference for the editor shell. The full mode uses mock host adapters, while the core-only mode keeps the same editor surface without upload, image, or link-preview integrations.',
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

export const CoreOnly: Story = {
  args: {
    adapterMode: 'none',
    contentType: 'article',
    initialValue: sampleMarkdown,
  },
};
