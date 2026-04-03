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
        'Use this state when you want to review the package renderer on its own, without any host-provided link preview metadata or image overrides.',
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
        'Use this state when you need to compare the package renderer against a branded product integration that changes host metadata, image rendering, or both.',
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
      'Use this baseline state to review the full renderer contract with default host enrichment and the package-default segment renderers.',
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
          'Markdown rendering reference for custom blocks, media embeds, Mermaid diagrams, math, and host-driven link previews. Use these stories to compare the package-default renderer, a renderer-only review surface, and product-style overrides without leaving the same markdown fixture.',
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
        'Use this story to review the full reading experience of a content-heavy article. It exercises the default renderer contract across links, attachments, math, Mermaid, gallery, and video blocks.',
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
          'Use this story when you want to judge the package renderer without any host enrichment. It keeps the markdown sample intentionally small so spacing, typography, and fallback rendering are easy to inspect.',
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
          'Use this story when you want to replace one visual block, such as video, without forking the full markdown pipeline. It keeps the rest of the renderer unchanged so the override surface is easy to isolate.',
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
          'Use this story to compare the same markdown content under a branded host integration. It is the clearest reference for host-provided preview metadata and custom image rendering.',
      },
      source: {
        code: customAdapterUsageSnippet,
      },
    },
  },
};
