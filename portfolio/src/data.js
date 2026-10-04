// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: 'Tu Nguyen',
  fullName: 'Nguyen Huu Tu',
  handle: 'tuhuudev',
  role: 'Frontend Developer',
  location: 'Ho Chi Minh City, Vietnam',
  tagline:
    '7+ years building web and mobile products across travel, fintech and e-commerce. Currently shipping ticketing & booking systems at VinsmartFuture.',
  // Cycled under the name in the hero.
  roles: ['Frontend Developer', 'React · Next.js · TypeScript', 'Seat maps & booking flows', 'Growing into full-stack'],
  stats: [
    { value: '7+', label: 'years experience' },
    { value: '4', label: 'companies' },
    { value: '3', label: 'domains: travel, fintech, e-commerce' },
  ],
  email: 'nguyenhuutu2898@gmail.com',
  links: [
    { label: 'GitHub', url: 'https://github.com/tuhuudev' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/tuhuudev/' },
  ],
};

// Each group gets its own color in the 3D skill cloud.
export const skills = [
  {
    group: 'Core',
    color: '#8b7bff',
    items: ['TypeScript', 'JavaScript', 'HTML5', 'CSS3 / SCSS'],
  },
  {
    group: 'Frameworks & state',
    color: '#4fd1ff',
    items: ['React', 'Next.js', 'Angular', 'React Native', 'Redux Saga', 'NgRx'],
  },
  {
    group: 'UI',
    color: '#ff9f6b',
    items: ['Tailwind CSS', 'Ant Design', 'Material UI', 'Kendo UI', 'Figma handoff'],
  },
  {
    group: 'Integration',
    color: '#ff7ab6',
    items: ['REST', 'GraphQL', 'Socket.io', 'Firebase', 'Payment gateways', 'Super-app webview'],
  },
  {
    group: 'Back-end',
    color: '#5cffb1',
    items: ['Node.js', 'Server Actions', 'Supabase', 'PostgreSQL', 'Spring Boot'],
  },
  {
    group: 'Testing & workflow',
    color: '#ffcf5c',
    items: ['Vitest', 'JUnit 5', 'Git', 'Agile / Scrum', 'Claude Code'],
  },
];

// Shown as orbiting moons in 3D (labelled by company) and as a timeline in the page.
export const experience = [
  {
    company: 'VinsmartFuture',
    title: 'Frontend Developer',
    domain: 'Travel & Hospitality',
    period: 'Dec 2025 — Present',
    current: true,
    color: '#8b7bff',
    highlights: [
      'Built the VinWonders ticketing & booking product on an OTA web platform and as a webview module in the V-App super app',
      'Interactive event seat map with real-time seat hold / release and availability',
      'Full booking flow: search → checkout across multiple payment providers → order states (pending / confirmed / cancelled / refunded)',
      'Integrated third-party travel suppliers KKday and CiAPS',
    ],
    stack: ['React', 'Next.js', 'TypeScript', 'Redux'],
  },
  {
    company: 'MetacrewVN',
    title: 'Frontend Developer',
    domain: 'E-commerce & social',
    period: 'Nov 2023 — Nov 2025',
    color: '#4fd1ff',
    highlights: [
      'Built e-commerce platforms, landing pages, Korean social-network sites and CMS / admin portals for the Korean parent company',
      'Requirement analysis, screen planning and animation specs; Figma to responsive production UI',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Ant Design'],
  },
  {
    company: 'VietMoney',
    title: 'Frontend Developer',
    domain: 'Fintech',
    period: 'Nov 2021 — Nov 2023',
    color: '#ffcf5c',
    highlights: [
      'End-to-end pawn-loan contract workflow: request → review → asset appraisal → accounting approval → disbursement, incl. warehouse check-in / check-out',
      'React Native apps for customers and branch staff, plus a web CMS for head office',
    ],
    stack: ['React Native', 'Angular', 'TypeScript'],
  },
  {
    company: 'MSX',
    title: 'Frontend Developer',
    domain: 'Enterprise HR',
    period: 'Feb 2019 — Oct 2021',
    color: '#5cffb1',
    highlights: [
      'HR management system for a MobiFone branch: timekeeping, personnel transfers, payroll, Excel import / export',
      'XD / Figma designs to production UI (Bootstrap, SCSS, Material UI)',
    ],
    stack: ['Angular', 'TypeScript'],
  },
];

export const education = {
  school: 'Industrial University of Ho Chi Minh City',
  degree: 'B.Eng., Information Technology',
  period: '2016 — 2020',
  languages: 'Vietnamese (native) · English (good technical reading & writing)',
};

export const projects = [
  {
    name: 'mega-shop',
    description:
      'Full-stack e-commerce on Next.js 15 + Supabase (PostgreSQL, Auth) with VNPay payments; server actions for cart & checkout, unit-tested payment flows.',
    tags: ['Next.js 15', 'Supabase', 'VNPay'],
    url: 'https://github.com/tuhuudev/mega-shop',
    linkLabel: 'Source',
  },
  {
    name: 'shop-api',
    description:
      'E-commerce REST API in Spring Boot: JWT with refresh tokens, role-based access, order-concurrency handling, JUnit / MockMvc tests.',
    tags: ['Spring Boot', 'JWT', 'JUnit'],
    url: 'https://github.com/tuhuudev/shop-api',
    linkLabel: 'Source',
  },
  {
    name: 'AI Stack Builder',
    description: 'Interactive AI-tool recommender quiz for small businesses.',
    tags: ['Astro', 'Cloudflare Pages'],
    url: 'https://ai-stack-builder.pages.dev',
    linkLabel: 'Live site',
  },
  {
    name: 'AI Model Radar',
    description: 'AI model pricing & limits tracker with 500+ pages generated from structured data.',
    tags: ['SSG', '500+ pages'],
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
