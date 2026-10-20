import { test, expect } from '@playwright/test';
import { profile, skills, experience, projects } from '../src/data.js';

const sections = ['hero', 'skills', 'experience', 'projects', 'built', 'contact'];

// Fails the test on any uncaught error or console.error.
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

test('content is prerendered and readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(profile.name);
  for (const id of sections) await expect(page.locator(`#${id}`)).toBeVisible();
  for (const p of projects) await expect(page.locator(`a.card[href="${p.url}"]`)).toBeVisible();
  for (const e of experience) await expect(page.locator('.timeline')).toContainText(e.company);
  await expect(page.locator('.skill-group')).toHaveCount(skills.length);
  await expect(page.locator('#print-cv')).toBeHidden();
  await context.close();
});

test('WebGL scene boots without errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/ready/, { timeout: 15_000 });
  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('falls back to the plain page without WebGL2', async ({ page }) => {
  const errors = trackErrors(page);
  await page.addInitScript(() => {
    delete window.WebGL2RenderingContext;
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/no-webgl/);
  await expect(page.locator('#webgl')).toBeHidden();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact h2')).toBeVisible();
  expect(errors).toEqual([]);
});

test('honors prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  // Hero is fully visible immediately (no intro animation).
  expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  const role = page.locator('.role-text');
  await expect(role).toHaveText(profile.roles[0]);
  await page.waitForTimeout(3600);
  await expect(role).toHaveText(profile.roles[0]);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await context.close();
});

test('nav links scroll to their section and mark it active', async ({ page, isMobile }) => {
  await page.goto('/');
  const link = page.locator('.nav nav a[href="#projects"]');
  test.skip(isMobile && !(await link.isVisible()), 'nav links hidden on this viewport');
  await link.click();
  await expect(page.locator('#projects h2')).toBeInViewport({ timeout: 5000 });
  await expect(link).toHaveClass(/active/);
  await expect(link).toHaveAttribute('aria-current', 'location');
});

test('skip link is the first focusable element', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard only');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toBeInViewport();
  // Activating it skips the nav: the next Tab lands on the first hero button.
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(page.locator('#hero .btn.primary')).toBeFocused();
});

test('copy email button copies the address', async ({ page, context, browserName }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const btn = page.locator('#copy-email');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveText(/Copied|Selected/);
  await expect(page.locator('#copy-status')).toHaveText(/copied|selected/);
  if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
});

test('no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('ships valid schema.org Person data', async ({ page }) => {
  await page.goto('/');
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld['@type']).toBe('Person');
  expect(ld.name).toBe(profile.fullName);
  expect(ld.sameAs).toEqual(profile.links.map((l) => l.url));
});

test('print layout hides chrome and shows link targets', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.nav')).toBeHidden();
  await expect(page.locator('#built')).toBeHidden();
  const after = await page
    .locator('.card-link')
    .first()
    .evaluate((el) => getComputedStyle(el, '::after').content);
  expect(after).toContain(projects[0].url);
});

test('Save CV button opens the print dialog', async ({ page }) => {
  await page.addInitScript(() => {
    window.print = () => (window.__printed = true);
  });
  await page.goto('/');
  const btn = page.locator('#print-cv');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  expect(await page.evaluate(() => window.__printed)).toBe(true);
});

test('social preview image is served', async ({ page, request }) => {
  await page.goto('/');
  const url = new URL(await page.locator('meta[property="og:image"]').getAttribute('content'));
  const res = await request.get(url.pathname.replace(/^\/tuhuudev\//, '/'));
  expect(res.ok()).toBe(true);
  expect(res.headers()['content-type']).toMatch(/^image\//);
});
