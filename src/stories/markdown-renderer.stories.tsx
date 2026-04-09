import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MarkdownHooks } from 'react-markdown';

import { collectMarkdownImages } from '@/entities/editor-core/model/collect-markdown-images';
import { getMarkdownOptions } from '@/shared/lib/markdown/markdown-config';
import { markdownBodyClass } from '@/shared/lib/markdown/markdown-styles.panda';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import { createStorybookAdapterSet } from '@/stories/support/storybook-adapters';
import { rendererPackageUsageSnippet } from '@/stories/support/storybook-code-snippets';
import { StorybookGuideList, StorybookPageHeader } from '@/stories/support/storybook-docs';
import {
  pageClass,
  panelClass,
  sampleMarkdown,
  StorybookReferenceInvariantSection,
  StorybookSectionCard,
} from '@/stories/support/storybook-reference-ui';

type MarkdownRendererReferenceProps = {
  markdown: string;
};

const MarkdownRendererReference = ({ markdown }: MarkdownRendererReferenceProps) => {
  const adapters = React.useMemo(() => createStorybookAdapterSet('full'), []);
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
      <StorybookPageHeader
        description="Use this page when you need to judge what the markdown pipeline already renders well: galleries, attachments, math, Mermaid, link previews, and fenced code blocks. If you need adapter-by-adapter preview behavior comparison, use EmbedWorkflows instead."
        title="Inspect the rendered markdown surface before you replace visual blocks"
      />

      <section className={panelClass}>
        <StorybookSectionCard
          description="This page focuses on the rendered reading surface itself rather than adapter comparison. Use it to decide whether the package output is already good enough before you replace blocks."
          eyebrow="Renderer scope"
          title="What this page helps you inspect"
        >
          <StorybookGuideList
            items={[
              {
                body: 'The page renders the real markdown pipeline so you can inspect galleries, embeds, attachments, math, Mermaid, and code blocks together.',
                eyebrow: 'Coverage',
                title: 'How the package handles mixed rich markdown content',
              },
              {
                body: 'The focus here is the final reading surface, not the editor shell or helper contract. It is useful when you are judging typography, spacing, and rich block defaults.',
                eyebrow: 'Output',
                title: 'How the final reading surface feels in practice',
              },
              {
                body: 'Preview cards and media still use the default Storybook host adapter set so you can see a fully enriched renderer without turning this page into another adapter matrix.',
                eyebrow: 'Host seams',
                title: 'Where host-backed enrichment appears in the output',
              },
            ]}
          />
        </StorybookSectionCard>

        <StorybookSectionCard
          description="This is the actual rendered markdown output under the default Storybook integration. Use EmbedWorkflows if you need to compare how adapter modes change helper payloads or preview behavior."
          eyebrow="Rendered surface"
          title="Rendered markdown output"
        >
          <div className={markdownBodyClass}>
            {renderRichMarkdown({
              adapters,
              markdown,
              renderMarkdownFragment: (fragmentMarkdown, key) => (
                <MarkdownHooks key={key} {...markdownOptions}>
                  {fragmentMarkdown}
                </MarkdownHooks>
              ),
            })}
          </div>
        </StorybookSectionCard>

        <StorybookReferenceInvariantSection
          description="These guarantees define the renderer surface even if the host later changes how preview metadata or image primitives are supplied."
          eyebrow="Invariant contract"
          items={[
            'Same markdown parsing pipeline',
            'Same block-level renderer contract',
            'Same source markdown input fixture',
          ]}
        />
      </section>
    </main>
  );
};

const meta = {
  argTypes: {
    markdown: {
      control: 'object',
    },
  },
  args: {
    markdown: sampleMarkdown,
  },
  component: MarkdownRendererReference,
  parameters: {
    docs: {
      source: {
        code: rendererPackageUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Reference/MarkdownRenderer',
} satisfies Meta<typeof MarkdownRendererReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
