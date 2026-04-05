import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownEditor } from '@/react';
import {
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  editorPackageUsageSnippet,
  pageClass,
  panelClass,
  sampleMarkdown,
  type StorybookAdapterMode,
  StorybookCheckList,
  StorybookMetaTable,
  StorybookSectionCard,
  StorybookStatusBadge,
} from '@/stories/storybook-fixtures';

type MarkdownEditorReferenceProps = {
  adapterMode: StorybookAdapterMode;
  contentType: EditorContentType;
  customLabels?: boolean;
  initialValue: string;
  placeholder?: string;
  previewEmptyText?: string;
};

const getEditorStateSummary = (adapterMode: StorybookAdapterMode, customLabels: boolean) => {
  if (adapterMode === 'none') {
    return {
      description:
        'The full editor shell stays visible, but host uploads, link preview enrichment, and custom image rendering are intentionally turned off.',
      items: [
        { label: 'Mode', value: 'Host adapters off' },
        { label: 'Labels', value: 'Package-default labels' },
        { label: 'Uploads', value: 'Disabled' },
        { label: 'Previews', value: 'Package fallback only' },
      ],
      title: 'Core-only editor shell',
    };
  }

  if (adapterMode === 'custom') {
    return {
      description:
        'This state keeps the same editor contract, but swaps in branded host behavior for image rendering, link previews, and selected toolbar copy.',
      items: [
        { label: 'Mode', value: 'Custom host adapters enabled' },
        {
          label: 'Labels',
          value: customLabels ? 'Selected toolbar labels overridden' : 'Package-default labels',
        },
        { label: 'Uploads', value: 'Custom host adapters' },
        { label: 'Previews', value: 'Custom image and metadata output' },
      ],
      title: customLabels ? 'Custom host integration + custom labels' : 'Custom host integration',
    };
  }

  return {
    description:
      'This is the baseline integrated editor reference with default mock host adapters and the package-default toolbar copy.',
    items: [
      { label: 'Mode', value: 'Default mock host adapters enabled' },
      {
        label: 'Labels',
        value: customLabels ? 'Selected toolbar labels overridden' : 'Package-default labels',
      },
      { label: 'Uploads', value: 'Default mock adapters' },
      { label: 'Previews', value: 'Mock image and metadata output' },
    ],
    title: customLabels ? 'Default integration + custom labels' : 'Default integrated editor',
  };
};

const MarkdownEditorReference = ({
  adapterMode,
  contentType,
  customLabels = false,
  initialValue,
  placeholder,
  previewEmptyText,
}: MarkdownEditorReferenceProps) => {
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const summary = getEditorStateSummary(adapterMode, customLabels);

  return (
    <main className={pageClass}>
      <StorybookSectionCard description={summary.description} title={summary.title}>
        <StorybookMetaTable items={summary.items} />
      </StorybookSectionCard>
      <section className={panelClass}>
        <StorybookSectionCard
          description="The same editor shell stays mounted across all variants. Use the badge and checklist below to distinguish host-backed behavior from package-owned structure."
          title="Interactive editor surface"
        >
          <StorybookStatusBadge>
            {adapterMode === 'none'
              ? 'Live editing surface without host adapters'
              : adapterMode === 'custom'
                ? 'Live editing surface with custom host behavior'
                : 'Live editing surface with default mock host behavior'}
          </StorybookStatusBadge>
        </StorybookSectionCard>
        <MarkdownEditor
          adapters={adapters}
          contentType={contentType}
          onChange={setValue}
          placeholder={placeholder}
          previewEmptyText={previewEmptyText}
          uiRegistry={
            customLabels
              ? {
                  labels: {
                    headingPopover: {
                      panelLabel: 'Pick a heading token',
                      triggerAriaLabel: 'Heading tools',
                      triggerTooltip: 'Heading tools',
                    },
                    linkEmbedPopover: {
                      panelLabel: 'Link insertion',
                      triggerAriaLabel: 'Link helper',
                      triggerTooltip: 'Link helper',
                    },
                  },
                }
              : undefined
          }
          value={value}
        />

        <StorybookSectionCard
          description="These guarantees hold even when uploads, link previews, and image rendering move between package-only, default mock, and custom host modes."
          title="What stays the same"
        >
          <StorybookCheckList
            items={[
              'Same editor layout and pane structure',
              'Same markdown editing and preview contract',
              'Same helper entrypoints inside the toolbar',
            ]}
          />
        </StorybookSectionCard>
      </section>
    </main>
  );
};

const meta = {
  argTypes: {
    adapterMode: {
      control: 'inline-radio',
      options: ['full', 'custom', 'none'],
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
    customLabels: false,
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
      source: {
        code: editorPackageUsageSnippet,
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
Default.parameters = {
  docs: {
    description: {
      story:
        'Uses the default mock host adapters. Upload flows, link preview cards, image rendering overrides, and viewer labels are all enabled without a real backend.',
    },
  },
};

export const CoreOnly: Story = {
  args: {
    adapterMode: 'none',
    contentType: 'article',
    initialValue: sampleMarkdown,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the editor shell without host adapters. Upload-backed helpers remain part of the package UI, but upload actions and preview enrichments fall back to their non-host behavior.',
      },
      source: {
        code: [
          "import 'chaeditor/styles.css';",
          '',
          "import { MarkdownEditor } from 'chaeditor/react';",
          '',
          '<MarkdownEditor',
          '  contentType="article"',
          '  onChange={() => {}}',
          '  value=""',
          '/>',
        ].join('\n'),
      },
    },
  },
};

export const CustomHostIntegration: Story = {
  args: {
    adapterMode: 'custom',
    contentType: 'article',
    customLabels: true,
    initialValue: sampleMarkdown,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a host that customizes image rendering, link preview metadata, and selected toolbar labels while keeping the same MarkdownEditor contract.',
      },
      source: {
        code: customAdapterUsageSnippet,
      },
    },
  },
};
