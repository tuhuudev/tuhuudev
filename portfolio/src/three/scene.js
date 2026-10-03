import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  createStarfield,
  createCore,
  createSkillCloud,
  createOrbits,
  createProjectShapes,
  createKnot,
} from './objects.js';

const BG = 0x07070d;
const CAMERA_Z = 10;
const FOV = 45;

/**
 * One fixed full-screen canvas behind the page. Each page section owns a 3D object that is
 * placed at the world height matching the section's position, so scrolling the page moves the
 * camera through the scene 1:1 with the HTML.
 */
export function createWorld(canvas, data, { reducedMotion = false, onHover } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 9, 22);

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.z = CAMERA_Z;

  scene.add(new THREE.AmbientLight('#8b7bff', 1.4));
  const key = new THREE.PointLight('#4fd1ff', 120, 40);
  key.position.set(4, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight('#ff7ab6', 70, 40);
  rim.position.set(-5, -3, 4);
  scene.add(rim);

  const stars = createStarfield();
  scene.add(stars.group);

  // Order matches the <section data-scene> elements in the page.
  const sections = {
    hero: createCore(),
    skills: createSkillCloud(data.skills),
    experience: createOrbits(data.experience),
    projects: createProjectShapes(data.projects),
    contact: createKnot(),
  };
  for (const s of Object.values(sections)) scene.add(s.group);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.5, 0.35);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // ---- Layout -------------------------------------------------------------------------------
  let unitsPerPx = 1;
  let viewport = { w: 1, h: 1 };
  let sectionEls = [];

  function visibleHeight() {
    return 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  }

  function layout() {
    viewport = { w: window.innerWidth, h: window.innerHeight };
    renderer.setSize(viewport.w, viewport.h, false);
    composer.setSize(viewport.w, viewport.h);
    camera.aspect = viewport.w / viewport.h;
    camera.updateProjectionMatrix();

    const vh = visibleHeight();
    const vw = vh * camera.aspect;
    unitsPerPx = vh / viewport.h;
    const narrow = viewport.w < 900;

    sectionEls = [...document.querySelectorAll('[data-scene]')];
    for (const el of sectionEls) {
      const obj = sections[el.dataset.scene];
      if (!obj) continue;
      const rect = el.getBoundingClientRect();
      const centerPx = rect.top + window.scrollY + rect.height / 2;
      const side = el.dataset.side === 'left' ? -1 : el.dataset.side === 'right' ? 1 : 0;
      const depth = el.dataset.depth ? Number(el.dataset.depth) : 0;
      obj.group.position.y = -(centerPx - viewport.h / 2) * unitsPerPx;
      obj.group.position.x = narrow ? 0 : side * vw * 0.23;
      obj.group.position.z = (narrow ? -5 : 0) + depth;
      // On phones the hero object sits above the headline instead of behind it.
      if (narrow && el.dataset.scene === 'hero') {
        obj.group.position.y += vh * 0.3;
        obj.group.position.z = -2;
      }
    }
  }

  // ---- Interaction --------------------------------------------------------------------------
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  const ndc = new THREE.Vector2(-10, -10);
  let pointerSpeed = 0;
  const raycaster = new THREE.Raycaster();
  let hovered = null;

  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / viewport.w) * 2 - 1;
    const y = -(e.clientY / viewport.h) * 2 + 1;
    pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(x - ndc.x, y - ndc.y) * 0.8);
    ndc.set(x, y);
    pointer.set(x, y);
  });
  window.addEventListener('pointerleave', () => ndc.set(-10, -10));

  function updateHover() {
    const hoverables = sections.skills.hoverables;
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(hoverables, false)[0];
    const next = hit ? hit.object : null;
    if (next !== hovered) {
      hovered = next;
      document.body.style.cursor = hovered ? 'pointer' : '';
      onHover?.(hovered ? hovered.userData.info : null);
    }
  }

  // ---- Loop ---------------------------------------------------------------------------------
  const clock = new THREE.Clock();
  const timeScale = reducedMotion ? 0.25 : 1;
  let time = 0;
  let running = true;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt * timeScale;

    const targetY = -window.scrollY * unitsPerPx;
    const follow = reducedMotion ? 1 : 1 - Math.exp(-dt * 10);
    camera.position.y += (targetY - camera.position.y) * follow;
    pointerSmooth.lerp(pointer, 0.06);
    camera.position.x = pointerSmooth.x * 0.35;
    camera.lookAt(camera.position.x * 0.5, camera.position.y, 0);
    stars.group.position.y = camera.position.y * 0.85;

    pointerSpeed *= 0.94;
    updateHover();
    const ctx = { pointer: pointerSmooth, pointerSpeed, hovered };
    stars.update(time, ctx);
    for (const s of Object.values(sections)) {
      // Skip work for objects far outside the view.
      s.group.visible = Math.abs(s.group.position.y - camera.position.y) < visibleHeight() * 1.6;
      if (s.group.visible) s.update(time, ctx);
    }

    composer.render();
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      clock.getDelta();
      frame();
    }
  });

  layout();
  window.addEventListener('resize', layout);
  new ResizeObserver(layout).observe(document.body);
  frame();

  return { layout };
}
