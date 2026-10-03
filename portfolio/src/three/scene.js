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
const VISIBLE_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// Quality tiers, best first. The adaptive monitor walks down this list when frames get slow.
const TIERS = [
  { dpr: 2, bloom: true },
  { dpr: 1.5, bloom: true },
  { dpr: 1, bloom: true },
  { dpr: 1, bloom: false },
  { dpr: 0.75, bloom: false },
];

/**
 * One fixed full-screen canvas behind the page. Each page section owns a 3D object placed at the
 * world height matching the section's position, so the camera moves through the scene 1:1 with
 * the page scroll.
 *
 * `getScroll` returns the current (already smoothed) scroll offset; `onFrame` lets the caller run
 * per-frame work (e.g. Lenis) inside the same requestAnimationFrame as rendering.
 */
export function createWorld(canvas, data, { reducedMotion = false, getScroll, onFrame, onHover } = {}) {
  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // bloom + high DPR make MSAA mostly redundant, and it is costly on mobile
    powerPreference: 'high-performance',
    stencil: false,
  });

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

  const stars = createStarfield(isMobile ? 1000 : 2200);
  scene.add(stars.group);

  // Keys match the data-scene attribute of each <section>.
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

  function resize() {
    viewport = { w: window.innerWidth, h: window.innerHeight };
    renderer.setSize(viewport.w, viewport.h, false);
    composer.setSize(viewport.w, viewport.h);
    // Bloom at half resolution: visually the same soft glow, roughly 4x cheaper.
    bloom.resolution.set(viewport.w / 2, viewport.h / 2);
    camera.aspect = viewport.w / viewport.h;
    camera.updateProjectionMatrix();
    unitsPerPx = VISIBLE_H / viewport.h;
  }

  function placeObjects() {
    const vw = VISIBLE_H * camera.aspect;
    const narrow = viewport.w < 900;
    const scroll = getScroll();
    for (const el of document.querySelectorAll('[data-scene]')) {
      const obj = sections[el.dataset.scene];
      if (!obj) continue;
      const rect = el.getBoundingClientRect();
      const centerPx = rect.top + scroll + rect.height / 2;
      const side = el.dataset.side === 'left' ? -1 : el.dataset.side === 'right' ? 1 : 0;
      const depth = el.dataset.depth ? Number(el.dataset.depth) : 0;
      obj.group.position.y = -(centerPx - viewport.h / 2) * unitsPerPx;
      obj.group.position.x = narrow ? 0 : side * vw * 0.23;
      obj.group.position.z = (narrow ? -5 : 0) + depth;
      // On phones the hero object sits above the headline instead of behind it.
      if (narrow && el.dataset.scene === 'hero') {
        obj.group.position.y += VISIBLE_H * 0.3;
        obj.group.position.z = -2;
      }
    }
  }

  let layoutQueued = false;
  function queueLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(() => {
      layoutQueued = false;
      resize();
      placeObjects();
    });
  }

  // ---- Quality ------------------------------------------------------------------------------
  const maxDpr = Math.min(window.devicePixelRatio, 2);
  let tier = Math.max(0, TIERS.findIndex((t) => t.dpr <= maxDpr));
  if (isMobile) tier = Math.max(tier, 2);

  function applyTier() {
    const t = TIERS[tier];
    const dpr = Math.min(t.dpr, maxDpr);
    renderer.setPixelRatio(dpr);
    composer.setPixelRatio(dpr);
    bloom.enabled = t.bloom;
    resize();
  }

  // Sample frame times; step quality down when we can't hold ~45fps.
  let sampleTime = 0;
  let sampleFrames = 0;
  function monitor(dt) {
    sampleTime += dt;
    sampleFrames++;
    if (sampleTime < 2) return;
    const avg = sampleTime / sampleFrames;
    sampleTime = 0;
    sampleFrames = 0;
    if (avg > 1 / 45 && tier < TIERS.length - 1) {
      tier++;
      applyTier();
    }
  }

  // ---- Interaction --------------------------------------------------------------------------
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  const ndc = new THREE.Vector2(-10, -10);
  let pointerSpeed = 0;
  let pointerDirty = false;
  const raycaster = new THREE.Raycaster();
  let hovered = null;
  let highlightedGroup = null;

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'touch') return;
      const x = (e.clientX / viewport.w) * 2 - 1;
      const y = -(e.clientY / viewport.h) * 2 + 1;
      pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(x - ndc.x, y - ndc.y) * 0.8);
      ndc.set(x, y);
      pointer.set(x, y);
      pointerDirty = true;
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => {
    ndc.set(-10, -10);
    pointerDirty = true;
  });

  function updateHover(scrolled) {
    // Raycast only when something could have changed.
    if (!pointerDirty && !scrolled) return;
    pointerDirty = false;
    let next = null;
    if (sections.skills.group.visible) {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(sections.skills.hoverables, false)[0];
      next = hit ? hit.object : null;
    }
    if (next !== hovered) {
      hovered = next;
      document.body.classList.toggle('hovering-3d', !!hovered);
      onHover?.(hovered ? hovered.userData.info : null);
    }
  }

  // ---- Loop ---------------------------------------------------------------------------------
  const clock = new THREE.Clock();
  const timeScale = reducedMotion ? 0.25 : 1;
  let time = 0;
  let intro = reducedMotion ? 1 : 0;
  let running = true;
  let lastScroll = -1;
  const ctx = { pointer: pointerSmooth, pointerSpeed: 0, hovered: null, highlightedGroup: null, intro: 0, dt: 0 };

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    onFrame?.(now);

    const dt = Math.min(clock.getDelta(), 0.1);
    time += dt * timeScale;
    intro = Math.min(1, intro + dt / 1.8);
    monitor(dt);

    // Scroll is already eased by Lenis, so the camera tracks it exactly and stays glued to the HTML.
    const scroll = getScroll();
    const scrolled = scroll !== lastScroll;
    lastScroll = scroll;
    camera.position.y = -scroll * unitsPerPx;

    pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 4));
    camera.position.x = pointerSmooth.x * 0.35;
    camera.lookAt(camera.position.x * 0.5, camera.position.y, 0);
    stars.group.position.y = camera.position.y * 0.85;

    pointerSpeed *= Math.exp(-dt * 3.5);
    updateHover(scrolled);

    ctx.pointerSpeed = pointerSpeed;
    ctx.hovered = hovered;
    ctx.highlightedGroup = highlightedGroup;
    ctx.intro = 1 - Math.pow(1 - intro, 3); // easeOutCubic
    ctx.dt = dt;

    stars.update(time, ctx);
    for (const s of Object.values(sections)) {
      // Cull objects that are well outside the view.
      s.group.visible = Math.abs(s.group.position.y - camera.position.y) < VISIBLE_H * 1.4;
      if (s.group.visible) s.update(time, ctx);
    }

    composer.render();
  }

  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) {
      clock.getDelta();
      requestAnimationFrame(frame);
    }
  });

  applyTier();
  placeObjects();
  window.addEventListener('resize', queueLayout);
  new ResizeObserver(queueLayout).observe(document.querySelector('main'));
  requestAnimationFrame(frame);

  return {
    layout: queueLayout,
    highlightGroup(name) {
      highlightedGroup = name;
    },
  };
}
