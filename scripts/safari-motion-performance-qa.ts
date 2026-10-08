import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
const runtime = process.env.QA_WEBKIT_RUNTIME;
const webkit = runtime ? createRequire(import.meta.url)(runtime).webkit : createRequire(import.meta.url)('@playwright/test').webkit;
const base = process.env.QA_URL ?? 'http://45.8.22.65:44122/';
const output = process.env.QA_OUTPUT_DIR ?? '/tmp/apple-ios162/perf-contract';
await fs.mkdir(output, { recursive: true });
for (const [name, type] of [['chromium', chromium], ['webkit', webkit]] as const) {
  const browser = await type.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, hasTouch: true });
    const errors: string[] = [];
    page.on('pageerror', (error: Error) => errors.push(String(error)));
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('apple-bezel-tutorial-v5.2-touch-learned', '1');
      const state = window as unknown as Window & { appAnimationQueries: number };
      state.appAnimationQueries = 0;
      const original = Element.prototype.getAnimations;
      Element.prototype.getAnimations = function(options) {
        state.appAnimationQueries++;
        return original.call(this, options);
      };
    });
    await page.goto(`${base.replace(/\/$/, '')}/?safari16=1#ios`);
    const nextScreen = '/media/screens/settings-screen-user.jpg';
    await page.waitForFunction((source: string) => performance.getEntriesByType('resource').some(r => r.name.endsWith(source)), nextScreen);
    await page.waitForTimeout(600);
    const result = await page.evaluate(async () => {
      const root = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
      const nodes = [root.querySelector('picture'), root.querySelector('.metal-fx-stream'), root.querySelector('.metal-fx-bead')];
      const layers = nodes.map(n => getComputedStyle(n!).willChange);
      const before = (window as unknown as Window & { appAnimationQueries: number }).appAnimationQueries;
      const requestStart = performance.now();
      (document.querySelector('[data-step="1"]') as HTMLElement).click();
      await new Promise(resolve => setTimeout(resolve, 650));
      const after = (window as unknown as Window & { appAnimationQueries: number }).appAnimationQueries;
      return {
        appAnimationQueries: after - before,
        retainedNodes: nodes.every(n => root.contains(n)), layers,
        anchorFilter: getComputedStyle(root).filter,
        innerFilter: getComputedStyle(root.querySelector('img')!).filter,
        reflectionLayer: getComputedStyle(document.querySelector('.metal-fx-target-reflection')!).willChange,
        nextScreenshotReady: document.querySelector<HTMLImageElement>('[data-screen] img')!.complete,
        requestedAtSwitch: performance.getEntriesByType('resource').filter(r => r.startTime >= requestStart && r.name.includes('/media/')).map(r => r.name),
        currentStep: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
        userAgent: navigator.userAgent,
      };
    });
    assert.equal(result.appAnimationQueries, 0);
    assert(result.retainedNodes && result.nextScreenshotReady);
    assert(result.layers.every((l: string) => l.includes('transform')), JSON.stringify(result));
    assert(!result.requestedAtSwitch.some((s: string) => s.includes('metal-fx') || s.endsWith(nextScreen)), 'first-use material or target screen request at release');
    assert.equal(result.anchorFilter, 'none');
    assert(result.innerFilter.includes('drop-shadow'));
    assert(result.reflectionLayer.includes('opacity'));
    assert.equal(result.currentStep, '1');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `${output}/${name}-public-full.png` });
    console.log(JSON.stringify({ engine: name, version: browser.version(), result: 'pass', ...result }));
  } finally { await browser.close(); }
}
