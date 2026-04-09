# Package Surface and Import Matrix

English | [한국어](./ko/package-surface-and-import-matrix.md)

This page explains what each published entrypoint is for and when to import it.

## Installation model

Install `chaeditor` once.
Do not treat subpaths as separately installed packages.

```bash
npm install react react-dom chaeditor
```

Then import only the entrypoints you need.
For application code, prefer `chaeditor/react` and `chaeditor/core` over the root `chaeditor` entrypoint.

## Entry points

| Import path | What it contains | Typical use | Optional |
| --- | --- | --- | --- |
| `chaeditor/react` | React components and registries | editor, renderer, toolbar integration | no |
| `chaeditor/core` | pure helpers and public contracts | markdown utilities, theme vars, server-safe logic | no |
| `chaeditor/default-host` | bundled upload adapters plus optional host-adapter helpers such as `createDefaultHostAdapters()` | quick start, demos, or route-convention wiring | yes |
| `chaeditor/panda-primitives` | bundled Panda primitive shells | reuse or wrap package default primitives | yes |
| `chaeditor/styles.css` | bundled styles, theme tokens, KaTeX styles, and KaTeX fonts | safest default styling path | yes |
| `chaeditor/styles-lite.css` | bundled styles and theme tokens without KaTeX runtime styles | lighter styling path when the host owns KaTeX CSS or does not render math | yes |

## CSS entrypoints

### `chaeditor/styles.css`

Use this when:

- you want the package defaults to work without extra setup
- you render math
- you do not want to manage KaTeX CSS and fonts separately

### `chaeditor/styles-lite.css`

Use this when:

- your app does not render math
- your app already imports `katex/dist/katex.min.css`
- you intentionally want the lighter CSS bundle

If you use `chaeditor/styles-lite.css` and render math, also import:

```tsx
import 'katex/dist/katex.min.css';
```

## Recommended combinations

### Basic editor

- `chaeditor/react`
- `chaeditor/styles.css`

### Basic editor with lighter CSS

- `chaeditor/react`
- `chaeditor/styles-lite.css`
- `katex/dist/katex.min.css` when math is rendered

### Renderer only

- `chaeditor/react`
- `chaeditor/styles.css`

### Logic only

- `chaeditor/core`

### Editor with bundled upload adapters

- `chaeditor/react`
- `chaeditor/default-host`
- `chaeditor/styles.css`

### Host design system integration

- `chaeditor/react`
- `chaeditor/core`
- optional `chaeditor/styles.css`
- no need to import `chaeditor/panda-primitives` unless you explicitly want the bundled Panda shells

## Tree-shaking expectation

Selective usage is based on:

- subpath imports
- bundler tree-shaking

It is not based on installing multiple npm packages.
The root `chaeditor` import is kept for compatibility, but it is not the path to recommend in examples or app code.

## Import examples

### React surface

```tsx
import { MarkdownEditor, MarkdownRenderer, MarkdownToolbar } from 'chaeditor/react';
```

### Core helpers

```ts
import { createChaeditorThemeVars, parseRichMarkdownSegments } from 'chaeditor/core';
```

### Default host adapters

```ts
import { createDefaultHostAdapters } from 'chaeditor/default-host';

const adapters = createDefaultHostAdapters();
```

### Panda primitives

```ts
import { Button, createPandaMarkdownPrimitiveRegistry } from 'chaeditor/panda-primitives';
```
