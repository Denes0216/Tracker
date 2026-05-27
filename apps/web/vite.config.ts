/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow importing the curated deck JSON from the repo's data/ directory.
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
});
