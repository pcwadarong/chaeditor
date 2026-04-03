import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { OnLoadArgs, OnResolveArgs, Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

const projectRoot = process.cwd();

const resolveLocalModulePath = (importPath: string, resolveDir: string): string => {
  const hasQuery = importPath.includes('?');
  const [rawPath, query = ''] = importPath.split('?');

  let basePath = rawPath;

  if (rawPath.startsWith('@/')) {
    basePath = path.resolve(projectRoot, 'src', rawPath.slice(2));
  } else if (rawPath.startsWith('styled-system/')) {
    basePath = path.resolve(projectRoot, 'styled-system', rawPath.slice('styled-system/'.length));
  } else if (!path.isAbsolute(rawPath)) {
    basePath = path.resolve(resolveDir, rawPath);
  }

  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.mjs`,
    `${basePath}.js`,
    `${basePath}.svg`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.mjs'),
    path.join(basePath, 'index.js'),
    basePath,
  ];

  const resolvedPath = candidates.find(candidate => existsSync(candidate));

  if (!resolvedPath) {
    return hasQuery ? `${basePath}?${query}` : basePath;
  }

  return hasQuery ? `${resolvedPath}?${query}` : resolvedPath;
};

const aliasPlugin: Plugin = {
  name: 'local-alias',
  setup(build) {
    build.onResolve({ filter: /^@\/|^styled-system\// }, (args: OnResolveArgs) => {
      if (args.path.endsWith('?raw')) return null;

      return {
        path: resolveLocalModulePath(args.path, args.resolveDir),
      };
    });
  },
};

const svgRawPlugin: Plugin = {
  name: 'svg-raw',
  setup(build) {
    build.onResolve({ filter: /\.svg\?raw$/ }, (args: OnResolveArgs) => ({
      namespace: 'svg-raw',
      path: resolveLocalModulePath(args.path, args.resolveDir),
    }));

    build.onLoad({ filter: /\.svg\?raw$/, namespace: 'svg-raw' }, async (args: OnLoadArgs) => {
      const [filePath] = args.path.split('?');
      const contents = await fs.readFile(filePath, 'utf8');

      return {
        contents: `export default ${JSON.stringify(contents)};`,
        loader: 'js',
      };
    });
  },
};

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    react: 'src/react/index.ts',
    'default-host': 'src/default-host/index.ts',
    'panda-primitives': 'src/panda-primitives/index.ts',
  },
  esbuildPlugins: [aliasPlugin, svgRawPlugin],
  external: ['react', 'react-dom'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
  sourcemap: false,
  splitting: false,
  tsconfig: './tsconfig.build.json',
  treeshake: true,
});
