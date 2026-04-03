import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MarkdownHooks } from 'react-markdown';

import type { PartialRichMarkdownRendererRegistry } from '@/react';
import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';
import { getMarkdownOptions, markdownBodyClass } from '@/shared/lib/markdown/markdown-config';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import {
  codeBlockClass,
  createStorybookAdapterSet,
  customAdapterUsageSnippet,
  pageClass,
  panelClass,
  rendererPackageUsageSnippet,
  sampleMarkdown,
  sectionTitleClass,
  splitLayoutClass,
  type StorybookAdapterMode,
  StorybookCompactSummary,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type MarkdownRendererReferenceProps = {
  adapterMode: StorybookAdapterMode;
  markdown: string;
  renderers?: PartialRichMarkdownRendererRegistry;
};

const getRendererStateSummary = (
  adapterMode: StorybookAdapterMode,
  hasCustomRenderers: boolean,
) => {
  if (adapterMode === 'none') {
    return {
      description:
        'This state renders markdown with the package defaults only. Host-driven link previews and image overrides are turned off.',
      items: [
        { label: 'Mode', value: 'Host adapters off' },
        {
          label: 'Renderers',
          value: hasCustomRenderers ? 'Custom renderer overrides' : 'Package-default renderers',
        },
      ],
      title: 'Core-only renderer surface',
    };
  }

  if (adapterMode === 'custom') {
    return {
      description:
        'This state demonstrates host-driven preview metadata and image rendering, with optional renderer overrides layered on top of the same markdown pipeline.',
      items: [
        { label: 'Mode', value: 'Custom host adapters enabled' },
        {
          label: 'Renderers',
          value: hasCustomRenderers ? 'Custom renderer overrides' : 'Package-default renderers',
        },
      ],
      title: hasCustomRenderers
        ? 'Custom host adapters + custom renderers'
        : 'Custom host adapters',
    };
  }

  return {
    description:
      'This is the baseline renderer reference with the default mock host adapters and the package-default segment renderers.',
    items: [
      { label: 'Mode', value: 'Default mock host adapters enabled' },
      {
        label: 'Renderers',
        value: hasCustomRenderers ? 'Custom renderer overrides' : 'Package-default renderers',
      },
    ],
    title: hasCustomRenderers
      ? 'Default host adapters + custom renderers'
      : 'Default integrated renderer',
  };
};

const MarkdownRendererReference = ({
  adapterMode,
  markdown,
  renderers,
}: MarkdownRendererReferenceProps) => {
  const adapters = React.useMemo(() => createStorybookAdapterSet(adapterMode), [adapterMode]);
  const summary = React.useMemo(
    () => getRendererStateSummary(adapterMode, Boolean(renderers)),
    [adapterMode, renderers],
  );
  const markdownOptions = React.useMemo(
    () =>
      getMarkdownOptions({
        adapters,
        items: collectMarkdownImages(markdown),
      }),
    [adapters, markdown],
  );

  return (
    <main className={pageClass}>
      <StorybookCompactSummary
        description={summary.description}
        items={summary.items}
        title={summary.title}
      />
      <section className={panelClass}>
        <div className={splitLayoutClass}>
          <div className={panelClass}>
            <div className={markdownBodyClass}>
              {renderRichMarkdown({
                adapters,
                markdown,
                renderMarkdownFragment: (fragmentMarkdown, key) => (
                  <MarkdownHooks key={key} {...markdownOptions}>
                    {fragmentMarkdown}
                  </MarkdownHooks>
                ),
                renderers,
              })}
            </div>
          </div>

          <aside className={valuePanelClass}>
            <h3 className={sectionTitleClass}>Source markdown</h3>
            <pre className={codeBlockClass}>{markdown}</pre>
          </aside>
        </div>
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
    markdown: {
      control: 'object',
    },
    renderers: {
      control: false,
      table: {
        disable: true,
      },
    },
  },
  args: {
    adapterMode: 'full',
    markdown: sampleMarkdown,
  },
  component: MarkdownRendererReference,
  parameters: {
    docs: {
      description: {
        component:
          'Markdown rendering reference for custom blocks, media embeds, Mermaid diagrams, math, and host-driven link previews. The renderer stories use mock adapters instead of the optional default-host HTTP adapters so the preview stays fully local.',
      },
      source: {
        code: rendererPackageUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Reference/MarkdownRenderer',
} satisfies Meta<typeof MarkdownRendererReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeatureShowcase: Story = {};
FeatureShowcase.parameters = {
  docs: {
    description: {
      story:
        'Renders the full sample markdown with the default mock host adapters, including link preview metadata, attachments, math, Mermaid diagrams, galleries, and video blocks.',
    },
  },
};

export const MinimalMarkdown: Story = {
  args: {
    adapterMode: 'none',
    markdown: ['# Minimal example', '', 'Plain markdown works alongside custom rendering.'].join(
      '\n',
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Removes host adapters and uses a smaller markdown sample so the package renderer can be reviewed without any host-provided enrichment.',
      },
    },
  },
};

export const CustomRendererOverride: Story = {
  args: {
    adapterMode: 'custom',
    markdown: sampleMarkdown,
    renderers: {
      video: ({ key, segment }) => (
        <div
          key={key}
          style={{
            border: '1px dashed var(--colors-border)',
            borderRadius: 16,
            padding: 16,
          }}
        >
          Custom video renderer: {segment.provider} / {segment.src || segment.videoId}
        </div>
      ),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Keeps host adapters but replaces the video segment renderer to show how products can override one renderer without forking the full markdown pipeline.',
      },
      source: {
        code: [
          "import 'chaeditor/styles.css';",
          '',
          "import { MarkdownRenderer } from 'chaeditor/react';",
          '',
          'const renderers = {',
          '  video: ({ key, segment }) => (',
          '    <div key={key}>Custom video renderer: {segment.provider}</div>',
          '  ),',
          '};',
          '',
          '<MarkdownRenderer markdown={markdown} renderers={renderers} />',
        ].join('\n'),
      },
    },
  },
};

export const CustomHostAdapters: Story = {
  args: {
    adapterMode: 'custom',
    markdown: sampleMarkdown,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the custom adapter variant so the docs page shows host-provided link preview metadata and branded image rendering alongside the same markdown content.',
      },
      source: {
        code: customAdapterUsageSnippet,
      },
    },
  },
};
