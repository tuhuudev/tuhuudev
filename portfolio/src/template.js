// Pure HTML template for the page content. Used at build time (prerendered into index.html,
// so text is visible before any JS runs and crawlers can read it) and by the dev server.

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderApp({ profile, skills, experience, education, projects, siteTech }) {
  return `
    <section id="hero" class="section" data-scene="hero" data-side="right">
      <div class="content left">
        <p class="eyebrow reveal">Hi, I'm</p>
        <h1 class="reveal">${esc(profile.name)}</h1>
        <p class="role reveal"><span class="role-text" aria-live="polite">${esc(profile.roles[0])}</span><span class="caret" aria-hidden="true"></span></p>
        <p class="lead reveal">${esc(profile.tagline)}</p>
        <dl class="stats reveal">
          ${profile.stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join('')}
        </dl>
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
        <h2 class="reveal">Where I've worked</h2>
        <ol class="timeline">
          ${experience
            .map(
              (e) => `
            <li class="reveal" style="--accent:${e.color}">
              <div class="tl-head">
                <h3>${esc(e.company)}</h3>
                ${e.current ? '<span class="badge">Current</span>' : ''}
                <span class="period">${esc(e.period)}</span>
              </div>
              <p class="tl-title">${esc(e.title)} · ${esc(e.domain)}</p>
              <ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
              <div class="tags">${e.stack.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
            </li>`
            )
            .join('')}
        </ol>
        <div class="edu reveal">
          <p class="eyebrow">Education</p>
          <h3>${esc(education.degree)}</h3>
          <p>${esc(education.school)} · <span class="period">${esc(education.period)}</span></p>
          <p class="muted">${esc(education.languages)}</p>
        </div>
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
