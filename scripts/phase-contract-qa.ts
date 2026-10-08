import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium, firefox as projectFirefox, webkit as projectWebkit, type Page, type CDPSession } from '@playwright/test';
const firefox: typeof projectFirefox = process.env.QA_FIREFOX_RUNTIME
  ? createRequire(`${process.cwd()}/package.json`)(process.env.QA_FIREFOX_RUNTIME).firefox
  : projectFirefox;
const webkit: typeof projectWebkit = process.env.QA_WEBKIT_RUNTIME
  ? createRequire(`${process.cwd()}/package.json`)(process.env.QA_WEBKIT_RUNTIME).webkit
  : projectWebkit;

const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:44122';
const out = process.env.QA_OUTPUT_DIR ?? '/tmp/apple-tutorial-phase-repair';
const progressKey = 'apple-bezel-tutorial-phase-progress-v1';
await fs.mkdir(out, { recursive: true });

async function state(page: Page) {
  return page.evaluate(() => {
    const viewer = document.querySelector<HTMLElement>('.viewer')!;
    const hud = document.querySelector<HTMLElement>('[data-hud]')!;
    const device = document.querySelector<HTMLElement>('.device')!;
    const copy = document.querySelector<HTMLElement>('.hud-copy')!;
    const box = hud.getBoundingClientRect();
    const images = [...document.querySelectorAll<HTMLImageElement>('.device img, .rail-button.selected img')];
    return {
      phase: Number(viewer.dataset.phase), step: Number(viewer.dataset.currentStep),
      current: document.querySelector('[data-step-current]')!.textContent,
      total: document.querySelector('[data-step-total]')!.textContent,
      title: document.querySelector('[data-step-title]')!.textContent,
      railCount: document.querySelectorAll('.rail-button').length,
      icon: document.querySelector('.rail-button.selected img')!.getAttribute('src'),
      screen: document.querySelector('[data-screen-state]')!.getAttribute('data-screen-state'),
      teaching: viewer.classList.contains('teaching-rail'),
      updating: hud.classList.contains('updating'),
      hudFilter: getComputedStyle(hud).filter, copyFilter: getComputedStyle(copy).filter,
      deviceFilter: getComputedStyle(device).filter,
      hudOpacity: getComputedStyle(hud).opacity, copyOpacity: getComputedStyle(copy).opacity,
      deviceOpacity: getComputedStyle(device).opacity,
      left: box.left, right: innerWidth - box.right, bottom: box.bottom,
      deviceHeight: device.getBoundingClientRect().height,
      imagesLoaded: images.every(image => image.complete && image.naturalWidth > 0),
      activeTabs: document.querySelectorAll('.top-phase-tab.is-active[aria-current="step"]').length,
      nextVisible: !document.querySelector<HTMLButtonElement>('[data-paddlenav="next"]')!.hidden,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
}

async function settled(page: Page, phase: number, step: number) {
  await page.waitForFunction(({ phase, step }) => {
    const viewer = document.querySelector<HTMLElement>('.viewer');
    return viewer?.dataset.phase === String(phase) && viewer.dataset.currentStep === String(step)
      && !document.querySelector('.tutorial-hud.updating') && !viewer.classList.contains('metal-flowing');
  }, { phase, step }, { polling: 100 });
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('.device img, .rail-button.selected img')]
    .every(image => image.complete && image.naturalWidth > 0), undefined, { polling: 100 });
  const actual = await state(page);
  assert.equal(actual.current, String(step + 1));
  assert.equal(actual.total, phase === 0 ? '5' : '1');
  assert.equal(actual.railCount, phase === 0 ? 5 : 1);
  assert.equal(actual.hudFilter, 'none');
  assert.equal(actual.copyFilter, 'none');
  assert(!actual.deviceFilter.includes('blur(') && !actual.deviceFilter.includes('brightness('));
  assert.equal(actual.hudOpacity, '1');
  assert.equal(actual.copyOpacity, '1');
  assert.equal(actual.deviceOpacity, '1');
  assert.equal(actual.activeTabs, 1);
  assert.equal(actual.horizontalOverflow, false);
  assert(Math.abs(actual.left - actual.right) < 1);
  assert.equal(actual.updating, false);
  if (process.env.QA_TRACE) console.log('settled', phase, step, actual.teaching);
  return actual;
}

async function drag(page: Page, selector: string, dx: number, dy: number, cdp?: CDPSession, cancel = false) {
  const box = await page.locator(selector).boundingBox();
  assert(box);
  const x = box.x + box.width / 2;
  const y = selector === '[data-hud]' ? box.y + 26 : box.y + box.height / 2;
  if (cdp) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 6; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 6, y: y + dy * i / 6 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 6 });
    await page.mouse.up();
  }
}

const reports: object[] = [];
const engines = { chromium, webkit, firefox };
const selectedEngines = Object.entries(engines).filter(([name]) => !process.env.QA_ENGINES || process.env.QA_ENGINES.split(',').includes(name));
for (const [name, engine] of selectedEngines) {
  const browser = await engine.launch({ headless: process.env.QA_HEADED !== '1' });
  try {
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, hasTouch: name !== 'firefox', reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.setDefaultNavigationTimeout(12000);
  if (process.env.QA_TRACE) console.log(name, 'page-created');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    // An old flattened step cannot leak into the new phase-local indices.
    await page.addInitScript(() => {
      if (!localStorage.getItem('phase-qa-seeded')) {
        localStorage.setItem('apple-bezel-tutorial-v4.1', '5');
        localStorage.setItem('phase-qa-seeded', '1');
      }
    });
    await page.goto(`${base}/#ios`, { waitUntil: 'domcontentloaded' });
    const cdp = name === 'chromium' ? await context.newCDPSession(page) : undefined;
    const initial = await settled(page, 0, 0);
    assert.equal(initial.teaching, true);
    assert.equal(initial.nextVisible, false);
    assert(initial.deviceHeight >= 480);
    await page.screenshot({ path: `${out}/${name}-phase1-start.png` });

    // First gesture is learn-only; the next is the actual first step transition.
    await drag(page, '[data-rail-viewport]', 0, -60, cdp);
    assert.equal((await settled(page, 0, 0)).teaching, false);
    await drag(page, '[data-rail-viewport]', 0, -60, cdp);
    await settled(page, 0, 1);
    if (cdp) {
      await drag(page, '[data-rail-viewport]', 0, -60, cdp, true);
      await settled(page, 0, 1);
    }

    // A horizontal gesture must NEVER advance a within-phase step.
    await drag(page, '[data-hud]', -80, 0, cdp);
    await settled(page, 0, 1);
    await page.locator('[data-phase-tab="1"]').click();
    await settled(page, 0, 1);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settled(page, 0, 1);


    await drag(page, '[data-rail-viewport]', 0, 60, cdp);
    await settled(page, 0, 0);
    await page.locator('[data-rail-viewport]').focus();
    await page.keyboard.press('ArrowDown');
    await settled(page, 0, 1);
    const target = await page.locator('.rail-button').nth(2).boundingBox();
    assert(target);
    if (name === 'firefox') await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2);
    else await page.touchscreen.tap(target.x + target.width / 2, target.y + target.height / 2);
    await settled(page, 0, 2);

    const railBox = await page.locator('[data-rail-viewport]').boundingBox();
    assert(railBox);
    await page.mouse.move(railBox.x + railBox.width / 2, railBox.y + railBox.height / 2);
    await page.mouse.wheel(0, 80);
    await settled(page, 0, 3);
    await page.locator('[data-rail-viewport]').focus();
    await page.keyboard.press('ArrowDown');
    const end = await settled(page, 0, 4);
    assert.equal(end.nextVisible, true);
    await drag(page, '[data-rail-viewport]', 0, -60, cdp);
    await settled(page, 0, 4); // vertical boundary does not silently cross phases
    await page.screenshot({ path: `${out}/${name}-phase1-end.png` });

    if (cdp) {
      await drag(page, '[data-hud]', -80, 0, cdp, true);
      await settled(page, 0, 4);
    }
    await drag(page, '[data-hud]', -80, 0, cdp);
    const phase2 = await settled(page, 1, 0);
    assert.equal(phase2.icon, '/media/rail-apple-logo.svg');
    assert.equal(phase2.screen, 'appleidService');
    assert.equal(phase2.title, '打开 appleid.1yo.cc');
    assert.equal(phase2.nextVisible, false);
    assert.equal(await page.locator('.hud-proof').count(), 0);
    const launch = await page.locator('.hud-launch-button').boundingBox();
    assert(launch && launch.height >= 44 && launch.y + launch.height <= 852);
    await page.screenshot({ path: `${out}/${name}-phase2-step1.png` });

    // One native launch in the trailing dock slot; no duplicated inline link.
    assert.equal(await page.locator('[data-hud] a').count(), 1);
    const dockText = await page.locator('[data-hud]').innerText();
    assert.equal((dockText.match(/appleid\.1yo\.cc/g) ?? []).length, 1);
    const outgoing: string[] = [];
    context.on('request', request => {
      if (request.isNavigationRequest() && request.url().startsWith('https://appleid.1yo.cc')) outgoing.push(request.url());
    });
    for (const selector of ['.hud-launch-button']) {
      const popupPromise = context.waitForEvent('page');
      const requestPromise = context.waitForEvent('request', { predicate: request => request.url().startsWith('https://appleid.1yo.cc') });
      await page.locator(selector).click();
      const popup = await popupPromise;
      const request = await requestPromise;
      assert(request.url().startsWith('https://appleid.1yo.cc'));
      await popup.close();
      await settled(page, 1, 0);
    }
    assert(outgoing.length >= 1);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settled(page, 1, 0);
    await drag(page, '[data-rail-viewport]', 0, -60, cdp);
    await settled(page, 1, 0);
    await drag(page, '[data-hud]', 80, 0, cdp);
    await settled(page, 0, 4);
    await page.locator('[data-paddlenav="next"]').click();
    await settled(page, 1, 0);
    await page.locator('[data-phase-tab="0"]').click();
    await settled(page, 0, 4);
    await page.locator('[data-phase-tab="1"]').click();
    await settled(page, 1, 0);
    await page.locator('[data-restart]').click();
    await settled(page, 0, 0);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await settled(page, 0, 0);
    // Corrupt-storage recovery is covered in Chromium/WebKit; Firefox's host automation is unstable across excess reloads.
    if (name !== 'firefox') {
      await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ phase: 1, steps: [99, -1], signoutCompleted: false })), progressKey);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await settled(page, 0, 0);
    }
    assert.deepEqual(errors, []);
    const report = { engine: name, input: cdp ? 'trusted CDP touch + native taps/keyboard/wheel' : 'native pointer drags + keyboard/wheel/taps', initial, end, phase2, outgoing, pageErrors: errors, result: 'pass' };
    reports.push(report);
    await fs.writeFile(`${out}/qa-results.json`, JSON.stringify(reports, null, 2));
    console.log(JSON.stringify({ engine: name, result: 'pass', rail: [initial.railCount, phase2.railCount], counters: ['1/5', '5/5', '1/1'], popupNavigations: outgoing.length }));
  } catch (error) {
    await page.screenshot({ path: `${out}/${name}-failure.png` }).catch(() => {});
    await fs.writeFile(`${out}/${name}-failure.json`, JSON.stringify({ error: String(error), state: await state(page).catch(() => null), pageErrors: errors }, null, 2));
    throw error;
  } finally {
    await context.close();
  }
  } finally {
    await browser.close();
  }
}
await fs.writeFile(`${out}/qa-results.json`, JSON.stringify(reports, null, 2));
