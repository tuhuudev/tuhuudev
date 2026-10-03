# tuhuu.dev — 3D portfolio

Interactive personal portfolio built with **Three.js** + **Vite** (vanilla JS, no framework).

A single fixed WebGL canvas sits behind the page. Each section owns a 3D object that is placed at
the world height matching that section, so scrolling moves the camera through the scene in sync with the HTML.

| Section | 3D scene |
|---|---|
| Hero | Noise-displaced energy core (custom GLSL shader) + wireframe shell + orbiting dust |
| Skills | Hoverable tag cloud on a Fibonacci sphere, colored by skill group |
| Experience | Domains as moons orbiting a star on tilted rings |
| Projects | Floating polyhedra, one per project |
| Contact | Torus knot made of glowing points |

## Performance & smoothness

- **Code splitting** — page text is ~10 KB gzip and renders immediately; Three.js loads in a separate chunk.
- **Lenis smooth scroll** driven from the same `requestAnimationFrame` as WebGL, so the 3D camera stays glued to the HTML.
- **Adaptive quality** — a frame-time monitor steps down pixel ratio, then disables bloom, on slow devices.
- **Half-resolution bloom**, no MSAA, fewer particles on mobile, off-screen scene culling.
- Raycasting only when the pointer or scroll changed; frame-rate independent easing everywhere.
- Rendering pauses when the tab is hidden.

## Interaction

- Hover a skill group card to light up those skills in the 3D cloud (and vice versa: hover a 3D label for a tooltip).
- Intro animation, rotating role text, active-section nav + scroll progress bar.
- 3D tilt + cursor glare on project cards, magnetic buttons, copy-email button.
- Honors `prefers-reduced-motion`; plain-HTML fallback without WebGL2.

## Run locally

```bash
cd portfolio
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
```

## Edit content

All text lives in [`src/data.js`](src/data.js) — profile, skills, experience, projects.
Add `company` / `period` to an experience entry to show them on the timeline.
The 3D scenes are generated from the same data, so new skills or projects appear in 3D automatically.

## Structure

```
src/
  data.js            content
  main.js            builds the HTML, reveal animations, tooltip
  style.css
  three/
    scene.js         renderer, camera, bloom, scroll-synced layout, render loop
    objects.js       the 3D object for each section
    label.js         canvas-texture text sprites
    noise.js         GLSL simplex noise
```

## Deploy

`.github/workflows/deploy-portfolio.yml` builds the site and pushes `dist/` to the `gh-pages` branch
on every push that touches `portfolio/`. GitHub Pages serves it at **https://tuhuudev.github.io/tuhuudev/**.
If the site doesn't appear, set **Settings → Pages → Source: Deploy from a branch → `gh-pages` / root** once.
