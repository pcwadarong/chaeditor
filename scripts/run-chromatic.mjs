/* global console, process */

import { spawnSync } from 'node:child_process';

const token = process.env.CHROMATIC_PROJECT_TOKEN;

if (!token) {
  console.error('CHROMATIC_PROJECT_TOKEN is required to run Chromatic.');
  process.exit(1);
}

const args = [
  'chromatic',
  `--project-token=${token}`,
  '--exit-zero-on-changes',
  ...process.argv.slice(2),
];

const result = spawnSync('npx', args, {
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
