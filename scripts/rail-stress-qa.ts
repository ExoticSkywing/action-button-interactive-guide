import { chromium, firefox, type BrowserType } from '@playwright/test';

async function runStress(name: string, browserType: BrowserType) {
  const browser = await browserType.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await page.addInitScript(() => localStorage.setItem('apple-bezel-tutorial-v5.2-touch-learned', '1'));
    await page.goto(process.env.QA_URL ?? 'http://127.0.0.1:4173');
    if (await page.title() !== 'iPhone 17 Pro · 操作按钮教程') throw new Error(`${name}: unexpected application`);
    const rail = page.locator('[data-rail-viewport]');
    const box = await rail.boundingBox();
    if (!box) throw new Error(`${name}: missing rail`);
    await page.evaluate(() => {
      const screen = document.querySelector('[data-screen]')!;
      const viewer = document.querySelector<HTMLElement>('.viewer')!;
      screen.setAttribute('data-stress-swaps', '0');
      viewer.dataset.stressHistory = `${viewer.dataset.currentStep ?? '0'}@${performance.now()}`;
      new MutationObserver(() => {
        viewer.dataset.stressHistory += `,${viewer.dataset.currentStep}@${performance.now()}`;
      }).observe(viewer, { attributes: true, attributeFilter: ['data-current-step'] });
      new MutationObserver(records => {
        const swaps = Number.parseInt(screen.getAttribute('data-stress-swaps') ?? '0', 10);
        screen.setAttribute('data-stress-swaps', String(swaps + records.filter(record => record.type === 'childList').length));
      }).observe(screen, { childList: true });
    });
    for (let index = 0; index < 12; index += 1) {
      const fromY = box.y + box.height * (index % 2 ? .35 : .65);
      const toY = box.y + box.height * (index % 2 ? .65 : .35);
      await page.mouse.move(box.x + box.width / 2, fromY);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, toY, { steps: 2 });
      await page.mouse.up();
      await page.waitForTimeout(90);
    }
    await page.waitForTimeout(1000);
    const result = await page.evaluate(() => ({
      step: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
      screen: document.querySelector<HTMLElement>('[data-screen-state]')!.dataset.screenState,
      swaps: Number.parseInt(document.querySelector<HTMLElement>('[data-screen]')!.dataset.stressSwaps ?? '0', 10),
      history: document.querySelector<HTMLElement>('.viewer')!.dataset.stressHistory!.split(',').map(entry => {
        const [step, time] = entry.split('@').map(Number);
        return { step, time };
      }),
      flowing: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
      switching: document.querySelector('[data-screen]')!.classList.contains('switching'),
      updating: document.querySelector('[data-hud]')!.classList.contains('updating'),
      beamPaused: document.querySelector('[data-beam]')!.hasAttribute('data-paused'),
    }));
    const screenByStep = ['settings', 'action', 'translate', 'complete', 'confirmSignout', 'signedOutMedia', 'identityChoice'];
    const adjacentOnly = result.history.every((entry, index) => index === 0 || Math.abs(entry.step - result.history[index - 1].step) <= 1);
    const serialized = result.history.every((entry, index) => index <= 1 || entry.time - result.history[index - 1].time >= 400);
    const passed = result.screen === screenByStep[Number(result.step)] && result.swaps === result.history.length - 1 && adjacentOnly && serialized && !result.flowing && !result.switching && !result.updating && !result.beamPaused;
    console.log(JSON.stringify({ engine: name, ...result, adjacentOnly, serialized, passed }));
    return passed;
  } finally {
    await browser.close();
  }
}

const results = [];
results.push(await runStress('chromium', chromium));
results.push(await runStress('firefox', firefox));
if (results.includes(false)) process.exitCode = 1;
