import { defineConfig } from 'vite';

// Injects the page content into index.html at build time, so the first paint already has all
// text (fast, readable without JS, indexable). main.js then only wires up behavior.
function prerender() {
  return {
    name: 'prerender-content',
    apply: 'build',
    async transformIndexHtml(html) {
      const data = await import('./src/data.js');
      const { renderApp } = await import('./src/template.js');
      return html.replace('<main id="app"></main>', `<main id="app">${renderApp(data)}</main>`);
    },
  };
}

// Relative base so the build works on GitHub Pages (/<repo>/) and any static host.
export default defineConfig({
  base: './',
  plugins: [prerender()],
  build: {
    // Three.js is lazy-loaded in its own chunk; it is expected to be large.
    chunkSizeWarningLimit: 700,
  },
});
