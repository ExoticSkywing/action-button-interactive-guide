import { chromium, firefox, type Browser, type BrowserType, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.QA_URL ?? 'http://127.0.0.1:4173';
const out = path.resolve(process.env.QA_OUTPUT_DIR ?? 'RECON/qa-output');
await mkdir(out, { recursive: true });
const results: unknown[] = [];
const failures: string[] = [];
const stepContracts = [
  { index: 0, screen: 'settings', title: '打开“设置”', image: '/media/screens/home-screen-user.jpg', body: ['打开你 iPhone 上的'] },
  { index: 1, screen: 'action', title: '进入“Apple 账户”', image: '/media/screens/settings-screen-user.jpg', body: ['顶部的头像', 'Apple 账户'] },
  { index: 2, screen: 'translate', title: '进入“媒体与购买项目”', image: '/media/screens/apple-account-screen-user.jpg', body: ['媒体与购买项目'] },
  { index: 3, screen: 'complete', title: '退出登录“媒体与购买项目”', image: '/media/screens/media-purchases-signout-user.jpg', body: ['严格保证', '媒体与购买项目', '退出登录'] },
  { index: 4, screen: 'confirmSignout', title: '再次确认“退出登录”', image: '/media/screens/media-signout-confirm-user.jpg', body: ['退出登录', '若未出现', '可跳过此步'] },
  { index: 5, screen: 'signedOutMedia', title: '准备登入新的Apple账户', image: '/media/screens/media-signed-out-account-user.jpg', body: ['第3步', '媒体与购买项目', '1,2两步', '没有任何反应'] },
  { index: 6, screen: 'identityChoice', title: '选择其他身份（Apple账户）', image: '/media/screens/apple-account-identity-choice-user.jpg', body: ['第二个选项', '其他', 'Apple ID账户'] },
] as const;

async function dragRail(page: Page, direction: 'up' | 'down') {
  const box = await page.locator('[data-rail-viewport]').boundingBox();
  if (!box) throw new Error('rail has no box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + (direction === 'up' ? -54 : 54), { steps: 8 });
  await page.mouse.up();
}

async function waitForScreen(page: Page, state: string) {
  await page.waitForFunction(expected => document.querySelector<HTMLElement>('[data-screen-state]')?.dataset.screenState === expected, state);
}

async function runCase(engine: string, type: BrowserType, width: number, height: number) {
  const expectsTouch = width <= 590;
  let browser: Browser | undefined;
  let page: Page | undefined;
  try {
    browser = await type.launch({ headless: true });
    page = await browser.newPage({ viewport: { width, height }, hasTouch: expectsTouch });
    page.setDefaultTimeout(12_000);
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const requestFailures: string[] = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => requestFailures.push(`${request.method()} ${request.url()}`));

    await page.addInitScript(() => {
      if (sessionStorage.getItem('__qa_storage_reset') === '1') return;
      localStorage.clear();
      sessionStorage.setItem('__qa_storage_reset', '1');
    });
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 15_000 });
    if (await page.title() !== 'iPhone 17 Pro · 操作按钮教程') throw new Error(`unexpected application at ${base}`);
    await waitForScreen(page, 'settings');

    const expectedGesture = expectsTouch ? 'touch' : 'wheel';
    const expectedCopy = expectsTouch ? '先在左侧按钮上练习一次上下滑动，教程仍从第 1 步开始' : '先将鼠标移到左侧按钮上滚动一次，教程仍从第 1 步开始';
    const initial = await page.locator('[data-screen-state]').getAttribute('data-screen-state');
    const railCount = await page.locator('[data-step]').count();
    const hudButtonCount = await page.locator('[data-hud] button').count();
    const coachmark = page.locator('[data-rail-coachmark]');
    const initialCoachmark = await coachmark.evaluate(element => {
      const touch = element.querySelector('.touch-gesture-demo')!;
      const wheel = element.querySelector('.wheel-gesture-demo')!;
      const gesture = element.querySelector(getComputedStyle(touch).display !== 'none' ? '.touch-gesture-demo svg' : '.wheel-gesture-demo svg')!;
      const coach = gesture.getBoundingClientRect();
      const buttons = [...document.querySelectorAll('[data-step]')].map(node => node.getBoundingClientRect());
      const selected = document.querySelector('.rail-button.selected')!.getBoundingClientRect();
      const device = document.querySelector('[data-device]')!.getBoundingClientRect();
      const hud = document.querySelector('[data-hud]')!.getBoundingClientRect();
      return {
        gesture: (element as HTMLElement).dataset.gesture,
        hidden: element.getAttribute('aria-hidden'),
        opacity: getComputedStyle(element).opacity,
        touchDisplay: getComputedStyle(touch).display,
        wheelDisplay: getComputedStyle(wheel).display,
        accessibleCopy: element.querySelector('[data-gesture-copy]')?.textContent?.trim(),
        describedBy: document.querySelector('[data-rail-viewport]')?.getAttribute('aria-describedby'),
        buttonCollisions: buttons.filter(rect => !(coach.right <= rect.left || coach.left >= rect.right || coach.bottom <= rect.top || coach.top >= rect.bottom)).length,
        horizontalGap: Math.min(Math.abs(coach.right - selected.left), Math.abs(coach.left - selected.right)),
        deviceCollision: !(coach.right <= device.left || coach.left >= device.right || coach.bottom <= device.top || coach.top >= device.bottom),
        hudCollision: !(coach.right <= hud.left || coach.left >= hud.right || coach.bottom <= hud.top || coach.top >= hud.bottom),
        visibleProse: [...element.querySelectorAll('span:not(.sr-only)')].map(node => node.textContent?.trim()).filter(Boolean),
        coarse: matchMedia('(pointer: coarse)').matches,
        fine: matchMedia('(pointer: fine)').matches,
      };
    });
    const beamInitiallyPaused = await page.locator('[data-beam="tutorial-hud"]').evaluate(element => element.hasAttribute('data-paused'));
    const reflectionStep0 = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.rail-button')].map((button, index) => {
      const layer = button.querySelector<HTMLElement>('.metal-fx-target-reflection')!;
      return { index, classes: button.className, visibility: getComputedStyle(layer).visibility, opacity: getComputedStyle(layer).opacity, background: getComputedStyle(layer, '::before').backgroundImage };
    }));
    const initialShot = path.join(out, `bezel-v4-${engine}-${width}x${height}-gesture-${expectedGesture}.png`);
    await page.screenshot({ path: initialShot, fullPage: true });

    await page.locator('[data-step="1"]').evaluate((element: HTMLElement) => element.click());
    const blockedClickState = await page.locator('[data-screen-state]').getAttribute('data-screen-state');
    if (expectsTouch) await dragRail(page, 'up');
    else {
      await page.locator('[data-rail-viewport]').hover();
      await page.mouse.wheel(0, 120);
    }
    await page.waitForTimeout(760);
    const practiceState = await page.evaluate(() => ({
      screen: document.querySelector('[data-screen-state]')?.getAttribute('data-screen-state'),
      current: document.querySelector('.viewer')?.getAttribute('data-current-step'),
      selected: document.querySelector('.rail-button.selected')?.getAttribute('data-step'),
      hud: document.querySelector('[data-step-count]')?.textContent,
      stored: localStorage.getItem('apple-bezel-tutorial-v4.1'),
      touchLearned: localStorage.getItem('apple-bezel-tutorial-v5.2-touch-learned'),
      wheelLearned: localStorage.getItem('apple-bezel-tutorial-v5.2-wheel-learned'),
      practicing: document.querySelector('.viewer')?.classList.contains('practicing-rail'),
    }));

    await page.locator('[data-step="1"]').evaluate((element: HTMLElement) => element.click());
    await page.waitForTimeout(140);
    const nextFlow = await page.evaluate(() => {
      const anchor = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
      return {
        direction: anchor.dataset.flowDirection,
        flowing: anchor.classList.contains('flowing'),
        viewerFlowing: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
        coreAnimation: getComputedStyle(anchor.querySelector('picture')!).animationName,
        streamAnimation: getComputedStyle(anchor.querySelector('.metal-fx-stream')!).animationName,
        streamOpacity: Number(getComputedStyle(anchor.querySelector('.metal-fx-stream')!).opacity),
        beadAnimation: getComputedStyle(anchor.querySelector('.metal-fx-bead')!).animationName,
        beadOpacity: Number(getComputedStyle(anchor.querySelector('.metal-fx-bead')!).opacity),
        coachOpacity: getComputedStyle(document.querySelector('[data-rail-coachmark]')!).opacity,
        beamAngle: getComputedStyle(document.querySelector('[data-beam="tutorial-hud"]')!).getPropertyValue('--beam-angle-tutorial-hud').trim(),
        railFeedback: document.querySelector('.rail-button.step-feedback')?.getAttribute('data-step') ?? null,
      };
    });
    await page.waitForTimeout(760);
    const nextSettled = await page.evaluate(() => ({
      direction: document.querySelector<HTMLElement>('.metal-fx-anchor')!.dataset.flowDirection ?? null,
      flowing: document.querySelector('.metal-fx-anchor')!.classList.contains('flowing'),
      viewerFlowing: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
      coachOpacity: getComputedStyle(document.querySelector('[data-rail-coachmark]')!).opacity,
      screen: document.querySelector<HTMLElement>('[data-screen-state]')!.dataset.screenState,
      screenOpacity: getComputedStyle(document.querySelector('[data-screen-state]')!).opacity,
      screenRect: [document.querySelector('[data-screen-state]')!.getBoundingClientRect().width, document.querySelector('[data-screen-state]')!.getBoundingClientRect().height],
      switching: document.querySelector('[data-screen]')!.classList.contains('switching'),
      beamAngle: getComputedStyle(document.querySelector('[data-beam="tutorial-hud"]')!).getPropertyValue('--beam-angle-tutorial-hud').trim(),
      feedback: document.querySelector('.rail-button.step-feedback') !== null || document.querySelector('[data-hud]')!.classList.contains('updating'),
    }));
    const afterClickHidden = await coachmark.getAttribute('aria-hidden');
    await page.locator('[data-step="0"]').evaluate((element: HTMLElement) => element.click());
    const previousFlow = await page.evaluate(() => {
      const anchor = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
      return {
        direction: anchor.dataset.flowDirection,
        flowing: anchor.classList.contains('flowing'),
        beamAngle: getComputedStyle(document.querySelector('[data-beam="tutorial-hud"]')!).getPropertyValue('--beam-angle-tutorial-hud').trim(),
        coreAnimation: getComputedStyle(anchor.querySelector('picture')!).animationName,
        streamAnimation: getComputedStyle(anchor.querySelector('.metal-fx-stream')!).animationName,
        beadAnimation: getComputedStyle(anchor.querySelector('.metal-fx-bead')!).animationName,
      };
    });
    await waitForScreen(page, 'settings');
    await page.waitForTimeout(500);

    if (expectsTouch) await dragRail(page, 'up');
    else {
      await page.locator('[data-rail-viewport]').hover();
      await page.mouse.wheel(0, 120);
    }
    await page.waitForTimeout(340);
    const gestureState = await page.locator('[data-screen-state]').getAttribute('data-screen-state');
    const learnedCoachmark = await coachmark.evaluate((element, expected) => ({
      hidden: element.getAttribute('aria-hidden'),
      opacity: getComputedStyle(element).opacity,
      describedBy: document.querySelector('[data-rail-viewport]')?.getAttribute('aria-describedby'),
      touchStored: localStorage.getItem('apple-bezel-tutorial-v5.2-touch-learned'),
      wheelStored: localStorage.getItem('apple-bezel-tutorial-v5.2-wheel-learned'),
      expectedStored: localStorage.getItem(expected === 'touch' ? 'apple-bezel-tutorial-v5.2-touch-learned' : 'apple-bezel-tutorial-v5.2-wheel-learned'),
    }), expectedGesture);

    if (expectsTouch) await dragRail(page, 'up');
    else {
      await page.waitForTimeout(280);
      await page.mouse.wheel(0, 120);
    }
    await waitForScreen(page, 'translate');
    await page.waitForTimeout(520);
    const beamActive = await page.locator('[data-beam="tutorial-hud"]').evaluate(element => ({
      paused: element.hasAttribute('data-paused'),
      angle: getComputedStyle(element).getPropertyValue('--beam-angle-tutorial-hud').trim(),
      animations: element.getAnimations({ subtree: true }).filter(animation => /beam/.test((animation as CSSAnimation).animationName)).map(animation => ({ name: (animation as CSSAnimation).animationName, state: animation.playState })),
      layers: element.querySelectorAll('.hud-beam-inner,.hud-beam-stroke,.hud-beam-bloom').length,
      z: [getComputedStyle(element.querySelector('.hud-beam-inner')!).zIndex, getComputedStyle(element.querySelector('.hud-beam-stroke')!).zIndex, getComputedStyle(element.querySelector('.hud-beam-bloom')!).zIndex, getComputedStyle(element.querySelector('.hud-copy')!).zIndex].map(Number),
      parity: {
        duration: getComputedStyle(element).animationDuration.split(',')[0].trim(),
        strength: getComputedStyle(element).getPropertyValue('--beam-strength').trim(),
        stroke: getComputedStyle(element.querySelector('.hud-beam-stroke')!).opacity,
        inner: getComputedStyle(element.querySelector('.hud-beam-inner')!).opacity,
        bloom: getComputedStyle(element.querySelector('.hud-beam-bloom')!).opacity,
      },
    }));
    const secondGestureState = await page.locator('[data-screen-state]').getAttribute('data-screen-state');
    const reflectionStep2 = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.rail-button')].map((button, index) => {
      const layer = button.querySelector<HTMLElement>('.metal-fx-target-reflection')!;
      return { index, classes: button.className, visibility: getComputedStyle(layer).visibility, opacity: getComputedStyle(layer).opacity, background: getComputedStyle(layer, '::before').backgroundImage, iconZ: getComputedStyle(button.querySelector('.rail-icon')!).zIndex, reflectionZ: getComputedStyle(layer).zIndex };
    }));
    const metal = await page.evaluate(() => {
      const selected = document.querySelector<HTMLElement>('.rail-button.selected')!;
      const anchor = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
      const image = anchor.querySelector<HTMLImageElement>('img')!;
      const a = anchor.getBoundingClientRect();
      const b = selected.getBoundingClientRect();
      return {
        anchors: document.querySelectorAll('.metal-fx-anchor').length,
        selectedCount: document.querySelectorAll('.rail-button.selected').length,
        pointerEvents: getComputedStyle(anchor).pointerEvents,
        natural: [image.naturalWidth, image.naturalHeight],
        complete: image.complete,
        source: image.currentSrc,
        centerDelta: [Math.abs(a.x + a.width / 2 - (b.x + b.width / 2)), Math.abs(a.y + a.height / 2 - (b.y + b.height / 2))],
        rendered: [a.width, a.height],
        iconColor: getComputedStyle(selected).color,
      };
    });
    const fogShot = path.join(out, `bezel-v4-${engine}-${width}x${height}-rail-fog.png`);
    await page.screenshot({ path: fogShot, fullPage: true });

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15_000 });
    await waitForScreen(page, 'translate');
    const restored = await page.locator('[data-screen-state]').getAttribute('data-screen-state');
    const remainsHidden = await coachmark.getAttribute('aria-hidden');
    await page.locator('[data-step="3"]').click();
    await waitForScreen(page, 'complete');
    const completionFeedback = await page.evaluate(() => ({
      angle: getComputedStyle(document.querySelector('[data-beam="tutorial-hud"]')!).getPropertyValue('--beam-angle-tutorial-hud').trim(),
      confirming: document.querySelector('.live-activity')?.classList.contains('confirming') ?? false,
      animationNames: document.querySelector('.live-activity')?.getAnimations({ subtree: true }).map(animation => (animation as CSSAnimation).animationName).filter(Boolean) ?? [],
    }));
    await page.waitForTimeout(520);
    const completionSettled = await page.evaluate(() => ({
      confirming: document.querySelector('.live-activity')?.classList.contains('confirming') ?? false,
      feedback: document.querySelector('.rail-button.step-feedback') !== null || document.querySelector('[data-hud]')!.classList.contains('updating'),
      namedAnimations: document.getAnimations().map(animation => (animation as CSSAnimation).animationName).filter(Boolean),
    }));
    const proof = (await page.locator('[data-step-proof]').textContent()) ?? '';
    await page.locator('[data-close]').click();
    const collapsed = await page.locator('.viewer').getAttribute('data-mode');
    const beamPausedCollapsed = await page.locator('[data-beam="tutorial-hud"]').evaluate(element => element.hasAttribute('data-paused'));
    await page.locator('[data-restore]').click();
    const expanded = await page.locator('.viewer').getAttribute('data-mode');
    await page.waitForTimeout(500);
    const beamPausedExpanded = await page.locator('[data-beam="tutorial-hud"]').evaluate(element => element.hasAttribute('data-paused'));

    await page.locator('[data-step="2"]').evaluate((element: HTMLElement) => element.click());
    await page.locator('[data-close]').evaluate((element: HTMLElement) => element.click());
    const collapsedTransaction = await page.evaluate(() => ({
      mode: document.querySelector<HTMLElement>('.viewer')!.dataset.mode,
      step: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
      screen: document.querySelector<HTMLElement>('[data-screen-state]')!.dataset.screenState,
      stored: localStorage.getItem('apple-bezel-tutorial-v4.1'),
      status: document.querySelector('[data-status]')!.textContent,
      active: (document.activeElement as HTMLElement).dataset.restore !== undefined,
      railInert: document.querySelector<HTMLElement>('.function-rail')!.inert,
      hudInert: document.querySelector<HTMLElement>('[data-hud]')!.inert,
      closeInert: document.querySelector<HTMLElement>('[data-close]')!.inert,
    }));
    await page.waitForTimeout(800);
    const collapsedSettled = await page.evaluate(() => ({
      step: document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep,
      screen: document.querySelector<HTMLElement>('[data-screen-state]')!.dataset.screenState,
      stored: localStorage.getItem('apple-bezel-tutorial-v4.1'),
      status: document.querySelector('[data-status]')!.textContent,
      flowing: document.querySelector('.viewer')!.classList.contains('metal-flowing'),
      switching: document.querySelector('[data-screen]')!.classList.contains('switching'),
    }));
    await page.locator('[data-restore]').click();
    const restoredFocus = await page.evaluate(() => ({
      rail: document.activeElement === document.querySelector('[data-rail-viewport]'),
      railInert: document.querySelector<HTMLElement>('.function-rail')!.inert,
      restoreInert: document.querySelector<HTMLElement>('[data-restore]')!.inert,
    }));
    await page.locator('[data-primary-action]').focus();
    await page.keyboard.press('End');
    const topControlStep = await page.locator('.viewer').getAttribute('data-current-step');
    await page.locator('[data-rail-viewport]').focus();
    await page.keyboard.press('End');
    await waitForScreen(page, 'identityChoice');
    const railKeyboardStep = await page.locator('.viewer').getAttribute('data-current-step');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const stepContractResults = [];
    for (const contract of stepContracts) {
      await page.locator(`[data-step="${contract.index}"]`).evaluate((element: HTMLElement) => element.click());
      await waitForScreen(page, contract.screen);
      await page.waitForFunction(() => {
        const image = document.querySelector<HTMLImageElement>('[data-screen-state] > img');
        return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
      });
      stepContractResults.push(await page.evaluate(expected => {
        const image = document.querySelector<HTMLImageElement>('[data-screen-state] > img')!;
        const body = document.querySelector('[data-step-body]')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        return {
          expected,
          current: Number(document.querySelector<HTMLElement>('.viewer')!.dataset.currentStep),
          selected: Number(document.querySelector<HTMLElement>('.rail-button.selected')!.dataset.step),
          screen: document.querySelector<HTMLElement>('[data-screen-state]')!.dataset.screenState,
          title: document.querySelector('[data-step-title]')!.textContent?.trim(),
          body,
          bodyMatches: expected.body.every(text => body.includes(text)),
          source: new URL(image.currentSrc || image.src).pathname,
          complete: image.complete,
          natural: [image.naturalWidth, image.naturalHeight],
          rendered: [image.getBoundingClientRect().width, image.getBoundingClientRect().height],
        };
      }, contract));
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const stepContractsPassed = stepContractResults.every(result =>
      result.current === result.expected.index &&
      result.selected === result.expected.index &&
      result.screen === result.expected.screen &&
      result.title === result.expected.title &&
      result.bodyMatches &&
      result.source === result.expected.image &&
      result.complete &&
      result.natural.join('x') === '1181x2560' &&
      result.rendered.every(value => value > 0)
    );

    const runtime = await page.evaluate(async () => {
      const stageBackground = getComputedStyle(document.querySelector('.viewer')!).backgroundImage;
      const stageSource = stageBackground.match(/url\(["']?([^"')]+)["']?\)/)?.[1] ?? '';
      const stageImage = new Image();
      stageImage.src = stageSource;
      await stageImage.decode();
      return {
        canvas: document.querySelectorAll('canvas').length,
        video: document.querySelectorAll('video').length,
        webgl: [...document.querySelectorAll('script')].filter(script => /three|lotus|webgl/i.test(script.src + script.textContent)).length,
        bezel: [(document.querySelector('.official-bezel') as HTMLImageElement).naturalWidth, (document.querySelector('.official-bezel') as HTMLImageElement).naturalHeight],
        stageBackground,
        stageAsset: { source: stageImage.currentSrc || stageImage.src, natural: [stageImage.naturalWidth, stageImage.naturalHeight] },
        railFaders: ['::before', '::after'].map(pseudo => getComputedStyle(document.querySelector('[data-rail-viewport]')!, pseudo).content),
      };
    });

    const row = { engine, width, height, expectsTouch, initial, railCount, hudButtonCount, expectedGesture, initialCoachmark, beamInitiallyPaused, reflectionStep0, blockedClickState, practiceState, nextFlow, nextSettled, previousFlow, afterClickHidden, gestureState, learnedCoachmark, beamActive, secondGestureState, reflectionStep2, metal, restored, remainsHidden, completionFeedback, completionSettled, proof, collapsed, beamPausedCollapsed, expanded, beamPausedExpanded, collapsedTransaction, collapsedSettled, restoredFocus, topControlStep, railKeyboardStep, stepContractResults, stepContractsPassed, runtime, consoleErrors, pageErrors, requestFailures, initialShot, fogShot };
    results.push(row);
    const failed =
      initial !== 'settings' || railCount !== 7 || hudButtonCount !== 0 || !beamInitiallyPaused ||
      initialCoachmark.gesture !== expectedGesture || initialCoachmark.hidden !== 'false' || initialCoachmark.opacity !== '1' || initialCoachmark.accessibleCopy !== expectedCopy || initialCoachmark.describedBy !== 'rail-gesture-hint' || initialCoachmark.visibleProse.length !== 0 ||
      (expectsTouch ? initialCoachmark.touchDisplay !== 'grid' || initialCoachmark.wheelDisplay !== 'none' || !initialCoachmark.coarse : initialCoachmark.touchDisplay !== 'none' || initialCoachmark.wheelDisplay !== 'grid' || !initialCoachmark.fine) ||
      initialCoachmark.buttonCollisions !== 0 || initialCoachmark.horizontalGap > 12 || initialCoachmark.deviceCollision || initialCoachmark.hudCollision ||
      reflectionStep0.filter(item => item.visibility === 'visible').length !== 1 || !reflectionStep0[1].classes.includes('reflection-below') || Number(reflectionStep0[1].opacity) < 0.99 || !reflectionStep0[1].background.includes('chromatic-reflection-top-80.webp') || reflectionStep0.some((item, index) => index !== 1 && (item.visibility !== 'hidden' || item.opacity !== '0')) ||
      blockedClickState !== 'settings' || practiceState.screen !== 'settings' || practiceState.current !== '0' || practiceState.selected !== '0' || practiceState.hud !== '第 1 步，共 7 步' || practiceState.stored !== '0' || practiceState.practicing ||
      (expectsTouch ? practiceState.touchLearned !== '1' || practiceState.wheelLearned !== null : practiceState.wheelLearned !== '1' || practiceState.touchLearned !== null) ||
      nextFlow.direction !== 'next' || !nextFlow.flowing || !nextFlow.viewerFlowing || nextFlow.coreAnimation !== 'metal-flow-core-next' || nextFlow.streamAnimation !== 'metal-stream-next' || nextFlow.beadAnimation !== 'metal-bead-next' || nextFlow.coachOpacity !== '0' || nextFlow.beamAngle !== '300deg' || nextFlow.railFeedback !== '1' ||
      nextSettled.direction !== null || nextSettled.flowing || nextSettled.viewerFlowing || nextSettled.coachOpacity !== '0' || nextSettled.screen !== 'action' || nextSettled.screenOpacity !== '1' || nextSettled.screenRect.some(value => value <= 0) || nextSettled.switching || nextSettled.beamAngle !== '300deg' || nextSettled.feedback ||
      previousFlow.direction !== 'previous' || !previousFlow.flowing || previousFlow.coreAnimation !== 'metal-flow-core-previous' || previousFlow.streamAnimation !== 'metal-stream-previous' || previousFlow.beadAnimation !== 'metal-bead-previous' || previousFlow.beamAngle !== '226deg' ||
      afterClickHidden !== 'true' || gestureState !== 'action' || secondGestureState !== 'translate' || beamActive.paused || beamActive.angle !== '42deg' || beamActive.animations.length !== 0 || beamActive.layers !== 3 || beamActive.z.join(',') !== '1,2,3,4' || beamActive.parity.duration !== '0s' || beamActive.parity.strength !== '1' || beamActive.parity.stroke !== '0.26' || beamActive.parity.inner !== '0.42' || beamActive.parity.bloom !== '0.24' ||
      reflectionStep2.filter(item => item.visibility === 'visible').length !== 2 || !reflectionStep2[1].classes.includes('reflection-above') || !reflectionStep2[1].background.includes('chromatic-reflection-bottom-80.webp') || !reflectionStep2[3].classes.includes('reflection-below') || !reflectionStep2[3].background.includes('chromatic-reflection-top-80.webp') || reflectionStep2[0].visibility !== 'hidden' || reflectionStep2[2].visibility !== 'hidden' || reflectionStep2.filter(item => item.visibility === 'visible' && Number(item.iconZ) <= Number(item.reflectionZ)).length !== 0 ||
      learnedCoachmark.hidden !== 'true' || learnedCoachmark.opacity !== '0' || learnedCoachmark.describedBy !== null || learnedCoachmark.expectedStored !== '1' ||
      (expectsTouch ? learnedCoachmark.wheelStored !== null : learnedCoachmark.touchStored !== null) ||
      metal.anchors !== 1 || metal.selectedCount !== 1 || metal.pointerEvents !== 'none' || !metal.complete || metal.natural.join('x') !== '80x80' || !metal.source.endsWith('/media/metal-fx/chromatic-circle-80.webp') || metal.centerDelta.some(value => value > 1) || metal.rendered.some(value => value < 39) ||
      restored !== 'translate' || remainsHidden !== 'true' || completionFeedback.angle !== '134deg' || completionFeedback.confirming || completionFeedback.animationNames.length !== 0 || completionSettled.confirming || completionSettled.feedback || completionSettled.namedAnimations.some(name => ['rail-icon-settle', 'completion-confirm', 'completion-copy', 'completion-check', 'beam-spin-tutorial-hud', 'beam-hue-shift-tutorial-hud'].includes(name)) || proof !== '' || collapsed !== 'collapsed' || !beamPausedCollapsed || expanded !== 'expanded' || beamPausedExpanded ||
      collapsedTransaction.mode !== 'collapsed' || collapsedTransaction.step !== '2' || collapsedTransaction.screen !== 'translate' || collapsedTransaction.stored !== '2' || collapsedTransaction.status !== '教程已关闭，进度已保存' || !collapsedTransaction.active || !collapsedTransaction.railInert || !collapsedTransaction.hudInert || !collapsedTransaction.closeInert ||
      collapsedSettled.step !== collapsedTransaction.step || collapsedSettled.screen !== collapsedTransaction.screen || collapsedSettled.stored !== collapsedTransaction.stored || collapsedSettled.status !== collapsedTransaction.status || collapsedSettled.flowing || collapsedSettled.switching ||
      !restoredFocus.rail || restoredFocus.railInert || !restoredFocus.restoreInert || topControlStep !== '2' || railKeyboardStep !== '6' || !stepContractsPassed ||
      runtime.canvas || runtime.video || runtime.webgl || runtime.bezel.join('x') !== '1350x2760' || !runtime.stageBackground.includes(width <= 600 ? 'helix-haze-mobile.webp' : 'helix-haze-desktop.webp') || runtime.stageAsset.natural.join('x') !== (width <= 600 ? '1200x2133' : '1600x1262') || runtime.railFaders.some(content => content !== 'none') || consoleErrors.length || pageErrors.length || requestFailures.length;
    if (failed) failures.push(`${engine} ${width}x${height}`);
  } catch (error) {
    failures.push(`${engine} ${width}x${height}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await page?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
  }
}

for (const [name, type] of [['chromium', chromium], ['firefox', firefox]] as const) {
  for (const [width, height] of [[390, 844], [590, 1280], [768, 900], [1440, 1000]] as const) {
    await runCase(name, type, width, height);
  }
}
console.log(JSON.stringify({ base, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
