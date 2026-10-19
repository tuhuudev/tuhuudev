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
});

test('copy email button copies the address', async ({ page, context, browserName }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const btn = page.locator('#copy-email');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveText(/Copied|Selected/);
  if (browserName === 'chromium') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
});

test('no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
