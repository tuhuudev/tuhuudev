import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './style.css';
import Lenis from 'lenis';
import { profile, skills, experience, education, projects, siteTech } from './data.js';
import { renderApp, esc } from './template.js';


const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function render() {
  // Production builds ship this HTML prerendered; dev renders it so data.js edits show up live.
  const app = document.getElementById('app');
  if (import.meta.env.DEV || !app.children.length) {
    app.innerHTML = renderApp({ profile, skills, experience, education, projects, siteTech });
  }
}

// ---- Smooth scroll ------------------------------------------------------------------------
function setupScroll() {
  if (reducedMotion) return { getScroll: () => window.scrollY, raf: () => {} };
  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 }, autoRaf: false });
  return { getScroll: () => lenis.scroll, raf: (t) => lenis.raf(t), lenis };
}

// ---- Page UI ------------------------------------------------------------------------------
function setupReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('visible');
          io.unobserve(el);
          // Drop the stagger delay once revealed so hover effects respond instantly.
          setTimeout(() => (el.style.transitionDelay = ''), 1200);
        }
      }
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
    io.observe(el);
  });
}

function setupNav(getScroll) {
  const nav = document.querySelector('.nav');
  const links = [...nav.querySelectorAll('nav a')];
  const bar = nav.querySelector('.progress');
  const targets = links.map((a) => document.querySelector(a.getAttribute('href')));
  let active = null;
  let lastScroll = -1;

  // Section positions only change on resize / reflow; reading them every frame forces layout.
  let tops = [];
  let max = 0;
  const measure = () => {
    tops = targets.map((t) => (t ? t.offsetTop : Infinity));
    max = document.documentElement.scrollHeight - window.innerHeight;
    lastScroll = -1;
  };
  measure();
  window.addEventListener('resize', measure);
  new ResizeObserver(measure).observe(document.getElementById('app'));

  return () => {
    const scroll = getScroll();
    if (scroll === lastScroll) return;
    lastScroll = scroll;
    bar.style.transform = `scaleX(${max > 0 ? scroll / max : 0})`;

    const probe = scroll + window.innerHeight * 0.4;
    let current = null;
    tops.forEach((top, i) => {
      if (top <= probe) current = links[i];
    });
    if (current !== active) {
      active?.classList.remove('active');
      active?.removeAttribute('aria-current');
      current?.classList.add('active');
      current?.setAttribute('aria-current', 'location');
      active = current;
    }
    nav.classList.toggle('scrolled', scroll > 40);
  };
}

function setupRoles() {
  const el = document.querySelector('.role-text');
  if (!el || reducedMotion || profile.roles.length < 2) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % profile.roles.length;
    el.classList.add('swap');
    setTimeout(() => {
      el.textContent = profile.roles[i];
      el.classList.remove('swap');
    }, 300);
  }, 3200);
}

function setupPointerEffects() {
  if (!finePointer || reducedMotion) return;

  // 3D tilt on project cards
  for (const card of document.querySelectorAll('.tilt')) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${-y * 8}deg`);
      card.style.setProperty('--ry', `${x * 10}deg`);
      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  // Buttons lean toward the cursor
  for (const btn of document.querySelectorAll('.magnetic')) {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  }
}

function setupCopy() {
  const btn = document.getElementById('copy-email');
  const status = document.getElementById('copy-status');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      btn.textContent = 'Copied';
      status.textContent = 'Email address copied to clipboard';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.email'));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      btn.textContent = 'Selected';
      status.textContent = 'Email address selected';
    }
    setTimeout(() => {
      btn.textContent = 'Copy';
      status.textContent = '';
    }, 1800);
  });
}

// The print stylesheet turns the page into a CV; the button needs JS, so it starts hidden.
function setupPrint() {
  const btn = document.getElementById('print-cv');
  btn.hidden = false;
  btn.addEventListener('click', () => window.print());
}

function setupTooltip() {
  const tip = document.getElementById('tooltip');
  let x = 0;
  let y = 0;
  let size = { w: 0, h: 0 };
  // Sits below-right of the cursor, flipping to the other side near the viewport edges.
  const place = () => {
    const left = x + 16 + size.w > window.innerWidth - 8 ? x - 16 - size.w : x + 16;
    const top = y + 16 + size.h > window.innerHeight - 8 ? y - 16 - size.h : y + 16;
    tip.style.transform = `translate(${Math.max(8, left)}px, ${Math.max(8, top)}px)`;
  };
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (tip.classList.contains('show')) place();
    },
    { passive: true }
  );
  return (info) => {
    if (!info) {
      tip.classList.remove('show');
      return;
    }
    tip.innerHTML = `<strong style="color:${info.color}">${esc(info.name)}</strong><span>${esc(info.group)}</span>`;
    size = { w: tip.offsetWidth, h: tip.offsetHeight };
    place();
    tip.classList.add('show');
  };
}

// Hovering a 3D object also marks the HTML element with the same data-key.
function linkHover(showTooltip) {
  let linked = null;
  return (info) => {
    showTooltip(info);
    const card = info ? document.querySelector(`[data-key="${CSS.escape(info.key)}"]`) : null;
    if (card === linked) return;
    linked?.classList.remove('linked');
    card?.classList.add('linked');
    linked = card;
  };
}

function webglAvailable() {
  try {
    return !!(window.WebGL2RenderingContext && document.createElement('canvas').getContext('webgl2'));
  } catch {
    return false;
  }
}

async function init() {
  render();
  setupReveal();
  setupRoles();
  setupPointerEffects();
  setupCopy();
  setupPrint();

  const scroll = setupScroll();
  const updateNav = setupNav(scroll.getScroll);
  // Without WebGL, Lenis and the nav still need a frame loop.
  const pageFrame = (t) => {
    scroll.raf(t);
    updateNav();
  };

  if (!webglAvailable()) {
    document.body.classList.add('no-webgl');
    const loop = (t) => {
      pageFrame(t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return;
  }

  // Page is readable now; fetch Three.js (separate chunk) and the web font in parallel.
  // 3D labels are drawn to canvas, so they need the label font loaded first.
  const fontReady = Promise.race([
    document.fonts.load('600 64px "Space Grotesk"'),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
  // Building the scene (geometry, shaders) is the heaviest main-thread work, so start it once the
  // page has loaded and the browser is idle; the chunk itself downloads in the meantime.
  const idle = new Promise((r) => {
    const go = () => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1000 }) : setTimeout(r, 200));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });
  const [{ createWorld }] = await Promise.all([import('./three/scene.js'), fontReady, idle]);

  const world = createWorld(document.getElementById('webgl'), { skills, experience, projects }, {
    reducedMotion,
    getScroll: scroll.getScroll,
    onFrame: pageFrame,
    onHover: linkHover(setupTooltip()),
  });

  // Skill groups, timeline entries and project cards light up their 3D counterpart.
  for (const el of document.querySelectorAll('[data-key]')) {
    const on = () => world.highlight(el.dataset.key);
    const off = () => world.highlight(null);
    el.addEventListener('pointerenter', on);
    el.addEventListener('pointerleave', off);
    el.addEventListener('focusin', on);
    el.addEventListener('focusout', off);
  }

  document.body.classList.add('ready');
}

init();
