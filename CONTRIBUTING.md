# Contributing to chaeditor

English | [한국어](./CONTRIBUTING.ko.md)

Thank you for considering a contribution to `chaeditor`.
This document explains the expected workflow, documentation rules, and review expectations for this repository.

## Communication

- Issues and pull requests may be written in English or Korean.
- Keep problem statements concrete and implementation notes short.
- When possible, explain user-facing impact before internal refactoring details.

## Before You Start

1. Confirm that a similar issue or pull request does not already exist.
2. Open or reference an issue when the change is large enough to need discussion.
3. Prefer small, reviewable pull requests over broad refactors.

## Local Setup

This repository uses `pnpm`.

```bash
pnpm install
```

Common checks:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm run verify:package-surface
```

Storybook:

```bash
pnpm storybook
pnpm build-storybook
```

## Repository Expectations

### 1. Package surface

`chaeditor` is published as one package with selective subpath imports.
Keep the published surface intentional:

- `chaeditor/react`
- `chaeditor/core`
- `chaeditor/default-host`
- `chaeditor/panda-primitives`
- `chaeditor/styles.css`

If you change public exports, update both:

- `package.json`
- `README.md` and `README.ko.md`

### 2. Styling

- The bundled default styling runtime is Panda CSS.
- Host-side overrides must continue to work through:
  - CSS variable theme overrides
  - primitive shell replacement via `primitiveRegistry`
- Avoid coupling public contracts to one styling runtime unless that runtime is explicitly opt-in.

### 3. Documentation

Update documentation when shipped behavior changes.

At minimum, consider:

- `README.md`
- `README.ko.md`
- Storybook reference stories
- host preset templates in `recipes/host-presets`

If you add or change a public function, hook, component prop, or package entrypoint:

- add or update JSDoc comments
- include examples when the contract is not obvious
- update both English and Korean documentation when the change affects public usage
- keep localized docs in sync as closely as possible

## Code Style

- Prefer minimal, focused changes.
- Keep public API additions deliberate and documented.
- Remove dead code, temporary logs, and unused exports.
- Follow the existing path alias conventions.
- Keep accessibility intact for interactive elements.

## Commits

- Write commits through `pnpm run commit`.
- Do not bypass the commit prompt with ad-hoc local message formats unless there is a strong reason.
- Keep each commit scoped to one logical unit of change.

## Testing

Choose the lowest-cost environment that still validates the behavior:

- Node: pure utilities and transformation logic
- JSDOM: component wiring and DOM behavior
- Storybook: visual comparison and integration references

Follow a test-first workflow whenever possible:

1. write or update the test first
2. change the implementation
3. rerun the smallest relevant verification

The goal is to reduce regressions by locking expected behavior before modifying code.

If you change package exports or publish behavior, run:

```bash
pnpm run build
pnpm run verify:package-surface
npm pack --dry-run
```

## Pull Requests

Include:

- what changed
- why it changed
- user-facing impact
- verification steps

Use the repository PR template when opening a pull request.
Do not replace it with a free-form summary unless the template is clearly inapplicable.

Recommended structure:

1. Goal
2. Changes
3. User-facing impact
4. Verification

If the change affects a public API, the pull request should also mention:

- whether JSDoc was added or updated
- which docs pages were updated
- whether `README.md` and `README.ko.md` are now aligned

## Release-sensitive changes

Pay extra attention to:

- `package.json` exports
- build output shape
- generated `dist` typings
- `styled-system/styles.css`
- `styles.css` and `styles-lite.css`
- `README` install/import examples

If your change affects how consumers install or import the package, verify the packed tarball before asking for review.

If you need higher confidence before release, do a local consumer smoke test with the packed tarball.
This is closer to the real published state than `pnpm link` because it validates the actual packed files, CSS, fonts, and export map.

Suggested flow:

```bash
pnpm run build
pnpm run verify:package-surface
pnpm pack --pack-destination .tmp

mkdir -p ../chaeditor-consumer-smoke
cd ../chaeditor-consumer-smoke
pnpm create vite . --template react-ts
pnpm add file:../chaeditor/.tmp/chaeditor-0.1.0.tgz
```

Then import the package exactly as a consumer would:

```tsx
import 'chaeditor/styles.css';
import { MarkdownRenderer } from 'chaeditor/react';
```

Use this when you want to visually verify issues such as:

- missing packed assets
- broken `styles.css` output
- KaTeX math styling or font regressions
- icon rendering differences in a real consumer app
- export conditions that only fail after packing
