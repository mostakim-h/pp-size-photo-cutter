import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    rollupOptions: {
      external: ['/models/**'], // Exclude model files from bundling
    },
  },
});
