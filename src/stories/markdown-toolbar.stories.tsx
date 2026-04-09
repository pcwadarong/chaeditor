import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css } from 'styled-system/css';

import type { EditorContentType } from '@/entities/editor-core/model/content-types';
import { MarkdownToolbar } from '@/react';
import { Textarea } from '@/shared/ui/textarea/textarea';
import { createStorybookAdapterSet } from '@/stories/support/storybook-adapters';
import { toolbarPackageUsageSnippet } from '@/stories/support/storybook-code-snippets';
import { StorybookGuideList, StorybookPageHeader } from '@/stories/support/storybook-docs';
import {
  pageClass,
  panelClass,
  StorybookReferenceInvariantSection,
  StorybookSectionCard,
} from '@/stories/support/storybook-reference-ui';

type ToolbarReferenceProps = {
  contentType: EditorContentType;
  initialValue: string;
};

const ToolbarReference = ({ contentType, initialValue }: ToolbarReferenceProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState(initialValue);
  const adapters = React.useMemo(() => createStorybookAdapterSet('full'), []);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <main className={pageClass}>
      <StorybookPageHeader
        description="Use this page when you want to review the command surface on its own: visible labels, helper entrypoints, insertion behavior, and textarea wiring. If you need adapter-by-adapter helper comparison, use EmbedWorkflows instead."
        title="Inspect the standalone command surface before you embed it into your shell"
      />

      <section className={panelClass}>
        <StorybookSectionCard
          description="This page is about direct command interaction, not adapter comparison. Use it to decide whether the toolbar layout and insertion behavior already fit your product shell."
          eyebrow="Toolbar scope"
          title="What this page helps you inspect"
        >
          <StorybookGuideList
            items={[
              {
                body: 'The toolbar stays mounted with its full command order, grouping, and helper triggers intact.',
                eyebrow: 'Commands',
                title: 'Action order and visible command density',
              },
              {
                body: 'The textarea below uses the same insertion contract as the package shell, so you can inspect real command-to-markdown behavior.',
                eyebrow: 'Interaction',
                title: 'Textarea wiring and markdown insertion',
              },
              {
                body: 'Helper entrypoints are available in context, but this page does not repeat detailed adapter comparisons that already live in EmbedWorkflows.',
                eyebrow: 'Helpers',
                title: 'Popover and modal triggers in a focused shell',
              },
            ]}
          />
        </StorybookSectionCard>

        <StorybookSectionCard
          description="This is the mounted toolbar plus textarea with the default Storybook adapter set behind it. Use it to inspect interaction flow and visible command structure."
          eyebrow="Mounted surface"
          title="Interactive toolbar surface"
        >
          <div className={toolbarSurfaceClass}>
            <MarkdownToolbar
              adapters={adapters}
              contentType={contentType}
              onChange={setValue}
              textareaRef={textareaRef}
            />
            <Textarea
              aria-label="Toolbar story input"
              autoResize={false}
              onChange={event => setValue(event.target.value)}
              placeholder="Use the toolbar to insert markdown"
              ref={textareaRef}
              rows={14}
              value={value}
            />
          </div>
        </StorybookSectionCard>

        <StorybookReferenceInvariantSection
          description="These guarantees define the toolbar surface regardless of how the host later changes adapters behind helper flows."
          eyebrow="Invariant contract"
          items={[
            'Same toolbar layout and action order',
            'Same markdown insertion contract',
            'Same textarea editing surface',
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
      control: 'text',
    },
  },
  args: {
    contentType: 'article',
    initialValue: '',
  },
  component: ToolbarReference,
  parameters: {
    docs: {
      source: {
        code: toolbarPackageUsageSnippet,
      },
    },
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Reference/MarkdownToolbar',
} satisfies Meta<typeof ToolbarReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const toolbarSurfaceClass = css({
  display: 'grid',
  gap: '4',
});
