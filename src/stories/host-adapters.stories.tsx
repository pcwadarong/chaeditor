import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { css } from 'styled-system/css';

import {
  StorybookBulletList,
  StorybookDocsHero,
  storybookDocsPageClass,
  storybookDocsSectionClass,
  StorybookDocsSectionHeader,
  StorybookGuideList,
} from '@/stories/support/storybook-docs';
import { StorybookCodeBlock } from '@/stories/support/storybook-reference-ui';

const minimalAdapterSnippet = [
  "import 'chaeditor/styles.css';",
  '',
  "import { MarkdownEditor } from 'chaeditor/react';",
  '',
  'const adapters = {',
  '  uploadImage: async ({ contentType, file, imageKind }) => {',
  '    const url = await uploadImageToYourApi({ contentType, file, imageKind });',
  '    return url;',
  '  },',
  '  uploadFile: async ({ contentType, file }) => {',
  '    return uploadFileToYourApi({ contentType, file });',
  '  },',
  '  uploadVideo: async ({ contentType, file, onProgress, signal }) => {',
  '    return uploadVideoToYourApi({ contentType, file, onProgress, signal });',
  '  },',
  '  fetchLinkPreviewMeta: async (url, signal) => {',
  '    return fetchPreviewMetaFromYourApi(url, signal);',
  '  },',
  '  resolveAttachmentHref: ({ href }) => href,',
  '};',
  '',
  'const Example = () => (',
  '  <MarkdownEditor',
  '    adapters={adapters}',
  '    contentType="article"',
  '    onChange={() => {}}',
  '    value=""',
  '  />',
  ');',
].join('\n');

const nextImageAdapterSnippet = [
  'const adapters = {',
  '  renderImage: ({ alt, className, fill, sizes, src }) => (',
  '    <Image',
  '      alt={alt}',
  '      className={className}',
  '      fill={fill}',
  '      sizes={sizes}',
  "      src={typeof src === 'string' ? src : src.src}",
  '    />',
  '  ),',
  '};',
].join('\n');

const adapterBodyTextClass = css({
  color: 'textSubtle',
  fontSize: 'lg',
  lineHeight: 'loose',
});

const adapterStatusClass = css({
  color: 'primary',
  fontFamily: "['Manrope',system-ui,sans-serif]",
  fontSize: 'md',
  fontWeight: 'semibold',
  lineHeight: 'relaxed',
  paddingTop: '1',
});

const adapterRows = [
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: Image upload UI can render, but file-backed image insertion needs a host
          implementation.
        </p>
        <p className={adapterStatusClass}>Needed for a complete editor upload experience</p>
      </>
    ),
    eyebrow: 'uploadImage',
    title: 'Image file upload in editor flows',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: Attachment UI can still appear, but upload-specific actions should stay
          disabled without this adapter.
        </p>
        <p className={adapterStatusClass}>
          Needed if the editor should handle real file attachments
        </p>
      </>
    ),
    eyebrow: 'uploadFile',
    title: 'Attachment upload',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: Video helpers can fall back to URL-based insertion instead of file upload.
        </p>
        <p className={adapterStatusClass}>Needed only if you want file-based video upload</p>
      </>
    ),
    eyebrow: 'uploadVideo',
    title: 'Video upload',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>If omitted: Preview cards fall back to plain links.</p>
        <p className={adapterStatusClass}>Needed if you want rich OG-style previews</p>
      </>
    ),
    eyebrow: 'fetchLinkPreviewMeta',
    title: 'Link preview cards',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: The renderer uses the original markdown href as-is.
        </p>
        <p className={adapterStatusClass}>
          Needed when stored attachment URLs must be resolved through host routing
        </p>
      </>
    ),
    eyebrow: 'resolveAttachmentHref',
    title: 'Attachment URL resolution',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: The package uses its default img-based renderer.
        </p>
        <p className={adapterStatusClass}>
          Optional, but recommended when the app standardizes on Next Image or another host
          primitive
        </p>
      </>
    ),
    eyebrow: 'renderImage',
    title: 'Framework-specific image rendering',
  },
  {
    body: (
      <>
        <p className={adapterBodyTextClass}>
          If omitted: The package uses built-in English labels.
        </p>
        <p className={adapterStatusClass}>Optional label override only</p>
      </>
    ),
    eyebrow: 'imageViewerLabels',
    title: 'Built-in image viewer labels',
  },
] as const;

const HostAdaptersPage = () => (
  <main className={storybookDocsPageClass}>
    <StorybookDocsHero
      description="This page explains which adapters exist, what breaks or falls back when they are omitted, and which ones you should wire in if you want the editor surface to feel complete inside a real React application."
      title="React integration needs a clearer adapter checklist than “the host owns it.”"
    />

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="Upload targets, preview metadata, attachment routing, and framework-specific image primitives depend on your app stack. That is why the editor accepts host adapters instead of hard-coding storage, APIs, or image components into the package."
        eyebrow="What the host should own"
        title="The package stays reusable by keeping product wiring outside."
      />
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="Use this matrix when you are deciding which adapters are mandatory for your app and which ones can stay optional for now."
        eyebrow="Adapter matrix"
        title="Which adapters are optional and which ones unlock real product behavior?"
      />
      <StorybookGuideList items={adapterRows} />
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="For most real apps, the practical baseline is `uploadImage`, `uploadFile`, `uploadVideo`, `fetchLinkPreviewMeta`, and `resolveAttachmentHref`. Add `renderImage` when your app already relies on a framework image primitive or a branded image shell."
        eyebrow="Recommended baseline"
        title="What to add if you want the editor to feel fully connected"
      />
      <StorybookCodeBlock code={minimalAdapterSnippet} label="Minimal complete adapter set" />
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="If your app uses Next Image, a CDN wrapper, or a branded media primitive everywhere else, wire that same primitive into the editor and renderer through `renderImage`. Without it, the package falls back to its default image renderer."
        eyebrow="Framework image ownership"
        title="`renderImage` is not mandatory, but it is often the first visual override."
      />
      <StorybookCodeBlock code={nextImageAdapterSnippet} label="Framework image renderer" />
    </section>

    <section className={storybookDocsSectionClass}>
      <StorybookDocsSectionHeader
        description="Use this checklist when you want a quick yes-no answer about whether your integration is still package-only or already host-backed."
        eyebrow="A complete integration usually means"
        title="The package is mounted, but the app is now clearly in charge."
      />
      <StorybookBulletList
        items={[
          'Image upload inserts a real hosted URL, not just a local demo path.',
          'Attachment links resolve through the same routing rules as the rest of the product.',
          'Link embeds show product-backed preview metadata instead of plain links.',
          'Video upload either works through the host or is intentionally left as URL-only insertion.',
          'Images render through the same primitive your app uses elsewhere, if that consistency matters.',
        ]}
      />
    </section>
  </main>
);

const meta = {
  component: HostAdaptersPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs', '!dev'],
  title: 'Introduction/Host Adapters',
} satisfies Meta<typeof HostAdaptersPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
