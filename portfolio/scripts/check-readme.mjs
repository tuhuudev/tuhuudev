// Checks that the GitHub profile README (../README.md) agrees with src/data.js.
// Run: npm run check:readme
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { profile, projects, skills } from '../src/data.js';

const readme = readFileSync(fileURLToPath(new URL('../../README.md', import.meta.url)), 'utf8');
const norm = (s) => s.toLowerCase().replace(/[-\s]+/g, '');
const problems = [];
const expect = (ok, msg) => ok || problems.push(msg);

expect(norm(readme).includes(norm(profile.role)), `role "${profile.role}" is not mentioned`);
expect(readme.includes(profile.email), `email ${profile.email} is missing`);
expect(readme.includes(profile.siteUrl), `portfolio link ${profile.siteUrl} is missing`);
for (const l of profile.links) {
  if (l.url === `https://github.com/${profile.handle}`) continue; // the README lives on that page
  expect(readme.includes(l.url), `${l.label} link ${l.url} is missing`);
}
for (const p of projects) expect(readme.includes(p.url), `project "${p.name}" (${p.url}) is missing`);

// Every repo of this account linked from the README should be a featured project
// (guards against linking repos that are private or no longer featured).
const projectUrls = new Set(projects.map((p) => p.url));
const repoLinks = readme.match(new RegExp(`https://github\\.com/${profile.handle}/[\\w.-]+`, 'g')) ?? [];
for (const url of repoLinks) expect(projectUrls.has(url), `README links ${url}, which is not a project in data.js`);

// Headline frameworks from data.js should appear in the stack list.
const core = skills.find((g) => g.group.startsWith('Frameworks'))?.items ?? [];
for (const name of core.filter((n) => ['React', 'Next.js', 'Angular', 'React Native'].includes(n))) {
  expect(readme.includes(name), `stack item "${name}" is missing`);
}

if (problems.length) {
  console.error(`README.md is out of sync with portfolio/src/data.js:\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log('README.md is in sync with src/data.js');
