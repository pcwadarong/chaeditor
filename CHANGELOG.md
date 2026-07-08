# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Packaging hardening so the package installs cleanly for consumers and keeps
  its styles through production bundlers (#5):
  - Removed `postinstall: husky`, which broke `npm`/Yarn installs; the git hook
    setup now runs from `prepare` (not run for registry-installed dependencies).
  - `sideEffects` now lists the real CSS entrypoints, so bundlers no longer
    tree-shake `chaeditor/styles.css` away.
  - Host-preset templates import primitives from `chaeditor/panda-primitives`.
  - `exports` resolve ESM type declarations (`.d.mts`) and CJS declarations
    (`.d.ts`) separately, fixing the FalseCJS "masquerading" warning.
- Sanitized URLs on paths that bypass react-markdown's `urlTransform` (#7):
  custom `<Attachment>` / `<Video>` embeds, gallery images, link-preview
  responses, and attachment download paths now reject unsafe schemes and path
  traversal.

### Changed

- Dropped the unreachable, duplicated `styled-system/styles.css` from the
  published `files` list.

### Added

- CI now runs lint, typecheck, format check, and a Storybook build in addition
  to tests and the package build.
- Community health files: bug report issue template, issue template config,
  `SECURITY.md`, and `CODE_OF_CONDUCT.md`.

## Released versions

Releases `0.1.0` through `0.1.4` predate this changelog. See the
[GitHub releases](https://github.com/pcwadarong/chaeditor/releases) and
[commit history](https://github.com/pcwadarong/chaeditor/commits/main) for
their details.

[Unreleased]: https://github.com/pcwadarong/chaeditor/compare/v0.1.4...HEAD
