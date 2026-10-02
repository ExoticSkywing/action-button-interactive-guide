import { chromium, firefox, type BrowserType } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = (process.env.QA_URL ?? 'http://127.0.0.1:4173').replace(/#.*$/, '');
const out = path.resolve(process.env.QA_OUTPUT_DIR ?? 'RECON/qa-output');
await mkdir(out, { recursive: true });

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1440, height: 1000 },
] as const;
const expectedPlatforms = ['ios', 'android', 'harmony', 'windows', 'macos'];
const failures: string[] = [];
const results: unknown[] = [];

async function runCase(engine: string, browserType: BrowserType, width: number, height: number) {
  const browser = await browserType.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width <= 590 });
    page.setDefaultTimeout(12_000);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const requestFailures: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => requestFailures.push(`${request.method()} ${request.url()}`));

    await page.goto(base, { waitUntil: 'networkidle', timeout: 20_000 });
    const gateway = page.locator('[data-platform-gateway]');
    await page.waitForFunction(() => ['active', 'static', 'fallback'].includes(document.querySelector<HTMLElement>('[data-grid-scan-host]')?.dataset.gridScan ?? ''));
    const gridScan = await page.locator('[data-grid-scan-host]').evaluate((node) => ({
      state: (node as HTMLElement).dataset.gridScan,
      canvases: node.querySelectorAll('canvas').length,
      engine: (node.querySelector('canvas') as HTMLCanvasElement | null)?.dataset.engine,
    }));
    const animatedGrid = ['active', 'static'].includes(gridScan.state ?? '');
    if ((animatedGrid && (gridScan.canvases !== 1 || gridScan.engine !== 'three.js Grid Scan')) || (gridScan.state === 'fallback' && gridScan.canvases !== 0)) throw new Error(`${engine} ${width}: Grid Scan did not mount or fall back safely`);
    const options = page.locator('[data-platform]');
    const available = page.locator('[data-platform][href]');
    const unavailable = page.locator('button[data-platform]:disabled');

    const initial = await page.evaluate(() => {
      const html = document.documentElement;
      const gateway = document.querySelector<HTMLElement>('[data-platform-gateway]')!;
      const tutorial = document.querySelector<HTMLElement>('[data-tutorial-app]')!;
      const body = document.body.getBoundingClientRect();
      const optionRects = [...document.querySelectorAll<HTMLElement>('[data-platform]')].map(option => {
        const rect = option.getBoundingClientRect();
        return { id: option.dataset.platform, width: rect.width, height: rect.height, right: rect.right, left: rect.left };
      });
      return {
        route: html.dataset.route,
        title: document.title,
        hash: location.hash,
        gatewayHidden: gateway.hidden,
        gatewayInert: gateway.inert,
        tutorialHidden: tutorial.hidden,
        tutorialInert: tutorial.inert,
        heading: document.querySelector('#gateway-title')?.textContent?.trim(),
        platforms: [...document.querySelectorAll<HTMLElement>('[data-platform]')].map(node => node.dataset.platform),
        actions: [...document.querySelectorAll<HTMLElement>('.platform-action')].map(node => node.textContent?.trim()),
        scrollOverflow: document.documentElement.scrollWidth > window.innerWidth,
        bodyLeft: body.left,
        bodyRight: body.right,
        optionRects,
      };
    });

    if (initial.title !== '选择设备 · 设备操作教程') throw new Error(`${engine} ${width}: gateway title mismatch`);
    if (initial.route !== 'platforms' || initial.hash !== '' || initial.gatewayHidden || initial.gatewayInert || !initial.tutorialHidden || !initial.tutorialInert) throw new Error(`${engine} ${width}: initial route accessibility mismatch`);
    const heading = (await page.locator('#gateway-title').innerText()).replace(/\s+/g, '');
    if (heading !== '你的设备是什么系统？') throw new Error(`${engine} ${width}: gateway heading mismatch`);
    if (JSON.stringify(initial.platforms) !== JSON.stringify(expectedPlatforms)) throw new Error(`${engine} ${width}: platform order mismatch`);
    if (await options.count() !== 5 || await available.count() !== 1 || await unavailable.count() !== 4) throw new Error(`${engine} ${width}: availability contract mismatch`);
    if (initial.actions.filter(action => action === '准备中').length !== 4 || initial.actions[0] !== '进入教程') throw new Error(`${engine} ${width}: action copy mismatch`);
    if (initial.scrollOverflow || initial.optionRects.some(rect => rect.left < -0.5 || rect.right > width + 0.5 || rect.height < 44)) throw new Error(`${engine} ${width}: gateway overflow or target size failure`);

    await page.keyboard.press('Tab');
    const firstFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label') }));
    await page.keyboard.press('Tab');
    const secondFocus = await page.evaluate(() => ({ platform: (document.activeElement as HTMLElement | null)?.dataset.platform, tag: document.activeElement?.tagName }));
    if (firstFocus.tag !== 'A' || firstFocus.label !== '设备操作教程首页' || secondFocus.platform !== 'ios' || secondFocus.tag !== 'A') throw new Error(`${engine} ${width}: keyboard order mismatch`);

    await page.locator('[data-platform="ios"]').click();
    await page.waitForFunction(() => document.documentElement.dataset.route === 'ios');
    const entered = await page.evaluate(() => ({
      hash: location.hash,
      title: document.title,
      gatewayHidden: document.querySelector<HTMLElement>('[data-platform-gateway]')!.hidden,
      gatewayInert: document.querySelector<HTMLElement>('[data-platform-gateway]')!.inert,
      tutorialHidden: document.querySelector<HTMLElement>('[data-tutorial-app]')!.hidden,
      tutorialInert: document.querySelector<HTMLElement>('[data-tutorial-app]')!.inert,
      screen: document.querySelector<HTMLElement>('[data-screen-state]')?.dataset.screenState,
      focus: (document.activeElement as HTMLElement | null)?.dataset.tutorialHeading ?? null,
      changePlatformHeight: document.querySelector<HTMLElement>('[data-change-platform]')!.getBoundingClientRect().height,
      restartHeight: document.querySelector<HTMLElement>('[data-primary-action]')!.getBoundingClientRect().height,
      navOverflow: document.querySelector<HTMLElement>('.localnav')!.scrollWidth > document.querySelector<HTMLElement>('.localnav')!.clientWidth,
      gridCanvases: document.querySelectorAll('[data-grid-scan-host] canvas').length,
      gridState: document.querySelector<HTMLElement>('[data-grid-scan-host]')!.dataset.gridScan,
    }));
    if (entered.hash !== '#ios' || entered.title !== 'iPhone 17 Pro · 操作按钮教程' || !entered.gatewayHidden || !entered.gatewayInert || entered.tutorialHidden || entered.tutorialInert || entered.screen !== 'settings' || entered.focus === null || entered.changePlatformHeight < 44 || entered.restartHeight < 44 || entered.navOverflow || entered.gridCanvases !== 0 || entered.gridState !== 'stopped') throw new Error(`${engine} ${width}: iOS route contract mismatch`);

    await page.locator('[data-change-platform]').click();
    await page.waitForFunction(() => document.documentElement.dataset.route === 'platforms');
    await page.waitForFunction(() => ['active', 'static', 'fallback'].includes(document.querySelector<HTMLElement>('[data-grid-scan-host]')?.dataset.gridScan ?? ''));
    const returned = await page.evaluate(() => ({ hash: location.hash, title: document.title, focus: document.activeElement?.id, gridCanvases: document.querySelectorAll('[data-grid-scan-host] canvas').length, gridState: document.querySelector<HTMLElement>('[data-grid-scan-host]')?.dataset.gridScan }));
    const returnedGridReady = returned.gridState === 'fallback' ? returned.gridCanvases === 0 : returned.gridCanvases === 1;
    if (returned.hash !== '' || returned.title !== '选择设备 · 设备操作教程' || returned.focus !== 'gateway-title' || !returnedGridReady) throw new Error(`${engine} ${width}: change-platform recovery mismatch`);

    await page.goBack();
    await page.waitForFunction(() => document.documentElement.dataset.route === 'ios');
    if (await page.title() !== 'iPhone 17 Pro · 操作按钮教程') throw new Error(`${engine} ${width}: browser back did not restore tutorial`);
    await page.goBack();
    await page.waitForFunction(() => document.documentElement.dataset.route === 'platforms');
    if (await page.title() !== '选择设备 · 设备操作教程') throw new Error(`${engine} ${width}: browser back did not restore gateway`);

    await page.goto(`${base}#unknown`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.route === 'platforms');
    if (new URL(page.url()).hash !== '') throw new Error(`${engine} ${width}: unknown hash was not recovered`);

    await page.goto(base, { waitUntil: 'networkidle' });
    await gateway.screenshot({ path: path.join(out, `gateway-${engine}-${width}x${height}.png`) });
    if (consoleErrors.length || pageErrors.length || requestFailures.length) throw new Error(`${engine} ${width}: runtime errors ${JSON.stringify({ consoleErrors, pageErrors, requestFailures })}`);

    results.push({ engine, width, height, platforms: initial.platforms, available: await available.count(), unavailable: await unavailable.count(), passed: true });
  } catch (error) {
    failures.push(`${engine} ${width}x${height}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await browser.close();
  }
}

for (const [engine, browserType] of [['chromium', chromium], ['firefox', firefox]] as const) {
  for (const viewport of viewports) await runCase(engine, browserType, viewport.width, viewport.height);
}

console.log(JSON.stringify({ base, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
