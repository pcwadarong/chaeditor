/* global console, process */

import { execFileSync } from 'node:child_process';

/**
 * Returns staged JS/TS source files that can affect Vitest contracts.
 */
const getStagedSourceFiles = () => {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .map(filePath => filePath.trim())
    .filter(Boolean)
    .filter(filePath => /\.(?:[cm]?[jt]sx?)$/.test(filePath));
};

const stagedSourceFiles = getStagedSourceFiles();

if (stagedSourceFiles.length === 0) {
  console.log('No staged JS/TS files. Skipping staged tests.');
  process.exit(0);
}

console.log(`Running Vitest related for ${stagedSourceFiles.length} staged file(s)...`);

execFileSync('pnpm', ['exec', 'vitest', 'related', '--run', ...stagedSourceFiles], {
  stdio: 'inherit',
});
