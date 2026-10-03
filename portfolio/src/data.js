// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: 'Tu Nguyen',
  handle: 'tuhuudev',
  role: 'Front-end Developer',
  tagline:
    'Building web products across travel, fintech and crypto. Currently exploring applied AI engineering.',
  // Cycled under the name in the hero.
  roles: ['Front-end Developer', 'React · Next.js · TypeScript', 'Booking & seat-map UIs', 'Exploring applied AI'],
  email: 'nguyenhuutu2898@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/tuhuudev' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tuhuudev/' },
  ],
};

// Each group gets its own color in the 3D skill cloud.
export const skills = [
  {
    group: 'Front-end',
    color: '#8b7bff',
    items: ['React', 'Next.js', 'React Native', 'Angular', 'TypeScript'],
  },
  {
    group: 'State',
    color: '#4fd1ff',
    items: ['Redux', 'NgRx', 'Hooks / Context'],
  },
  {
    group: 'Back-end',
    color: '#5cffb1',
    items: ['Node.js', 'Server Actions', 'Supabase', 'PostgreSQL', 'Spring Boot'],
  },
  {
    group: 'Testing',
    color: '#ffcf5c',
    items: ['Vitest', 'JUnit 5', 'MockMvc'],
  },
  {
    group: 'Workflow',
    color: '#ff7ab6',
    items: ['Claude Code', 'Agile / Scrum', 'Code review'],
  },
];

// Shown as orbiting "domains" in 3D and as a timeline in the page.
// Add `company` and `period` fields (e.g. period: '2023 — Present') when you want them shown.
export const experience = [
  {
    domain: 'Travel & Hospitality',
    title: 'Ticketing & booking systems',
    current: true,
    color: '#8b7bff',
    highlights: [
      'Interactive seat maps with real-time hold / release',
      'Full booking flows: search → checkout → order states',
      'Third-party supplier integrations (KKday, CiAPS)',
      'Shipped on an OTA web platform and a super-app webview',
    ],
  },
  {
    domain: 'Fintech',
    title: 'Web products for financial services',
    color: '#4fd1ff',
    highlights: ['Front-end development of fintech web products'],
  },
  {
    domain: 'Crypto',
    title: 'Web products for crypto',
    color: '#ffcf5c',
    highlights: ['Front-end development of crypto web products'],
  },
  {
    domain: 'Applied AI',
    title: 'Self-driven exploration',
    color: '#5cffb1',
    highlights: [
      'AI-assisted development workflow with Claude Code',
      'Shipped AI Stack Builder and AI Model Radar',
    ],
  },
];

export const projects = [
  {
    name: 'mega-shop',
    description:
      'Full-stack e-commerce — Next.js 15 (App Router) + Supabase (PostgreSQL, RLS) + VNPay payment.',
    tags: ['Next.js 15', 'Supabase', 'VNPay'],
    url: 'https://github.com/tuhuudev/mega-shop',
    linkLabel: 'Source',
  },
  {
    name: 'shop-api',
    description:
      'Production-grade REST API — Spring Boot, JWT RS256 + RBAC, PostgreSQL + Flyway, Redis, CI.',
    tags: ['Spring Boot', 'PostgreSQL', 'Redis'],
    url: 'https://github.com/tuhuudev/shop-api',
    linkLabel: 'Source',
  },
  {
    name: 'AI Stack Builder',
    description: 'Interactive AI-tool recommender quiz for small businesses.',
    tags: ['Live', 'Quiz', 'AI tools'],
    url: 'https://ai-stack-builder.pages.dev',
    linkLabel: 'Live site',
  },
  {
    name: 'AI Model Radar',
    description: 'AI model pricing & limits tracker with 500+ generated pages.',
    tags: ['Live', 'SSG', '500+ pages'],
    url: 'https://ai-model-radar.pages.dev',
    linkLabel: 'Live site',
  },
];

// "Under the hood" — the techniques this site itself uses.
export const siteTech = [
  { name: 'Custom GLSL shaders', detail: 'Simplex-noise vertex displacement and fresnel shading on the hero core' },
  { name: 'Scroll-synced WebGL', detail: 'One fixed canvas; each section owns a 3D scene placed at its exact page position' },
  { name: 'Adaptive quality', detail: 'Frame-time monitor lowers pixel ratio and turns off bloom on slower devices' },
  { name: 'Code splitting', detail: 'Page text renders first; Three.js loads in its own chunk afterwards' },
  { name: 'Smooth scrolling', detail: 'Lenis inertial scroll driven from the same requestAnimationFrame as rendering' },
  { name: 'Accessible fallbacks', detail: 'Honors prefers-reduced-motion and works without WebGL' },
];
