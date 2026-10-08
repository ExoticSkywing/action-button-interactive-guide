import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium, webkit as projectWebkit } from '@playwright/test';
const webkit: typeof projectWebkit = process.env.QA_WEBKIT_RUNTIME
  ? createRequire(`${process.cwd()}/package.json`)(process.env.QA_WEBKIT_RUNTIME).webkit : projectWebkit;
const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:44122';
const output = process.env.QA_OUTPUT_DIR ?? '/tmp/apple-screen-ready-qa';
await fs.mkdir(output, { recursive: true });
for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
  const browser = await launcher.launch();
  try {
    for (const scenario of ['commit', 'reset', 'latest', 'error']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true });
      try {
        await context.addInitScript(() => {
          localStorage.clear(); localStorage.setItem('apple-bezel-tutorial-v5.2-touch-learned', '1');
          const state = window as unknown as { unreadyInserted: string[] };
          state.unreadyInserted = [];
          const original = Element.prototype.replaceChildren;
          Element.prototype.replaceChildren = function(...nodes) {
            if (this.matches('[data-screen]') && this.firstElementChild) {
              for (const n of nodes) {
                if (n instanceof Element) for (const image of n.querySelectorAll('img')) {
                  if (!image.complete || image.naturalWidth === 0) state.unreadyInserted.push(image.src);
                }
              }
            }
            return original.apply(this, nodes);
          };
        });
        const page = await context.newPage();
        const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        await page.route('**/*', async route => {
          if (route.request().url().includes('settings-screen-user.jpg')) {
            await gate;
            if (scenario === 'error') { await route.abort(); return; }
          }
          await route.continue();
        });
        await page.goto(`${base}/#ios`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => {
          const i = document.querySelector<HTMLImageElement>('[data-screen] img');
          return i?.complete && i.naturalWidth > 0;
        });
        await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-step="1"]')!.click());
        await page.waitForTimeout(80);
        assert.equal(await page.locator('[data-rail-viewport]').getAttribute('aria-busy'), 'true');
        assert.equal(await page.locator('.viewer').getAttribute('data-current-step'), '0');
        assert.equal(await page.locator('[data-screen-state]').getAttribute('data-screen-state'), 'settings');
        if (scenario === 'reset') await page.locator('[data-restart]').click();
        if (scenario === 'latest') await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-step="2"]')!.click());
        release();
        const target = scenario === 'commit' ? '1' : scenario === 'latest' ? '2' : '0';
        await page.waitForFunction(target => document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep === target
          && !document.querySelector('.viewer.metal-flowing') && !document.querySelector('[aria-busy="true"]'), target);
        await page.waitForTimeout(220);
        assert.equal(await page.locator('.viewer').getAttribute('data-current-step'), target);
        const bad = await page.evaluate(() => (window as unknown as { unreadyInserted: string[] }).unreadyInserted);
        assert.deepEqual(bad, []); assert.deepEqual(errors, []);
        if (scenario === 'error') assert.match(await page.locator('[data-status]').textContent() ?? '', /未能载入/);
        if (scenario === 'commit') {
          // Cold guard is complete; the reverse transition starts synchronously.
          const geometry = await page.evaluate(() => {
            document.querySelector<HTMLButtonElement>('[data-step="0"]')!.click();
            const animation = document.querySelector('.rail-track')!.getAnimations()[0];
            animation.pause(); animation.currentTime = 0;
            const element = document.querySelector<HTMLElement>('.rail-track')!;
            const from = new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
            animation.currentTime = 210;
            const middle = new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
            animation.currentTime = 420;
            const to = new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
            const keyframes = (animation.effect as KeyframeEffect).getKeyframes().map(k => k.transform);
            animation.finish();
            return { from, middle, to, keyframes };
          });
          assert(geometry.from < geometry.middle && geometry.middle < geometry.to);
          assert(!geometry.keyframes.some(k => /calc|var|%/.test(String(k))));
          await page.screenshot({ path: `${output}/${engine}-ready.png` });
        }
        console.log(JSON.stringify({ engine, scenario, result: 'pass', retainedDuringLoad: true, unreadyInserted: bad.length, finalStep: target }));
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
