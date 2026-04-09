import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MarkdownHooks } from 'react-markdown';
import { css, cx } from 'styled-system/css';

import type { PartialRichMarkdownRendererRegistry } from '@/react';
import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';
import { getMarkdownOptions } from '@/shared/lib/markdown/markdown-config';
import { markdownBodyClass } from '@/shared/lib/markdown/markdown-styles.panda';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import { RenderImage } from '@/shared/ui/image/render-image';
import { LinkEmbedCard } from '@/shared/ui/markdown';
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
  StorybookCheckList,
  StorybookMetaTable,
  StorybookSectionCard,
  StorybookStatusBadge,
  valuePanelClass,
} from '@/stories/storybook-fixtures';

type MarkdownRendererReferenceProps = {
  adapterMode: StorybookAdapterMode;
  markdown: string;
  renderers?: PartialRichMarkdownRendererRegistry;
};

const SAMPLE_LINK_URL = 'https://chaeditor.dev/docs/getting-started';
const SAMPLE_IMAGE_URL =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

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
      <StorybookSectionCard description={summary.description} title={summary.title}>
        <StorybookMetaTable items={summary.items} />
      </StorybookSectionCard>
      <StorybookSectionCard
        description="These cards isolate the renderer seams that actually change across package-only, default mock host, and custom host states."
        title="Visible integration differences"
      >
        <section className={specimenSectionClass}>
          <div className={specimenCardClass}>
            <p className={specimenLabelClass}>Image renderer</p>
            <div className={imagePreviewFrameClass}>
              <RenderImage
                alt="Renderer integration preview"
                className={imagePreviewClass}
                renderImage={adapters?.renderImage}
                src={SAMPLE_IMAGE_URL}
              />
            </div>
            <p className={specimenBodyClass}>
              {adapterMode === 'custom'
                ? 'Custom host shell'
                : adapterMode === 'full'
                  ? 'Default mock host renderer'
                  : 'Package fallback image'}
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
              {adapterMode === 'custom'
                ? 'Custom metadata card'
                : adapterMode === 'full'
                  ? 'Default mock metadata'
                  : 'Plain external link fallback'}
            </p>
          </div>
          <div className={specimenCardClass}>
            <p className={specimenLabelClass}>Renderer override</p>
            <div className={statusChipRowClass}>
              <span
                className={
                  hasCustomRenderer(renderers) ? statusChipActiveClass : statusChipMutedClass
                }
              >
                {hasCustomRenderer(renderers)
                  ? 'Custom block override active'
                  : 'Package-default blocks'}
              </span>
            </div>
            <p className={specimenBodyClass}>
              {hasCustomRenderer(renderers)
                ? 'A host renderer replaced one block while the rest of the markdown pipeline stayed unchanged.'
                : 'All rich blocks use the package renderer contract as shipped.'}
            </p>
          </div>
        </section>
      </StorybookSectionCard>
      <section className={panelClass}>
        <StorybookSectionCard
          description="This panel is the actual rich markdown output, not a text editor. Use the source markdown panel on the right to compare input and rendered output."
          title="Rendered markdown output"
        >
          <StorybookStatusBadge tone="muted">Rendered preview</StorybookStatusBadge>
        </StorybookSectionCard>
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
        <StorybookSectionCard
          description="These guarantees stay intact regardless of host adapter presence or custom renderer overrides."
          title="What stays the same"
        >
          <StorybookCheckList
            items={[
              'Same markdown parsing pipeline',
              'Same block-level renderer contract',
              'Same source markdown input fixture',
            ]}
          />
        </StorybookSectionCard>
      </section>
    </main>
  );
};

const hasCustomRenderer = (renderers?: PartialRichMarkdownRendererRegistry) =>
  Boolean(renderers && Object.keys(renderers).length > 0);

const specimenSectionClass = css({
  display: 'grid',
  gap: '5',
  gridTemplateColumns: { base: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
  marginTop: '4',
  marginBottom: '4',
});

const specimenCardClass = css({
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'lg',
  background: 'surface',
  padding: '5',
  display: 'grid',
  gap: '3',
  alignContent: 'start',
});

const specimenLabelClass = css({
  fontSize: 'xs',
  fontWeight: 'semibold',
  letterSpacing: '[0.12em]',
  textTransform: 'uppercase',
  color: 'primary',
});

const specimenBodyClass = css({
  fontSize: 'sm',
  lineHeight: '[1.6]',
  color: 'textSubtle',
});

const imagePreviewFrameClass = css({
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'md',
  overflow: 'hidden',
  background: 'surfaceMuted',
  minHeight: '[7rem]',
});

const imagePreviewClass = css({
  width: 'full',
  height: '[7rem]',
  objectFit: 'cover',
});

const linkPreviewFrameClass = css({
  minHeight: '[7rem]',
  display: 'flex',
  alignItems: 'stretch',
});

const statusChipRowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
});

const statusChipBaseClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '[2rem]',
  borderRadius: 'full',
  paddingX: '3',
  fontSize: 'sm',
  fontWeight: 'medium',
});

const statusChipActiveClass = cx(
  statusChipBaseClass,
  css({
    background: 'primarySubtle',
    color: 'primary',
  }),
);

const statusChipMutedClass = cx(
  statusChipBaseClass,
  css({
    background: 'surfaceMuted',
    color: 'textSubtle',
  }),
);

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
