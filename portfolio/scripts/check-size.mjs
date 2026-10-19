// Bundle budget for the built site (run after `npm run build`): the page itself must stay small and
// Three.js must stay out of the initial load. Run: npm run check:size
import { readFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const html = readFileSync(`${dist}index.html`, 'utf8');
const kb = (file) => gzipSync(readFileSync(`${dist}${file}`)).length / 1024;

// Everything index.html loads up front (scripts, stylesheets, modulepreloads).
const eager = [...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
const budgets = { js: 13, css: 6 }; // KB gzip
const problems = [];

for (const file of eager) {
  const size = kb(file);
  const type = file.endsWith('.css') ? 'css' : 'js';
  console.log(`${file.padEnd(36)} ${size.toFixed(2)} KB gzip (budget ${budgets[type]} KB)`);
  if (size > budgets[type]) problems.push(`${file} is ${size.toFixed(2)} KB gzip, over the ${budgets[type]} KB budget`);
  if (/scene|three/i.test(file)) problems.push(`${file} is loaded eagerly; Three.js must stay lazy-loaded`);
}
const lazy = readdirSync(`${dist}assets`).filter((f) => f.startsWith('scene-') && f.endsWith('.js'));
if (!lazy.length) problems.push('no lazy scene-*.js chunk found');
console.log(`lazy: ${lazy.map((f) => `${f} ${kb(`assets/${f}`).toFixed(1)} KB gzip`).join(', ')}`);

if (problems.length) {
  console.error(`\nBundle budget failed:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
