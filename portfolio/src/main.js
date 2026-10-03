import './style.css';
import Lenis from 'lenis';
import { profile, skills, experience, projects, siteTech } from './data.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section id="hero" class="section" data-scene="hero" data-side="right">
      <div class="content left">
        <p class="eyebrow reveal">Hi, I'm</p>
        <h1 class="reveal">${esc(profile.name)}</h1>
        <p class="role reveal"><span class="role-text" aria-live="polite">${esc(profile.roles[0])}</span><span class="caret" aria-hidden="true"></span></p>
        <p class="lead reveal">${esc(profile.tagline)}</p>
        <div class="actions reveal">
          <a class="btn primary magnetic" href="#projects">View projects</a>
          <a class="btn magnetic" href="#contact">Get in touch</a>
        </div>
      </div>
      <a class="scroll-hint" href="#skills" aria-label="Scroll to skills"><span></span></a>
    </section>

    <section id="skills" class="section" data-scene="skills" data-side="left">
      <div class="content right">
        <p class="eyebrow reveal">Skills</p>
        <h2 class="reveal">My toolbox</h2>
        <p class="muted reveal">Hover a group to light it up in the 3D cloud, or hover the cloud itself.</p>
        <div class="skill-groups">
          ${skills
            .map(
              (g) => `
            <div class="skill-group reveal" tabindex="0" data-group="${esc(g.group)}" style="--accent:${g.color}">
              <h3>${esc(g.group)} <span class="count">${g.items.length}</span></h3>
              <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section id="experience" class="section" data-scene="experience" data-side="right">
      <div class="content left">
        <p class="eyebrow reveal">Experience</p>
        <h2 class="reveal">Domains I've shipped in</h2>
        <ol class="timeline">
          ${experience
            .map(
              (e) => `
            <li class="reveal" style="--accent:${e.color}">
              <div class="tl-head">
                <h3>${esc(e.domain)}</h3>
                ${e.current ? '<span class="badge">Current</span>' : ''}
                ${e.period ? `<span class="period">${esc(e.period)}</span>` : ''}
              </div>
              <p class="tl-title">${esc(e.title)}${e.company ? ` · ${esc(e.company)}` : ''}</p>
              <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
            </li>`
            )
            .join('')}
        </ol>
      </div>
    </section>

    <section id="projects" class="section" data-scene="projects" data-side="left">
      <div class="content right">
        <p class="eyebrow reveal">Projects</p>
        <h2 class="reveal">Featured work</h2>
        <div class="cards">
          ${projects
            .map(
              (p) => `
            <a class="card tilt reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
              <h3>${esc(p.name)} <span aria-hidden="true">↗</span></h3>
              <p>${esc(p.description)}</p>
              <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
              <span class="card-link">${esc(p.linkLabel)}</span>
            </a>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section id="built" class="section compact">
      <div class="content center wide">
        <p class="eyebrow reveal">Under the hood</p>
        <h2 class="reveal">How this site is built</h2>
        <ul class="tech-grid">
          ${siteTech
            .map((t) => `<li class="reveal"><strong>${esc(t.name)}</strong><span>${esc(t.detail)}</span></li>`)
            .join('')}
        </ul>
      </div>
    </section>

    <section id="contact" class="section" data-scene="contact" data-side="center" data-depth="-3">
      <div class="content center">
        <p class="eyebrow reveal">Contact</p>
        <h2 class="reveal">Let's build something</h2>
        <p class="lead reveal">Open to front-end roles and interesting product work.</p>
        <div class="email-row reveal">
          <a class="email" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
          <button class="copy" type="button" id="copy-email">Copy</button>
        </div>
        <div class="actions reveal">
          ${profile.links
            .map((l) => `<a class="btn magnetic" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
            .join('')}
        </div>
      </div>
      <footer>© ${new Date().getFullYear()} ${esc(profile.name)} · Built with Three.js</footer>
    </section>
  `;
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
