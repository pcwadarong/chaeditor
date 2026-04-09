# Contributing to chaeditor

English | [한국어](./CONTRIBUTING.ko.md)

Thanks for taking the time to contribute to `chaeditor`.
This guide describes the day-to-day contributor workflow. It explains how to make changes, how to verify them, and which docs need to stay aligned.

## Welcome

We welcome:

- bug reports with reproduction steps
- documentation improvements
- test coverage improvements
- focused bug fixes
- feature work that has already been discussed in an issue

If this is your first contribution, start with a small documentation update, a focused bug fix, or an issue labeled `good first issue`.

## Communication

- Issues and pull requests may be written in English or Korean.
- Keep problem statements concrete and implementation notes short.
- Explain user-facing impact before internal refactoring details whenever possible.

## Before You Start

1. Check whether the same issue or pull request already exists.
2. Open or reference an issue if the change is large enough to need scope discussion.
3. Prefer small, reviewable pull requests over broad refactors.

## Local Setup

This repository uses `pnpm`.

```bash
pnpm install
```

### Common commands

```bash
pnpm lint                    # run ESLint
pnpm check-types             # run TypeScript checks
pnpm test                    # run the full Vitest regression entrypoint
pnpm run test:node           # pure logic and node-only contracts
pnpm run test:dom:ui         # jsdom UI contracts
pnpm run test:coverage       # Vitest coverage run
pnpm build                   # build the package
pnpm run verify:package-surface
```

What `verify:package-surface` checks:

- packed package entrypoints
- export conditions
- CSS entrypoints
- consumer-facing examples that should prefer subpath imports

### Targeted commands

Run the smallest relevant command first.

```bash
pnpm vitest run path/to/file.test.ts
pnpm run test:watch
```

If a change is visual, documentation-facing, or easier to validate in a browser, run Storybook as well:

```bash
pnpm storybook
pnpm build-storybook
```

## Repository Expectations

### Package surface

`chaeditor` is published as one package with selective subpath imports.
Keep the public surface deliberate:

- `chaeditor/react`
- `chaeditor/core`
- `chaeditor/default-host`
- `chaeditor/panda-primitives`
- `chaeditor/styles.css`
- `chaeditor/styles-lite.css`

If you change public exports, install paths, or publish behavior, update all relevant places:

- `package.json`
- `README.md`
- `README.ko.md`
- related wiki pages under `docs/wiki/`

### Styling and runtime boundaries

- The bundled default styling runtime is Panda CSS.
- Host-side overrides must continue to work through CSS variables and `primitiveRegistry`.
- Avoid coupling public contracts to one styling runtime unless that runtime is explicitly opt-in.

### Documentation alignment

Update docs when shipped behavior changes.
At minimum, consider:

- `README.md`
- `README.ko.md`
- wiki pages under `docs/wiki/`
- host preset templates in `recipes/host-presets`

If you add or change a public function, hook, prop, or package entrypoint:

- add or update JSDoc comments
- include examples when the contract is not obvious
- update both English and Korean docs when public usage changes

## Code Style

- Prefer minimal, focused changes.
- Keep public API additions deliberate and documented.
- Remove dead code, temporary logs, and unused exports.
- Follow the existing path alias conventions.
- Keep accessibility intact for interactive elements.

## Commits

- Write commits through `pnpm run commit`.
- Keep each commit scoped to one logical unit of change.
- Do not bypass the commit flow unless there is a strong reason.

## Testing

Use the lightest test environment that covers the behavior:

- Node for pure utilities and transforms
- JSDOM for component wiring and DOM behavior
- Storybook for visual or interaction review

Tests are split by how heavy they are to run, not by architecture layer:

- `test:node` — pure logic and non-DOM contracts
- `test:dom:ui` — jsdom rendering and interaction contracts
- `test:coverage` — coverage check across both

Before writing DOM-heavy tests, check whether the logic can live in a pure helper or hook and be tested more cheaply.

Preferred order:

1. write or update the test first
2. change the implementation
3. rerun the smallest relevant verification

If you change package exports or publish behavior, run:

```bash
pnpm run build
pnpm run verify:package-surface
npm pack --dry-run
```

## Pull Requests

Use the repository PR template:

- `.github/pull_request_template.md`

Every pull request should explain:

- what changed
- why it changed
- user-facing impact
- verification steps

Recommended structure:

1. Goal
2. Changes
3. User-facing impact
4. Verification

If the change affects a public API, also mention:

- whether JSDoc was added or updated
- which docs were updated
- whether `README.md` and `README.ko.md` are aligned

## Release-sensitive Changes

Pay extra attention to:

- `package.json` exports
- build output shape
- generated `dist` typings
- `styles.css` and `styles-lite.css`
- install and import examples
- packed assets such as fonts and CSS

If your change affects how consumers install, import, or render the package, verify the packed tarball before asking for review.

The release-specific smoke-test flow now lives in:

- [Release Checklist](./docs/wiki/release-checklist.md)
- [Release Checklist (Korean)](./docs/wiki/ko/release-checklist.md)
