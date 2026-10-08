import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium, firefox, webkit as projectWebkit, type Page } from '@playwright/test';

const webkit: typeof projectWebkit = process.env.QA_WEBKIT_RUNTIME
  ? createRequire(import.meta.url)(process.env.QA_WEBKIT_RUNTIME).webkit : projectWebkit;
const engines = { chromium, webkit, firefox };
const out = process.env.QA_OUTPUT_DIR || '/tmp/apple-rail-motion/verified';
await fs.mkdir(out, { recursive: true });
const reports: object[] = [];

async function settled(page: Page, step: number) {
  await page.waitForFunction(index => {
    const track = document.querySelector('.rail-track')!;
    const viewer = document.querySelector<HTMLElement>('.viewer')!;
    return viewer.dataset.currentStep === String(index) && !viewer.classList.contains('metal-flowing') && !track.getAnimations().some(animation => animation.playState === 'running');
  }, step, { polling: 50 });
  await page.waitForFunction(() => !document.querySelector('.badge-number-previous'), { polling: 50 });
  const actual = await page.evaluate(() => ({
    phase: document.querySelector<HTMLElement>('.viewer')!.dataset.phase,
    index: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
    badge: document.querySelector('[data-step-badge-num]')!.textContent,
    screen: document.querySelector('[data-screen-state]')!.getAttribute('data-screen-state'),
    filters: [...document.querySelectorAll('.rail-button,.rail-icon')].map(node => getComputedStyle(node).filter),
    residue: document.querySelector('.step-feedback,.badge-number-previous') !== null,
    motionClass: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
  }));
  assert.equal(actual.phase, '0'); assert.equal(actual.badge, String(step + 1));
  assert(actual.filters.every(value => value === 'none'));
  assert.equal(actual.residue, false);
  assert.equal(actual.motionClass, false);
  return actual;
}

for (const [name, engine] of Object.entries(engines).filter(([key]) => !process.env.QA_ENGINES || process.env.QA_ENGINES.split(',').includes(key))) {
  const browser = await engine.launch({ headless: process.env.QA_HEADED !== '1' });
  try {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: name !== 'firefox' });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('apple-bezel-tutorial-v5.2-touch-learned', '1');
      localStorage.setItem('apple-bezel-tutorial-v5.2-wheel-learned', '1');
      localStorage.removeItem('apple-bezel-tutorial-phase-progress-v1');
    });
    await page.goto(`${process.env.QA_BASE_URL || 'http://127.0.0.1:44122'}/#ios`, { waitUntil: 'domcontentloaded' });
    assert.match(await page.title(), /iPhone 17 Pro/);
    await settled(page, 0);
    // Motion seeking requires a warm target; cold-load transaction behavior is
    // covered separately by screen-readiness-qa.ts.
    await page.evaluate(async () => {
      const image = new Image(); image.src = '/media/screens/settings-screen-user.jpg'; await image.decode();
    });
    await page.waitForTimeout(80);
    await page.evaluate(() => {
      const track = document.querySelector<HTMLElement>('.rail-track')!;
      (window as Window & { releaseY?: number }).releaseY = undefined;
      document.addEventListener('pointerup', () => {
        (window as Window & { releaseY?: number }).releaseY = track.getBoundingClientRect().y;
      }, true);
    });
    const box = await page.locator('.rail-viewport').boundingBox(); assert(box);
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    if (name === 'chromium') {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let n = 1; n <= 6; n++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - n * 8 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x, y - 48, { steps: 6 }); await page.mouse.up();
    }
    // Seek the real compositor keyframes; scheduler FPS does not determine path correctness.
    const trajectory = await page.evaluate(() => {
      const track = document.querySelector<HTMLElement>('.rail-track')!;
      const animation = track.getAnimations().find(item => item instanceof Animation)!;
      if (!animation) throw new Error('Missing rail animation');
      animation.pause();
      const duration = Number(animation.effect!.getTiming().duration);
      const numericFrames = (animation.effect as KeyframeEffect).getKeyframes().map(f => String(f.transform));
      const numericOnly = numericFrames.every(f => !/calc\(|var\(|%/.test(f) && f.includes('translate3d'));
      const frames = [0, .25, .5, .75, 1].map(fraction => {
        animation.currentTime = duration * fraction;
        return { fraction, y: track.getBoundingClientRect().y, transform: getComputedStyle(track).transform };
      });
      const releaseY = (window as Window & { releaseY?: number }).releaseY!;
      animation.currentTime = 0; animation.play();
      return { duration, releaseY, frames, numericOnly, numericFrames, trackOwners: track.getAnimations().length };
    });
    assert.equal(trajectory.duration, 420);
    assert(trajectory.numericOnly, JSON.stringify(trajectory.numericFrames));
    assert.equal(trajectory.trackOwners, 1);
    assert(Math.abs(trajectory.frames[0].y - trajectory.releaseY) < 1, `release jumped ${trajectory.frames[0].y - trajectory.releaseY}px`);
    trajectory.frames.slice(1).forEach((frame, index) => assert(frame.y <= trajectory.frames[index].y + .1));
    await settled(page, 1);

    // The user-approved historical icon settle accompanies the directional metal material.
    await page.locator('.rail-viewport').focus(); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep === '2', undefined, { polling: 'raf' });
    const visual = await page.evaluate(() => {
      const number = document.querySelector<HTMLElement>('[data-badge-current]')!;
      const outgoing = document.querySelector<HTMLElement>('.badge-number-previous')!;
      const icon = document.querySelector<HTMLElement>('.rail-button.selected .rail-icon')!;
      const numberAnimation = number.getAnimations()[0];
      const trackAnimation = document.querySelector('.rail-track')!.getAnimations()[0];
      numberAnimation.pause(); numberAnimation.currentTime = 180;
      const result = {
        badgeOpacity: Number(getComputedStyle(number).opacity), badgeTransform: getComputedStyle(number).transform,
        outgoingPosition: getComputedStyle(outgoing).position,
        iconScaleAnimations: icon.getAnimations().filter(item => item instanceof CSSAnimation).length,
        trackOwners: document.querySelector('.rail-track')!.getAnimations().length,
        trackDuration: trackAnimation.effect!.getTiming().duration,
      };
      numberAnimation.play(); return result;
    });
    assert(visual.badgeOpacity > 0 && visual.badgeOpacity < 1);
    assert.notEqual(visual.badgeTransform, 'none'); assert.equal(visual.outgoingPosition, 'absolute');
    assert.equal(visual.iconScaleAnimations, 1); assert.equal(visual.trackOwners, 1);
    await settled(page, 2);

    await page.locator('[data-restart]').click(); await settled(page, 0);
    await page.evaluate(() => {
      (window as Window & { commits?: { step: number; t: number }[] }).commits = [];
      new MutationObserver(records => {
        if (records.some(record => record.attributeName === 'data-current-step')) {
          (window as Window & { commits?: { step: number; t: number }[] }).commits!.push({ step: Number(document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep), t: performance.now() });
        }
      }).observe(document.querySelector('.viewer')!, { attributes: true, attributeFilter: ['data-current-step'] });
    });
    await page.locator('.rail-viewport').focus();
    for (let n = 0; n < 6; n++) await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => !document.querySelector('.viewer')!.classList.contains('metal-flowing') && !document.querySelector('.rail-track')!.getAnimations().some(animation => animation.playState === 'running'), { polling: 50 });
    const rapid = await page.evaluate(() => (window as Window & { commits?: { step: number; t: number }[] }).commits!);
    rapid.slice(1).forEach((commit, index) => {
      assert.equal(commit.step - rapid[index].step, 1);
      assert(commit.t - rapid[index].t >= 420, 'overlapping transaction commits');
    });
    assert(rapid.length <= 3, `unbounded intent queue ${rapid.length}`);
    await settled(page, rapid.at(-1)!.step);
    await page.keyboard.press('ArrowDown'); await page.locator('[data-restart]').click();
    await page.waitForTimeout(560); await settled(page, 0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.rail-viewport').focus(); await page.keyboard.press('ArrowDown');
    await settled(page, 1);
    assert.equal(await page.locator('.rail-track').evaluate(node => node.getAnimations().filter(animation => animation.playState === 'running').length), 0);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `${out}/${name}-settled.png` });
    reports.push({ engine: name, trajectory, visual, rapid, errors, result: 'pass' });
    await fs.writeFile(`${out}/results.json`, JSON.stringify(reports, null, 2));
    console.log(JSON.stringify({ engine: name, result: 'pass', releaseJumpPx: trajectory.frames[0].y - trajectory.releaseY, trackOwners: 1, rapidCommits: rapid.length, reducedMotion: 'pass', resetDuringMotion: 'pass' }));
    await context.close();
  } finally { await browser.close(); }
}
