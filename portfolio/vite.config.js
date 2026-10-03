import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages (/<repo>/) and any static host.
export default defineConfig({
  base: './',
  build: {
    // Three.js is lazy-loaded in its own chunk; it is expected to be large.
    chunkSizeWarningLimit: 700,
  },
});
