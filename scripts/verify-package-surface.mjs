/* global console, process */

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const tempDir = path.join(rootDir, '.tmp', 'package-surface-smoke');
const consumerExampleRoots = ['README.md', 'README.ko.md', 'docs', 'src/stories'];

/**
 * Runs a command and throws when it exits with a non-zero status.
 */
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    throw new Error(
      [`Command failed: ${command} ${args.join(' ')}`, result.stdout, result.stderr]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return result.stdout;
};

/**
 * Extracts the trailing JSON payload from `npm pack --json`.
 */
const parsePackJson = output => {
  const lines = output
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean);
  const jsonStartIndex = lines.findLastIndex(line => line.trim() === '[');

  if (jsonStartIndex === -1) {
    throw new Error(`Unable to parse npm pack JSON output.\n${output}`);
  }

  return JSON.parse(lines.slice(jsonStartIndex).join('\n'));
};

/**
 * Recursively lists files under a directory.
 */
const listFiles = async directoryPath => {
  const entries = await fs.readdir(directoryPath, {
    recursive: true,
    withFileTypes: true,
  });

  return entries
    .filter(entry => entry.isFile())
    .map(entry => path.join(entry.parentPath, entry.name));
};

/**
 * Verifies consumer-facing examples avoid the compatibility root import.
 */
const verifyNoConsumerRootImports = async () => {
  const candidateFiles = [];

  for (const relativePath of consumerExampleRoots) {
    const absolutePath = path.join(rootDir, relativePath);
    const stat = await fs.stat(absolutePath);

    if (stat.isDirectory()) {
      candidateFiles.push(...(await listFiles(absolutePath)));
      continue;
    }

    candidateFiles.push(absolutePath);
  }

  const consumerFilePattern = /\.(?:md|ts|tsx)$/u;
  const rootImportPattern = /^\s*import\s.+\sfrom\s+['"]chaeditor['"]/mu;
  const matches = [];

  for (const filePath of candidateFiles) {
    if (!consumerFilePattern.test(filePath)) continue;

    const contents = await fs.readFile(filePath, 'utf8');
    if (rootImportPattern.test(contents)) {
      matches.push(path.relative(rootDir, filePath));
    }
  }

  if (matches.length > 0) {
    throw new Error(
      [
        'Consumer-facing examples should prefer subpath imports from chaeditor/react or chaeditor/core.',
        'Found root imports in:',
        ...matches.map(filePath => `- ${filePath}`),
      ].join('\n'),
    );
  }
};

/**
 * Creates a clean temporary package consumer workspace.
 */
const prepareTempWorkspace = async () => {
  await fs.rm(tempDir, { force: true, recursive: true });
  await fs.mkdir(tempDir, { recursive: true });
  await fs.writeFile(
    path.join(tempDir, 'package.json'),
    JSON.stringify(
      {
        name: 'chaeditor-package-surface-smoke',
        private: true,
        type: 'module',
      },
      null,
      2,
    ),
  );
};

/**
 * Verifies the ESM surface and exported CSS paths.
 */
const verifyEsmSurface = async () => {
  const filePath = path.join(tempDir, 'verify-imports.mjs');
  const contents = `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const root = await import('chaeditor');
const react = await import('chaeditor/react');
const core = await import('chaeditor/core');
const defaultHost = await import('chaeditor/default-host');
const pandaPrimitives = await import('chaeditor/panda-primitives');
const require = createRequire(import.meta.url);

assert.equal(typeof root.MarkdownEditor, 'function');
assert.equal(typeof root.createChaeditorThemeVars, 'function');
assert.equal(typeof react.MarkdownEditor, 'function');
assert.equal(typeof react.MarkdownToolbar, 'function');
assert.equal(typeof core.createChaeditorThemeVars, 'function');
assert.equal(typeof core.parseRichMarkdownSegments, 'function');
assert.equal(typeof core.extractEmbedMetaFromHtml, 'function');
assert.equal(typeof defaultHost.createDefaultHostAdapters, 'function');
assert.equal(typeof defaultHost.createFetchLinkPreviewMeta, 'function');
assert.equal(typeof defaultHost.uploadEditorImage, 'function');
assert.equal(typeof pandaPrimitives.createPandaMarkdownPrimitiveRegistry, 'function');

const cssPath = require.resolve('chaeditor/styles.css');
const liteCssPath = require.resolve('chaeditor/styles-lite.css');
assert.equal(cssPath.endsWith('styles.css'), true);
assert.equal(liteCssPath.endsWith('styles-lite.css'), true);
`;

  await fs.writeFile(filePath, contents);
  run('node', [filePath], tempDir);
};

/**
 * Verifies the CJS export conditions.
 */
const verifyCjsSurface = async () => {
  const filePath = path.join(tempDir, 'verify-require.cjs');
  const contents = `
const assert = require('node:assert/strict');
const root = require('chaeditor');
const react = require('chaeditor/react');
const core = require('chaeditor/core');
const defaultHost = require('chaeditor/default-host');
const pandaPrimitives = require('chaeditor/panda-primitives');

assert.equal(typeof root.MarkdownEditor, 'function');
assert.equal(typeof react.MarkdownRenderer, 'function');
assert.equal(typeof core.createChaeditorThemeVars, 'function');
assert.equal(typeof core.extractEmbedMetaFromHtml, 'function');
assert.equal(typeof defaultHost.uploadEditorFile, 'function');
assert.equal(typeof defaultHost.createDefaultHostAdapters, 'function');
assert.equal(typeof defaultHost.createFetchLinkPreviewMeta, 'function');
assert.equal(
  typeof pandaPrimitives.Button === 'function' || typeof pandaPrimitives.Button === 'object',
  true,
);
`;

  await fs.writeFile(filePath, contents);
  run('node', [filePath], tempDir);
};

const main = async () => {
  await verifyNoConsumerRootImports();

  const packOutput = run('npm', ['pack', '--json', '--silent'], rootDir);
  const [{ filename }] = parsePackJson(packOutput);
  const tarballPath = path.join(rootDir, filename);

  await prepareTempWorkspace();

  run('npm', ['install', '--ignore-scripts', '--no-save', tarballPath], tempDir);

  await verifyEsmSurface();
  await verifyCjsSurface();

  await fs.rm(tempDir, { force: true, recursive: true });
  await fs.rm(tarballPath, { force: true });

  console.log(
    'Verified packed package entrypoints: root, react, core, default-host, panda-primitives, styles.css, and styles-lite.css',
  );
};

main().catch(async error => {
  await fs.rm(tempDir, { force: true, recursive: true });
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
