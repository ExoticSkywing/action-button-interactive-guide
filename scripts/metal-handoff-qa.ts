import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { chromium, firefox, webkit as installedWebkit, type Page, type Browser } from '@playwright/test';

const require = createRequire(import.meta.url);
const webkit = process.env.QA_WEBKIT_RUNTIME ? require(process.env.QA_WEBKIT_RUNTIME).webkit : installedWebkit;
const output = process.env.QA_OUTPUT_DIR ?? '/tmp/apple-metal-restore-qa';
const base = process.env.QA_BASE_URL ?? 'http://45.8.22.65:44122/#ios';
const engines = (process.env.QA_ENGINES ?? 'chromium,webkit').split(',');
const reference = 'ba091f73d90aff0a2eec1cd9e56be0b4761e8b57';
const referenceCSS = execFileSync('git', ['show', `${reference}:src/style.css`], { encoding: 'utf8' });
await fs.mkdir(output, { recursive: true });

async function referenceFrames(page: Page, name: string) {
  const start = referenceCSS.indexOf(`@keyframes ${name}{`);
  assert(start >= 0);
  const end = referenceCSS.indexOf('}}', start) + 2;
  return page.evaluate(({ keyframes, name }) => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-1000px;visibility:hidden';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${keyframes}.reference{animation:${name} 460ms cubic-bezier(.22,1,.36,1)}</style><div class="reference"></div>`;
    document.body.append(host);
    const frames = (shadow.querySelector('.reference')!.getAnimations()[0].effect as KeyframeEffect).getKeyframes().map(f =>
      ({ offset: Number(Number(f.offset).toFixed(6)), easing: f.easing, transform: f.transform ? String(f.transform).replace(/scale\(([-\d.]+), \1\)/g, 'scale($1)') : null, opacity: f.opacity ?? null }));
    host.remove(); return frames;
  }, { keyframes: referenceCSS.slice(start, end), name });
}

async function settle(page: Page) {
  await page.waitForFunction(() => !document.querySelector('.viewer')!.classList.contains('metal-flowing') &&
    !document.querySelector('.rail-track')!.getAnimations().some(a => a.playState === 'running'));
}
async function material(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
    const picture = root.querySelector<HTMLElement>('picture')!;
    const trail = root.querySelector<HTMLElement>('.metal-fx-stream')!;
    const bead = root.querySelector<HTMLElement>('.metal-fx-bead')!;
    const track = document.querySelector('.rail-track')!;
    return {
      step: Number(document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep),
      ringCount: document.querySelectorAll('.metal-fx-anchor').length,
      positionalSurfaces: document.querySelectorAll('[data-metal-side]').length,
      direction: root.dataset.flowDirection, flowing: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
      coreTransform: getComputedStyle(picture).transform,
      trailOpacity: Number(getComputedStyle(trail).opacity), beadOpacity: Number(getComputedStyle(bead).opacity),
      trackOwners: track.getAnimations().length,
      trackDuration: track.getAnimations()[0]?.effect?.getTiming().duration,
      trackEasing: track.getAnimations()[0]?.effect?.getTiming().easing,
      animations: root.getAnimations({ subtree: true }).filter(a => a.id.startsWith('metal-')).map(a => ({
        name: a.id || (a as CSSAnimation).animationName,
        duration: a.effect!.getTiming().duration, easing: a.effect!.getTiming().easing,
        frames: (a.effect as KeyframeEffect).getKeyframes().map(f => ({ offset: Number(Number(f.offset).toFixed(6)), easing: f.easing, transform: f.transform ? String(f.transform).replace(/scale\(([-\d.]+), \1\)/g, 'scale($1)') : null, opacity: f.opacity ?? null })),
      })),
    };
  });
}

const results = [];
for (const engine of engines) {
  const browser: Browser = await ({ chromium, webkit, firefox }[engine] ?? chromium).launch({ headless: process.env.QA_HEADED !== '1' });
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: engine !== 'firefox' });
  try {
    const page = await context.newPage(); const errors: string[] = [];
    page.on('pageerror', e => errors.push(String(e)));
    await page.addInitScript(() => {
      (window as unknown as { __name: (fn: unknown) => unknown }).__name = fn => fn;
      localStorage.setItem('apple-bezel-tutorial-v5.2-touch-learned', '1');
      localStorage.setItem('apple-bezel-tutorial-v5.2-wheel-learned', '1');
      localStorage.removeItem('apple-bezel-tutorial-phase-progress-v1');
    });
    await page.goto(base); assert.match(await page.title(), /iPhone 17 Pro/);
    await page.evaluate(async () => Promise.all([...document.images].map(i => i.decode().catch(() => undefined))));
    await settle(page);
    const sought = [];
    for (const target of [1, 0]) {
      await page.evaluate(target => {
        document.querySelector<HTMLButtonElement>(`[data-step="${target}"]`)!.click();
        document.getAnimations().forEach(a => {
          if (((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.('.rail-viewport,.rail-step-badge')) { a.pause(); a.currentTime = 0; }
        });
      }, target);
      const state = await material(page);
      const direction = target === 1 ? 'next' : 'previous';
      assert.equal(state.direction, direction); assert(state.flowing);
      assert.equal(state.ringCount, 1); assert.equal(state.positionalSurfaces, 0);
      assert.equal(state.trackOwners, 1); assert.equal(state.trackDuration, 420);
      assert.equal(state.trackEasing, 'cubic-bezier(0.22, 1, 0.36, 1)');
      for (const prefix of ['metal-flow-core', 'metal-stream', 'metal-bead']) {
        const name = `${prefix}-${direction}`; const animation = state.animations.find(a => a.name === name);
        assert(animation, `missing historical ${name}`);
        assert.equal(animation.duration, 460);
        assert.equal(animation.easing, 'linear');
        assert.deepEqual(animation.frames, await referenceFrames(page, name), `${name} differs from ${reference}`);
      }
      for (const progress of [0, .24, .48, .76, .99]) {
        await page.evaluate(progress => document.getAnimations().forEach(a => {
          if (((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.('.rail-viewport,.rail-step-badge')) {
            a.pause(); a.currentTime = Number(a.effect!.getTiming().duration) * progress;
          }
        }), progress);
        const frame = await material(page); sought.push({ direction, progress, frame });
        if (progress === .24) {
          assert.notEqual(frame.coreTransform, 'none'); assert(frame.trailOpacity > .1); assert(frame.beadOpacity > .1);
        }
        if (target === 1) await page.screenshot({ path: `${output}/${engine}-restored-${progress}.png` });
      }
      await page.evaluate(() => document.getAnimations().forEach(a => {
        if (((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.('.rail-viewport,.rail-step-badge')) a.finish();
      }));
      await settle(page);
    }
    // Short drag: a release click must not cancel the rebound in WebKit.
    const box = await page.locator('.rail-viewport').boundingBox(); assert(box);
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x, y - 20, { steps: 3 });
    await page.mouse.up();
    const rebound = await page.evaluate(() => {
      const motion = document.querySelector('.rail-track')!.getAnimations()[0];
      if (!motion) throw new Error('release click cancelled the short-drag rebound');
      motion.pause(); motion.currentTime = 0;
      const duration = motion.effect!.getTiming().duration; motion.finish(); return duration;
    });
    assert.equal(rebound, 200); await settle(page);
    await page.waitForTimeout(360); // native release-click suppression window
    // While the source effect is paused, input may update intent but must not
    // restart material, replace a node, or commit the queued step.
    const queued = await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('[data-step="1"]')!.click();
      const root = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
      const core = root.querySelector('picture')!.getAnimations()[0]; core.pause(); core.currentTime = 110;
      document.querySelector<HTMLButtonElement>('[data-step="2"]')!.click();
      return { current: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
        time: core.currentTime, coreRetained: root.querySelector('picture')!.getAnimations()[0] === core };
    });
    assert.deepEqual(queued, { current: '1', time: 110, coreRetained: true });
    await page.evaluate(() => document.getAnimations().forEach(a => {
      if (((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest?.('.rail-viewport,.rail-step-badge')) a.finish();
    }));
    await settle(page);
    assert.equal((await material(page)).step, 2);
    assert.equal((await material(page)).flowing, false);
    assert.equal(await page.locator('.step-feedback,.badge-number-previous').count(), 0);
    // Reset cancels the material, queue and timers; old onfinish cannot resurrect it.
    await page.evaluate(() => {
      document.querySelector<HTMLButtonElement>('[data-step="3"]')!.click();
      document.querySelector<HTMLButtonElement>('[data-step="4"]')!.click();
      document.querySelector<HTMLButtonElement>('[data-restart]')!.click();
    });
    await page.waitForTimeout(550); await settle(page);
    assert.equal((await material(page)).step, 0); assert.equal((await material(page)).flowing, false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('[data-step="1"]').click(); await settle(page);
    const reduced = await material(page);
    assert.equal(reduced.animations.length, 0); assert.equal(reduced.trackOwners, 0);
    const reflectionSource = await page.evaluate(() => getComputedStyle(document.querySelector('.reflection-above .metal-fx-target-reflection')!, '::before').backgroundImage);
    assert(reflectionSource.includes('chromatic-reflection-bottom-80.png'), 'reduced motion must use static reflection');
    assert.equal(reduced.step, 1);
    assert.equal(await page.locator('.metal-fx-anchor img').evaluate(i => (i as HTMLImageElement).currentSrc.endsWith('.png')), true);
    assert.deepEqual(errors, []);
    const report = { engine, result: 'pass', reference, matchedDirectionalAnimations: 6, sought, shortDragRebound: 'pass', uninterruptedQueuedIntent: 'pass', reset: 'pass', reducedMotion: 'pass' };
    results.push(report);
    console.log(JSON.stringify({ ...report, sought: sought.length }));
  } finally { await context.close(); await browser.close(); }
}
await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
