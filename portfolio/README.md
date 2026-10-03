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

Also: bloom post-processing, mouse parallax, scroll-reveal, `prefers-reduced-motion` support,
mobile layout, and a plain-HTML fallback when WebGL2 isn't available.

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

`.github/workflows/deploy-portfolio.yml` builds and publishes `portfolio/dist` to GitHub Pages on
every push to `main` that touches `portfolio/`. Enable it once in **Settings → Pages → Source: GitHub Actions**.
