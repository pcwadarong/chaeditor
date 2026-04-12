import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MarkdownHooks } from 'react-markdown';
import { css } from 'styled-system/css';

import type { MarkdownImageViewerItem } from '@/entities/editor-core/model/collect-markdown-images';
import { collectMarkdownImages } from '@/entities/editor-core/model/collect-markdown-images';
import { getMarkdownOptions } from '@/shared/lib/markdown/markdown-config';
import { markdownBodyClass } from '@/shared/lib/markdown/markdown-styles.panda';
import { renderRichMarkdown } from '@/shared/lib/markdown/rich-markdown';
import { MarkdownGallery } from '@/shared/ui/markdown';
import {
  StorybookDocsHero,
  storybookDocsPageClass,
  storybookDocsSectionClass,
  StorybookDocsSectionHeader,
  StorybookGuideList,
} from '@/stories/support/storybook-docs';

const galleryItems: MarkdownImageViewerItem[] = [
  {
    alt: 'Editorial workspace',
    src: 'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/45790887-356d-48fd-bf23-6a761d4be524-230805000132660005.jpg',
    viewerId: 'complex-gallery-0',
  },
  {
    alt: 'Renderer preview',
    src: 'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/9f5108c5-3d52-49b2-ac29-da15fbbc1dee-135.jpg',
    viewerId: 'complex-gallery-1',
  },
  {
    alt: 'Code reference',
    src: 'https://mixqdwtiwlaolgocdwkx.supabase.co/storage/v1/object/public/photo/e9332863-9d66-4cd5-8368-79382845162a-010.jpg',
    viewerId: 'complex-gallery-2',
  },
];

const codeBlockMarkdown = [
  '```tsx',
  "import { MarkdownEditor } from 'chaeditor/react';",
  '',
  'export const ArticleEditor = () => (',
  '  <MarkdownEditor',
  '    contentType="article"',
  '    onChange={() => {}}',
  '    value="# Draft"',
  '  />',
  ');',
  '```',
].join('\n');

const ownershipGuide = [
  {
    body: 'Keep the package default when you want a capable default for markdown image browsing and only need the package to handle gallery navigation, zoom, and lightbox behavior. Consider host ownership when you need routing-aware deep links, product-specific toolbar actions, a branded zoom shell, or a modal system that must match the rest of your app exactly.',
    eyebrow: 'Gallery and viewer',
    surface: 'Gallery slider + image viewer modal',
  },
  {
    body: 'Keep the package default when you mainly need readable fenced blocks and language labels inside markdown output without inventing another rendering pipeline. Consider host ownership when your product needs syntax-theme parity with an existing docs site, custom copy actions, code annotations, executable snippets, or a different scroll shell.',
    eyebrow: 'Code blocks',
    surface: 'Renderer code blocks',
  },
] as const;

const RendererCodeBlockSpecimen = () => {
  const markdownOptions = React.useMemo(
    () =>
      getMarkdownOptions({
        items: collectMarkdownImages(codeBlockMarkdown),
      }),
    [],
  );

  return (
    <div className={markdownBodyClass}>
      {renderRichMarkdown({
        markdown: codeBlockMarkdown,
        renderMarkdownFragment: (fragmentMarkdown, key) => (
          <MarkdownHooks key={key} {...markdownOptions}>
            {fragmentMarkdown}
          </MarkdownHooks>
        ),
      })}
    </div>
  );
};

const ComplexSurfacesPage = () => (
  <main className={storybookDocsPageClass}>
    <StorybookDocsHero
      description="This page is for UI judgment, not deep implementation details. It shows what the package already gives you for galleries, image viewing, and code blocks so you can decide whether the defaults are already good enough or whether the host app should take ownership."
      title="Review the heavier built-in UI before you decide to replace it."
    />

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="The package already ships a slider-style gallery and a capable image viewer modal. Clicking any image opens the viewer, so you can judge whether the default interaction model is already good enough for your product."
        eyebrow="Gallery and viewer"
        title="Default image browsing surfaces"
      />

      <div className={surfaceFrameClass}>
        <MarkdownGallery galleryId="complex-surfaces-gallery" items={galleryItems} />
        <p className={surfaceNoteClass}>
          Keep this default when the interaction model already fits. Replace it when routing,
          branding, or product-specific actions must be part of the viewer.
        </p>
      </div>
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="Code blocks are rendered as part of the markdown pipeline, so the visual question is less about one isolated component and more about whether the package default fits your reading experience well enough."
        eyebrow="Code blocks"
        title="Package-rendered fenced code blocks"
      />

      <div className={surfaceFrameClass}>
        <RendererCodeBlockSpecimen />
        <p className={surfaceNoteClass}>
          Keep this default when readable fenced blocks are enough. Take ownership when your docs
          experience needs annotations, richer controls, or a different presentation shell.
        </p>
      </div>
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="This page is enough for the first pass. If the default surface is already visually and behaviorally acceptable, keep it. If the gap changes product behavior, routing, or the surrounding shell, host ownership becomes more reasonable."
        eyebrow="Ownership guide"
        title="Keep, extend, or replace?"
      />
      <StorybookGuideList
        items={ownershipGuide.map(item => ({
          body: item.body,
          eyebrow: item.eyebrow,
          title: item.surface,
        }))}
      />
    </section>
  </main>
);

const meta = {
  component: ComplexSurfacesPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Introduction/Complex Surfaces',
} satisfies Meta<typeof ComplexSurfacesPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

const surfaceFrameClass = css({
  backgroundColor: 'surface',
  border: '[1px solid var(--colors-border)]',
  borderRadius: '2xl',
  boxShadow: '[0 24px 48px rgb(15 23 42 / 0.06)]',
  display: 'flex',
  flexDirection: 'column',
  gap: '5',
  overflow: 'hidden',
  padding: '5',
});

const surfaceNoteClass = css({
  color: 'textSubtle',
  fontSize: 'sm',
  lineHeight: 'loose',
  maxWidth: 'full',
});
