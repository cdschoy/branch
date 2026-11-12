import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The app lives at the repo root so the generated design-tokens/ and i18n/ folders are importable
// without copying (FRAMEWORK §0.5 step 3). Aliases mirror tsconfig.json "paths".
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/': r('./src/'),
      '@tokens/': r('./design-tokens/'),
      '@strings/': r('./i18n/'),
    },
  },
  build: { target: 'es2022', sourcemap: true },
  server: { host: true },
  preview: { host: true },
});
