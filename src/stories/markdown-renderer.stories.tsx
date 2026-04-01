import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MarkdownHooks } from 'react-markdown';

import { collectMarkdownImages } from '@/shared/lib/markdown/collect-markdown-images';
import { getMarkdownOptions, markdownBodyClass } from '@/shared/lib/markdown/markdown-config';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import {
  codeBlockClass,
  createStorybookAdapters,
  pageClass,
  panelClass,
  sampleMarkdown,
  sectionDescriptionClass,
  sectionTitleClass,
  splitLayoutClass,
  valuePanelClass,
} from '@/stories/storybook-fixtures';
import type { MarkdownEditorHostAdapters } from '@/widgets/editor';

type MarkdownRendererReferenceProps = {
  adapters: MarkdownEditorHostAdapters;
  markdown: string;
};

const MarkdownRendererReference = ({ adapters, markdown }: MarkdownRendererReferenceProps) => {
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
      <section className={panelClass}>
        <div>
          <h2 className={sectionTitleClass}>MarkdownRenderer</h2>
          <p className={sectionDescriptionClass}>
            This reference renders custom blocks, media embeds, Mermaid diagrams, and host-driven
            link previews from one markdown source.
          </p>
        </div>

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
  args: {
    adapters: createStorybookAdapters(),
    markdown: sampleMarkdown,
  },
  component: MarkdownRendererReference,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Reference/MarkdownRenderer',
} satisfies Meta<typeof MarkdownRendererReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeatureShowcase: Story = {};
