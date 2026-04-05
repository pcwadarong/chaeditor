# chaeditor

English | [한국어](./README.ko.md)

`chaeditor` is a composable markdown editor toolkit for React applications.
It combines authoring helpers, embed workflows, and rich markdown rendering in a single package while keeping host integration, styling, and primitive shells open to override.

## Features

- markdown authoring helpers and selection transform utilities
- preset-based toolbar composition
- rich markdown rendering for attachments, galleries, math, Mermaid, spoilers, and video
- host adapters for uploads, href resolution, image rendering, and link preview metadata
- theme variable overrides and primitive shell replacement

## Guides

- [Next.js Integration](https://github.com/pcwadarong/chaeditor/wiki/EN-%3A-Next.js-Integration)
- [Package Surface and Import Matrix](https://github.com/pcwadarong/chaeditor/wiki/EN-%3A-Package-Surface-and-Import-Matrix)
- [Architecture and Folder Ownership](https://github.com/pcwadarong/chaeditor/wiki/EN-%3A-Architecture-and-Folder-Ownership)

## Links

- [npm package](https://www.npmjs.com/package/chaeditor)
- [Storybook (Chromatic)](https://www.chromatic.com/library?appId=69cd38a84da2f3f99e158f5c)

## Installation

Install `chaeditor` once, then import only the subpaths you need.

```bash
npm install react react-dom chaeditor
pnpm add react react-dom chaeditor
yarn add react react-dom chaeditor
bun add react react-dom chaeditor
```

If you want the bundled Panda-based default styles and theme tokens, import the package CSS as well.

```tsx
import 'chaeditor/styles.css';
```

## Package Surface

`chaeditor` is published as a single npm package.
You do not install subpaths separately. Install `chaeditor` once, then selectively import the entrypoints you actually need.

| Import path                  | Provides                                                                                                            | Use when                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `chaeditor/react`            | React surfaces such as `MarkdownEditor`, `MarkdownToolbar`, `MarkdownRenderer`, and the primitive registry contract | most app integrations                                      |
| `chaeditor/core`             | pure utilities, markdown helpers, parser contracts, and `createChaeditorThemeVars()`                                | logic-only usage or server-safe helpers                    |
| `chaeditor/default-host`     | bundled default upload adapters                                                                                     | only when you want the packaged upload implementations     |
| `chaeditor/panda-primitives` | the bundled Panda-based primitive shells                                                                            | only when you want to reuse or wrap the default primitives |
| `chaeditor/styles.css`       | bundled theme tokens and component styles                                                                           | when you want the default package styling                  |

## Selective Imports

Install `chaeditor` once, then import only the subpaths you need.
`default-host` and `panda-primitives` are opt-in surfaces.

Representative examples:

### Basic editor

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const Example = () => {
  const [value, setValue] = useState('# Hello chaeditor');

  return <MarkdownEditor contentType="article" onChange={setValue} value={value} />;
};
```

### Core utilities only

```ts
import {
  createImageGalleryMarkdown,
  createMathEmbedMarkdown,
  parseRichMarkdownSegments,
} from 'chaeditor/core';
```

### Optional default host adapters

```tsx
import 'chaeditor/styles.css';

import { uploadEditorFile, uploadEditorImage, uploadEditorVideo } from 'chaeditor/default-host';
import { MarkdownEditor } from 'chaeditor/react';

const Example = () => (
  <MarkdownEditor
    adapters={{
      uploadFile: uploadEditorFile,
      uploadImage: uploadEditorImage,
      uploadVideo: uploadEditorVideo,
    }}
    contentType="article"
    onChange={() => {}}
    value=""
  />
);
```

### Optional Panda primitive reuse

```tsx
import { Button, createPandaMarkdownPrimitiveRegistry } from 'chaeditor/panda-primitives';
```

## Theme Override

The default implementation uses Panda CSS, but the public theme contract is CSS-variable based.
You can keep the package defaults as-is, or override only the values your host app actually owns.

```tsx
import 'chaeditor/styles.css';

import { createChaeditorThemeVars } from 'chaeditor/core';
import { MarkdownEditor } from 'chaeditor/react';

const themeVars = createChaeditorThemeVars({
  primary: '#0f766e',
  primarySubtle: '#ccfbf1',
  surface: '#f8fafc',
  surfaceMuted: '#eff6ff',
  text: '#0f172a',
  textSubtle: '#475569',
  sansFont: 'var(--app-font-sans), system-ui, sans-serif',
  monoFont: "var(--font-d2coding), 'D2Coding', monospace",
});

const Example = () => (
  <div style={themeVars}>
    <MarkdownEditor contentType="article" onChange={() => {}} value="" />
  </div>
);
```

Recommended font ownership:

- `sansFont`: host app sans font stack
- `sansJaFont`: optional multilingual fallback
- `monoFont`: optional host mono stack, otherwise the built-in D2Coding fallback chain is used

## Styling Runtime Recipes

The default package styling runtime is Panda CSS.
Host-side styling recipes are only needed when the host app wants to override variables or replace primitive shells.

Available examples:

- Tailwind CSS
- Emotion
- styled-components
- vanilla-extract
- primitive shell replacement

Ready-to-adapt host wrapper templates are available in [recipes/host-presets](./recipes/host-presets/README.md).

## Primitive Shell Replacement

Theme variables are enough for colors, fonts, and semantic tokens.
If you need to replace the actual `Button`, `Input`, `Textarea`, `Popover`, `Modal`, or `Tooltip` shells, use `primitiveRegistry`.

```tsx
import 'chaeditor/styles.css';

import { MarkdownEditor } from 'chaeditor/react';

const HostButton = props => (
  <button {...props} className={`host-button ${props.className ?? ''}`.trim()} />
);

const HostInput = props => (
  <input {...props} className={`host-input ${props.className ?? ''}`.trim()} />
);

const HostTextarea = props => (
  <textarea {...props} className={`host-textarea ${props.className ?? ''}`.trim()} />
);

const HostPopover = props => (
  <Popover
    {...props}
    panelClassName={`host-popover-panel ${props.panelClassName ?? ''}`.trim()}
    triggerClassName={`host-popover-trigger ${props.triggerClassName ?? ''}`.trim()}
  />
);

const HostModal = props => (
  <Modal
    {...props}
    backdropClassName={`host-modal-backdrop ${props.backdropClassName ?? ''}`.trim()}
    closeButtonClassName={`host-modal-close ${props.closeButtonClassName ?? ''}`.trim()}
    frameClassName={`host-modal-frame ${props.frameClassName ?? ''}`.trim()}
  />
);

const HostTooltip = props => (
  <Tooltip
    {...props}
    contentClassName={`host-tooltip ${props.contentClassName ?? ''}`.trim()}
    portalClassName={`host-tooltip-portal ${props.portalClassName ?? ''}`.trim()}
  />
);

const Example = () => (
  <MarkdownEditor
    contentType="article"
    onChange={() => {}}
    primitiveRegistry={{
      Button: HostButton,
      Input: HostInput,
      Modal: HostModal,
      Popover: HostPopover,
      Textarea: HostTextarea,
      Tooltip: HostTooltip,
    }}
    value=""
  />
);
```

Rule of thumb:

- `createChaeditorThemeVars()` changes semantic tokens
- `primitiveRegistry` changes shell components

## Local Development

```bash
pnpm install
pnpm lint
pnpm check-types
pnpm build
pnpm test
```

## Contributing

If you want to contribute, see [CONTRIBUTING.md](./CONTRIBUTING.md).
