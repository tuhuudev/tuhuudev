import './style.css';
import { profile, skills, experience, projects } from './data.js';
import { createWorld } from './three/scene.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section id="hero" class="section" data-scene="hero" data-side="right">
      <div class="content left">
        <p class="eyebrow reveal">Hi, I'm</p>
        <h1 class="reveal">${esc(profile.name)}</h1>
        <p class="role reveal">${esc(profile.role)}</p>
        <p class="lead reveal">${esc(profile.tagline)}</p>
        <div class="actions reveal">
          <a class="btn primary" href="#projects">View projects</a>
          <a class="btn" href="mailto:${esc(profile.email)}">Get in touch</a>
        </div>
      </div>
      <a class="scroll-hint" href="#skills" aria-label="Scroll to skills"><span></span></a>
    </section>

    <section id="skills" class="section" data-scene="skills" data-side="left">
      <div class="content right">
        <p class="eyebrow reveal">01 — Skills</p>
        <h2 class="reveal">My toolbox</h2>
        <p class="muted reveal">Hover the 3D cloud to explore — each color is a skill group.</p>
        <div class="skill-groups">
          ${skills
            .map(
              (g) => `
            <div class="skill-group reveal" style="--accent:${g.color}">
              <h3>${esc(g.group)}</h3>
              <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section id="experience" class="section" data-scene="experience" data-side="right">
      <div class="content left">
        <p class="eyebrow reveal">02 — Experience</p>
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
        <p class="eyebrow reveal">03 — Projects</p>
        <h2 class="reveal">Featured work</h2>
        <div class="cards">
          ${projects
            .map(
              (p) => `
            <a class="card reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
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

    <section id="contact" class="section" data-scene="contact" data-side="center" data-depth="-3">
      <div class="content center">
        <p class="eyebrow reveal">04 — Contact</p>
        <h2 class="reveal">Let's build something</h2>
        <p class="lead reveal">Open to front-end roles and interesting product work.</p>
        <a class="email reveal" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
        <div class="actions reveal">
          ${profile.links
            .map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
            .join('')}
        </div>
      </div>
      <footer>© ${new Date().getFullYear()} ${esc(profile.name)} · Built with Three.js</footer>
    </section>
  `;
}

function setupReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 60}ms`;
    io.observe(el);
  });
}

function setupTooltip() {
  const tip = document.getElementById('tooltip');
  window.addEventListener('pointermove', (e) => {
    tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
  });
  return (info) => {
    if (!info) {
      tip.classList.remove('show');
      return;
    }
    tip.innerHTML = `<strong style="color:${info.color}">${esc(info.name)}</strong><span>${esc(info.group)}</span>`;
    tip.classList.add('show');
  };
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

async function init() {
  render();
  setupReveal();

  if (!webglAvailable()) {
    document.body.classList.add('no-webgl');
    return;
  }

  // Wait (briefly) for the web font so canvas-rendered 3D labels use it.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  createWorld(document.getElementById('webgl'), { skills, experience, projects }, {
    reducedMotion,
    onHover: setupTooltip(),
  });
  document.body.classList.add('ready');
}

init();
