import './style.css';
import Lenis from 'lenis';
import { profile, skills, experience, projects, siteTech } from './data.js';
import { renderApp, esc } from './template.js';


const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function render() {
  // Production builds ship this HTML prerendered; dev renders it so data.js edits show up live.
  const app = document.getElementById('app');
  if (import.meta.env.DEV || !app.children.length) {
    app.innerHTML = renderApp({ profile, skills, experience, projects, siteTech });
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
  const links = [...document.querySelectorAll('.nav nav a')];
  const bar = document.querySelector('.progress');
  const targets = links.map((a) => document.querySelector(a.getAttribute('href')));
  let active = null;

  return () => {
    const scroll = getScroll();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scroll / max : 0})`;

    const probe = scroll + window.innerHeight * 0.4;
    let current = null;
    targets.forEach((t, i) => {
      if (t && t.offsetTop <= probe) current = links[i];
    });
    if (current !== active) {
      active?.classList.remove('active');
      current?.classList.add('active');
      active = current;
    }
    document.querySelector('.nav').classList.toggle('scrolled', scroll > 40);
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
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      btn.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.email'));
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      btn.textContent = 'Selected';
    }
    setTimeout(() => (btn.textContent = 'Copy'), 1800);
  });
}

function setupTooltip() {
  const tip = document.getElementById('tooltip');
  let x = 0;
  let y = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (tip.classList.contains('show')) tip.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
    },
    { passive: true }
  );
  return (info) => {
    if (!info) {
      tip.classList.remove('show');
      return;
    }
    tip.innerHTML = `<strong style="color:${info.color}">${esc(info.name)}</strong><span>${esc(info.group)}</span>`;
    tip.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
    tip.classList.add('show');
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
  const fontReady = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  const [{ createWorld }] = await Promise.all([import('./three/scene.js'), fontReady]);

  const world = createWorld(document.getElementById('webgl'), { skills, experience, projects }, {
    reducedMotion,
    getScroll: scroll.getScroll,
    onFrame: pageFrame,
    onHover: setupTooltip(),
  });

  for (const card of document.querySelectorAll('.skill-group')) {
    const on = () => world.highlightGroup(card.dataset.group);
    const off = () => world.highlightGroup(null);
    card.addEventListener('pointerenter', on);
    card.addEventListener('pointerleave', off);
    card.addEventListener('focus', on);
    card.addEventListener('blur', off);
  }

  document.body.classList.add('ready');
}

init();
