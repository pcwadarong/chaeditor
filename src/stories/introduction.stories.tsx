import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { css } from 'styled-system/css';

import { MarkdownEditor } from '@/react';
import {
  StorybookDocsHero,
  storybookDocsPageClass,
  storybookDocsSectionClass,
  StorybookDocsSectionHeader,
  StorybookGuideList,
} from '@/stories/support/storybook-docs';

const overviewSampleMarkdown = [
  '# chaeditor overview',
  '',
  'Start here to understand the real editor surface before you move into the deeper reference stories.',
  '',
  '- Write markdown',
  '- Preview rich output',
  '- Add host behavior later',
].join('\n');

const overviewGuideSections = [
  {
    body: 'Start here if you want to understand the core authoring surface. These stories show the mounted editor, toolbar composition, and embed helpers before you wire in your own backend contracts.',
    eyebrow: 'Editor surface',
    stories: [
      {
        href: './?path=/docs/reference-markdowneditor--docs',
        label: 'Open MarkdownEditor',
      },
      {
        href: './?path=/docs/reference-markdowntoolbar--docs',
        label: 'Open MarkdownToolbar',
      },
      {
        href: './?path=/docs/reference-embedworkflows--docs',
        label: 'Open EmbedWorkflows',
      },
    ],
    title: 'Build the writing flow your product actually needs',
  },
  {
    body: 'Use the renderer stories when you need to see what the markdown pipeline supports after content leaves the editor. This is where galleries, attachments, math, Mermaid, and preview cards come together.',
    eyebrow: 'Renderer',
    stories: [
      {
        href: './?path=/docs/reference-markdownrenderer--docs',
        label: 'Open MarkdownRenderer',
      },
    ],
    title: 'See what the markdown pipeline can render',
  },
  {
    body: 'Use this page when you understand React already, but still need a direct explanation of which adapters unlock uploads, preview cards, attachment routing, and framework-specific image rendering.',
    eyebrow: 'Host adapters',
    stories: [
      {
        href: './?path=/docs/introduction-host-adapters--docs',
        label: 'Open Host Adapters',
      },
    ],
    title: 'See which adapters you actually need for a complete integration',
  },
  {
    body: 'Use this page when you want to inspect the heavier built-in surfaces such as the gallery slider, the default image viewer modal, and package-rendered code blocks before deciding whether the host app should replace them.',
    eyebrow: 'Complex surfaces',
    stories: [
      {
        href: './?path=/docs/introduction-complex-surfaces--docs',
        label: 'Open Complex Surfaces',
      },
    ],
    title: 'Review the defaults for advanced UI before you override them',
  },
  {
    body: 'Styling stories explain how much the package owns by default and where the host app takes over. Read them before you replace primitives or inject your own theme tokens.',
    eyebrow: 'Styling and ownership',
    stories: [
      {
        href: './?path=/docs/introduction-styling-recipes--docs',
        label: 'Open Styling Recipes',
      },
      {
        href: './?path=/docs/introduction-theme-contract--docs',
        label: 'Open Theme Contract',
      },
    ],
    title: 'Review the defaults for advanced UI before you override them',
  },
] as const;

const IntroEditorDemo = () => {
  const [value, setValue] = React.useState(overviewSampleMarkdown);

  return (
    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="This keeps one real `MarkdownEditor` mounted without host adapters. It stays lighter than the full reference story, but still shows the actual package surface instead of a mock shell."
        eyebrow="Quick look"
        title="A minimal live editor mount"
      />
      <div className={editorDemoFrameClass}>
        <div className={editorDemoHeaderClass}>
          <p className={editorDemoHeaderTitleClass}>Core-only editor preview</p>
          <div className={storyChipRowClass}>
            {['chaeditor/react', 'no host adapters', 'article mode'].map(chip => (
              <span key={chip} className={storyChipClass}>
                {chip}
              </span>
            ))}
          </div>
        </div>
        <MarkdownEditor
          className={editorDemoEditorClass}
          contentType="article"
          onChange={setValue}
          previewEmptyText="Nothing to preview yet."
          placeholder="Write markdown content"
          value={value}
        />
      </div>
    </section>
  );
};

const OverviewPage = () => (
  <main className={storybookDocsPageClass}>
    <StorybookDocsHero
      description="chaeditor is a React-first toolkit for markdown authoring and rendering. It gives you a real editor surface, a richer markdown pipeline, and clear seams for uploads, previews, theming, and primitive replacement without forcing one fixed app shell."
      title="Start with markdown editing. Layer in host behavior only when you need it."
    />

    <IntroEditorDemo />

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="This page is the entry point, not the full reference. Use it to decide which story to open next based on whether you are evaluating the editor surface, renderer output, or host-owned integration boundaries."
        eyebrow="What you'll find here"
        title="A guided map of the package surface"
      />
      <StorybookGuideList
        items={overviewGuideSections.map(section => ({
          actions: section.stories,
          body: section.body,
          eyebrow: section.eyebrow,
          title: section.title,
        }))}
      />
    </section>
  </main>
);

const meta = {
  component: OverviewPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Introduction/Overview',
} satisfies Meta<typeof OverviewPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

const editorDemoFrameClass = css({
  backgroundColor: 'surface',
  borderRadius: '2xl',
  boxShadow: '[0 24px 48px rgb(15 23 42 / 0.06)]',
  display: 'grid',
  overflow: 'hidden',
});

const editorDemoHeaderClass = css({
  alignItems: 'center',
  backgroundColor: 'surfaceMuted',
  borderBottom: '[1px solid var(--colors-border)]',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3',
  justifyContent: 'space-between',
  paddingInline: '5',
  paddingY: '4',
});

const editorDemoEditorClass = css({
  '& [data-slot="body"]': {
    paddingBottom: '5',
    paddingInline: '5',
  },
});

const editorDemoHeaderTitleClass = css({
  color: 'text',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const storyChipRowClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  paddingTop: '1',
});

const storyChipClass = css({
  alignItems: 'center',
  backgroundColor: 'surfaceMuted',
  border: '[1px solid var(--colors-border)]',
  borderRadius: 'full',
  color: 'text',
  display: 'inline-flex',
  fontFamily: 'mono',
  fontSize: 'xs',
  minHeight: '8',
  paddingInline: '3',
});
