# CLAUDE.md — tuhuudev (GitHub profile + 3D portfolio)

- `README.md` at the root is the **GitHub profile README** (shown on github.com/tuhuudev). Keep it in sync with the CV data in `portfolio/src/data.js` (roles, stack, featured projects, contact).
- `portfolio/` is the 3D portfolio site (Three.js + Vite, vanilla JS), deployed to GitHub Pages: https://tuhuudev.github.io/tuhuudev/

## Commands (run in `portfolio/`)
- `npm ci`
- `npm run dev` — local server
- `npm run build` — must pass before a PR (CI runs it on PRs; `deploy-portfolio.yml` deploys `main` to the `gh-pages` branch)

## Layout
- `src/data.js` — all page content (single source of truth). Edit text here, not in HTML.
- `src/template.js` — renders `data.js` to HTML; `vite.config.js` prerenders it into `index.html` at build time so the page works without JS.
- `src/main.js` — behaviour (scroll, nav, interactions); lazy-loads `src/three/` (scene, objects, shaders) as a separate chunk.

## Rules
- Keep the no-JS / no-WebGL2 fallback and `prefers-reduced-motion` working.
- Three.js must stay lazy-loaded; page text chunk should stay small (~10 KB gzip).
- Don't add links to private repos in the profile README.
