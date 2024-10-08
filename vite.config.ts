import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    legacy(),
  ],
  build: {
    outDir: 'build', // Specify the output directory here
  },
});