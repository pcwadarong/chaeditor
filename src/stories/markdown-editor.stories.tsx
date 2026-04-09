import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownEditor } from '@/react';
import { createStorybookAdapterSet } from '@/stories/support/storybook-adapters';
import { editorPackageUsageSnippet } from '@/stories/support/storybook-code-snippets';
import { StorybookGuideList, StorybookPageHeader } from '@/stories/support/storybook-docs';
import {
  pageClass,
  panelClass,
  sampleMarkdown,
  StorybookReferenceInvariantSection,
  StorybookSectionCard,
} from '@/stories/support/storybook-reference-ui';

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
  const adapters = React.useMemo(() => createStorybookAdapterSet('full'), []);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <StorybookPageHeader
        description="Use this page when you want to review the complete authoring shell in one place: toolbar, write pane, preview pane, and helper entrypoints. If you need adapter-by-adapter behavior comparison, use EmbedWorkflows instead."
        title="Inspect the complete editor surface before you wire a real product backend"
      />

      <section className={panelClass}>
        <StorybookSectionCard
          description="This page focuses on the editor surface itself rather than adapter comparison. Use it to judge whether the mounted shell already feels production-ready."
          eyebrow="Editor scope"
          title="What this page helps you inspect"
        >
          <StorybookGuideList
            items={[
              {
                body: 'The real editor shell stays mounted with the package toolbar, write pane, and preview pane visible together.',
                eyebrow: 'Shell',
                title: 'Pane layout and overall writing surface',
              },
              {
                body: 'Typing, preview updates, and helper entrypoints all run through the real package surface rather than a mock shell.',
                eyebrow: 'Interaction',
                title: 'Live markdown editing and preview feedback',
              },
              {
                body: 'Upload, link, and formatting helpers are present so you can judge placement and reachability without turning this page into an adapter contract matrix.',
                eyebrow: 'Helpers',
                title: 'Toolbar entrypoints in their mounted context',
              },
            ]}
          />
        </StorybookSectionCard>

        <StorybookSectionCard
          description="This is the mounted package editor with the default Storybook adapter set behind it. Use EmbedWorkflows when you need to compare what changes as adapters are removed or replaced."
          eyebrow="Mounted surface"
          title="Live editor"
        >
          <MarkdownEditor
            adapters={adapters}
            contentType={contentType}
            onChange={setValue}
            placeholder={placeholder}
            previewEmptyText={previewEmptyText}
            value={value}
          />
        </StorybookSectionCard>

        <StorybookReferenceInvariantSection
          description="These guarantees define the editor surface regardless of how the host later swaps adapters behind it."
          eyebrow="Invariant contract"
          items={[
            'Same editor layout and pane structure',
            'Same markdown editing and preview contract',
            'Same helper entrypoints inside the toolbar',
          ]}
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
      source: {
        code: editorPackageUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Reference/MarkdownEditor',
} satisfies Meta<typeof MarkdownEditorReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
