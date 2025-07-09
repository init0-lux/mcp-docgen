import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['bin/cli.ts'],
  format: ['cjs'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
