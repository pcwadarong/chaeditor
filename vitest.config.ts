import path from 'node:path';

import { defineConfig, defineProject } from 'vitest/config';

const nodeOnlyTsxTests = [
  'src/features/edit-markdown/toolbar/contracts/markdown-toolbar-composition.test.tsx',
  'src/shared/lib/markdown/markdown-components.test.tsx',
  'src/shared/lib/markdown/markdown-config.test.tsx',
];

const svgRawMockPlugin = {
  enforce: 'pre' as const,
  name: 'vitest-svg-raw-mock',
  resolveId(id: string) {
    if (id.endsWith('.svg?raw')) {
      return '\0chaeditor-svg-raw-mock';
    }

    return null;
  },
  load(id: string) {
    if (id === '\0chaeditor-svg-raw-mock') {
      return 'export default \'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 8h12" /></svg>\';';
    }

    return null;
  },
};

const sharedAliases = [
  {
    find: '@',
    replacement: path.resolve(__dirname, './src'),
  },
  {
    find: /^styled-system\/(.*)$/,
    replacement: path.resolve(__dirname, './styled-system/$1'),
  },
  {
    find: 'server-only',
    replacement: path.resolve(__dirname, './src/shared/lib/test/server-only.ts'),
  },
  {
    find: /\.svg$/,
    replacement: path.resolve(__dirname, './src/shared/lib/test/svg-component.tsx'),
  },
  {
    find: /\.svg\?url$/,
    replacement: path.resolve(__dirname, './src/shared/lib/test/svg-mock-url.ts'),
  },
];

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.tsx',
        'src/shared/lib/test/**',
        'src/stories/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    projects: [
      defineProject({
        plugins: [svgRawMockPlugin],
        resolve: {
          alias: sharedAliases,
        },
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts', ...nodeOnlyTsxTests],
          maxWorkers: 1,
          clearMocks: true,
          unstubGlobals: true,
          unstubEnvs: true,
        },
      }),
      defineProject({
        plugins: [svgRawMockPlugin],
        resolve: {
          alias: sharedAliases,
        },
        test: {
          name: 'dom-ui',
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          exclude: nodeOnlyTsxTests,
          maxWorkers: 1,
          clearMocks: true,
          unstubGlobals: true,
          unstubEnvs: true,
        },
      }),
    ],
  },
});
