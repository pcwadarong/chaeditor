# chaeditor

English | [한국어](./README.ko.md)

Build composable markdown editors for React with authoring helpers, rich embeds, and overridable styling.
`chaeditor` ships as one package. Use subpath imports like `chaeditor/react` and `chaeditor/core` to pull in only what you need.

## Links

- [npm package](https://www.npmjs.com/package/chaeditor)
- [Storybook (Chromatic)](https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c)

## Guides

Recommended order:

- [Integrating chaeditor in Next.js](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)
- [Styling and CSS setup](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)
- [Replacing default UI primitives](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)
- [Choosing import paths](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)
- [Release checklist](https://github.com/pcwadarong/chaeditor/wiki/릴리즈-전-체크리스트)
- [Internal structure and folder ownership](https://github.com/pcwadarong/chaeditor/wiki/내부-구조와-폴더-역할)

If you are integrating for the first time, start with the Next.js guide.
If uploads, image insertion, preview cards, or route wiring are part of the job, the wiki is more useful than the README alone.
If you are using React but do not need a Next.js-specific walkthrough, open `Introduction / Host Adapters` in Storybook first.

## Quick Start

Choose the integration path that matches your current scope.

### Renderer only

Use this when you only need markdown display.

```tsx
import 'chaeditor/styles.css';

import { MarkdownRenderer } from 'chaeditor/react';

const Example = async () => {
  return <MarkdownRenderer markdown="# Hello chaeditor" />;
};
```

### Editor without host adapters

Use this to try out text input, toolbar actions, and preview before wiring up any upload logic.

```tsx
'use client';

import { useState } from 'react';

import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => {
  const [value, setValue] = useState('# Hello chaeditor');

  return <MarkdownEditor contentType="article" onChange={setValue} value={value} />;
};
```

### Full integration

Use this when you need uploads, attachments, videos, and preview cards.

```tsx
'use client';

import { useState } from 'react';

import 'chaeditor/styles.css';

import { createDefaultHostAdapters } from 'chaeditor/default-host';
import { MarkdownEditor } from 'chaeditor/react';

const adapters = createDefaultHostAdapters();

const Example = () => {
  const [value, setValue] = useState('');

  return (
    <MarkdownEditor adapters={adapters} contentType="article" onChange={setValue} value={value} />
  );
};
```

Then follow [Integrating chaeditor in Next.js](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기) to create the expected host routes and verify the real app flow.

## Host Adapter Checklist

`chaeditor` keeps upload logic, preview metadata, and framework-specific rendering out of the package — those belong to your app.
This is what makes the package reusable across different products without modifications.

For most React apps, a solid editor integration covers these adapters:

| Adapter                 | Unlocks                                     | If omitted                                                                        | Typical decision                                                                                  |
| ----------------------- | ------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `uploadImage`           | file-backed image insertion in editor flows | image upload UI can render, but file-backed insertion needs a host implementation | add this if users should upload images from the editor                                            |
| `uploadFile`            | attachment upload                           | attachment UI can still appear, but upload-specific actions should stay disabled  | add this if attachments are part of your content model                                            |
| `uploadVideo`           | video file upload                           | video helpers can fall back to URL-based insertion                                | add this only when your product supports video uploads                                            |
| `fetchLinkPreviewMeta`  | rich link preview cards                     | preview cards fall back to plain links                                            | add this if OG-style previews matter                                                              |
| `resolveAttachmentHref` | host-aware attachment URLs                  | renderer uses markdown href as-is                                                 | add this when stored files resolve through your app routing or CDN rules                          |
| `renderImage`           | framework-specific image primitive          | package uses its default image renderer                                           | optional, but recommended when your app standardizes on `next/image` or a branded media primitive |
| `imageViewerLabels`     | built-in viewer copy override               | package uses built-in labels                                                      | optional label override only                                                                      |

For most products, the following combination covers the baseline host integration:

- `uploadImage`
- `uploadFile`
- `uploadVideo` if your product supports uploaded video
- `fetchLinkPreviewMeta`
- `resolveAttachmentHref`
- `renderImage` if image rendering consistency matters in your app

A React-first adapter example:

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const adapters = {
  uploadImage: async ({ contentType, file, imageKind }) => {
    return uploadImageToYourApi({ contentType, file, imageKind });
  },
  uploadFile: async ({ contentType, file }) => {
    return uploadFileToYourApi({ contentType, file });
  },
  uploadVideo: async ({ contentType, file, onProgress, signal }) => {
    return uploadVideoToYourApi({ contentType, file, onProgress, signal });
  },
  fetchLinkPreviewMeta: async (url, signal) => {
    return fetchPreviewMetaFromYourApi(url, signal);
  },
  resolveAttachmentHref: ({ href }) => href,
  renderImage: ({ alt, className, fill, sizes, src }) => (
    <img
      alt={alt}
      className={className}
      sizes={sizes}
      src={typeof src === 'string' ? src : src.src}
      style={fill ? { inset: 0, position: 'absolute' } : undefined}
    />
  ),
};
```

For a deeper look at the adapter contract, read `Introduction / Host Adapters` in Storybook.

## Installation

Install `chaeditor` once, then import only the subpaths you need.
For most app code, `chaeditor/react` and `chaeditor/core` are the right starting points.
The root `chaeditor` entrypoint still works, but it mixes React and core exports into one surface — use the subpaths above instead.

```bash
npm install react react-dom chaeditor
pnpm add react react-dom chaeditor
yarn add react react-dom chaeditor
bun add react react-dom chaeditor
```

### CSS choice

| Entry                       | Use when                                                   | Includes                                                |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `chaeditor/styles.css`      | you want the safest default, or you render math            | package styles, Panda output, KaTeX styles, KaTeX fonts |
| `chaeditor/styles-lite.css` | you intentionally own KaTeX CSS, or you do not render math | package styles without KaTeX runtime styles             |

Recommended default:

```tsx
import 'chaeditor/styles.css';
```

Lighter option:

```tsx
import 'chaeditor/styles-lite.css';
```

If you choose `styles-lite.css` and render math, also import:

```tsx
import 'chaeditor/styles-lite.css';
import 'katex/dist/katex.min.css';
```

See [Styling and CSS setup](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기) for a fuller decision guide and consumer-side checklists.

## Package Surface

`chaeditor` is one npm package with selective subpath imports.
You do not install subpaths separately.

| Import path                  | Provides                                                                      | Use when                                               |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `chaeditor/react`            | `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer`, and React registries | most app integrations                                  |
| `chaeditor/core`             | pure helpers, markdown contracts, and theme utilities                         | logic-only usage or server-safe helpers                |
| `chaeditor/default-host`     | packaged upload and preview helpers                                           | quick start, demos, or route-convention wiring         |
| `chaeditor/panda-primitives` | packaged Panda primitive shells                                               | only when you want to reuse or wrap the default shells |
| `chaeditor/styles.css`       | full default CSS bundle                                                       | safest styling path                                    |
| `chaeditor/styles-lite.css`  | lighter default CSS bundle                                                    | when your app owns KaTeX styling                       |

For the full breakdown, read [Choosing import paths](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나).

## What To Read Next

- Need a practical app-router walkthrough: [Integrating chaeditor in Next.js](https://github.com/pcwadarong/chaeditor/wiki/Next.js에서-chaeditor-붙이기)
- Need help choosing `styles.css` vs `styles-lite.css`: [Styling and CSS setup](https://github.com/pcwadarong/chaeditor/wiki/스타일-붙이기)
- Need to replace package UI shells with your own design system: [Replacing default UI primitives](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기)
- Need to choose imports or entrypoints: [Choosing import paths](https://github.com/pcwadarong/chaeditor/wiki/무엇을-어디서-import하면-되나)
- Need the pre-release smoke-test flow: [Release checklist](https://github.com/pcwadarong/chaeditor/wiki/릴리즈-전-체크리스트)
- Need ready-to-adapt wrappers for Tailwind, Emotion, styled-components, or vanilla-extract: [Host Preset Templates](./recipes/host-presets/README.md)
- Need a React-first explanation of adapters before you open framework-specific docs: `Introduction / Host Adapters` in Storybook

## Theme And Host Customization

`chaeditor` separates theme overrides from host-owned integration logic.

- Use `createChaeditorThemeVars()` when you want to override semantic tokens such as `primary`, `surface`, `text`, or font stacks.
- Use `primitiveRegistry` when you need to replace the actual `Button`, `Input`, `Textarea`, `Popover`, `Modal`, or `Tooltip` shells.
- Use `createDefaultHostAdapters()` or custom adapters when uploads, href resolution, image rendering, or link preview metadata belong to your app layer.

Minimal theme override example:

```tsx
import 'chaeditor/styles.css';

import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const themeVars = createChaeditorThemeVars({
  primary: '#0f766e',
  primarySubtle: '#ccfbf1',
  surface: '#f8fafc',
  text: '#0f172a',
  sansFont: 'var(--app-font-sans), system-ui, sans-serif',
});

const Example = () => (
  <div style={themeVars}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

The full primitive replacement walkthrough lives in [Replacing default UI primitives](https://github.com/pcwadarong/chaeditor/wiki/기본-UI-컴포넌트-교체하기).

## Local Development

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm run verify:package-surface
```

If a change is visual or touches docs-facing examples, also run:

```bash
pnpm storybook
```

## Reporting Issues

Before opening a new issue, check whether the same problem is already reported.
Bug reports are much easier to act on when they include:

- package version
- framework or runtime version
- a clear reproduction path
- error text or screenshots when relevant
- whether the bug happens in the real app, Storybook, or only after packing

## Contributing

If you want to contribute, start with [CONTRIBUTING.md](./CONTRIBUTING.md).
