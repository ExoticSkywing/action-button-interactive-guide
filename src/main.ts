import './style.css';
import { chevron, screenNodes, phases } from './tutorial-content';
import { metalDuration, metalFrames } from './metal-motion';
import type { GridScanController } from './grid-scan';
import { renderPlatformGateway } from './platform-navigation';

const root = document.querySelector<HTMLElement>('#app')!;
root.innerHTML = `
  ${renderPlatformGateway()}
  <!--
  THESIS: Apple Product Viewer becomes a task-completion tutorial; refuse the white landing-page-plus-demo scaffold.
  OWN-WORLD: Neutral-black ribbon stage, official orange Product Bezel, one translucent HUD, one monochrome icon rail.
  STORY: Pick a step, see the whole phone state change, recognize proof, and finish independently.
  FIRST VIEWPORT: Dark localnav above a full-bleed viewer; rail and phone read as one object; one card floats at the bottom.
  FORM: Operate mode, official Apple reference canon, seed APPLE-BEZEL-V4. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
  -->
  <main class="experience-shell" data-tutorial-app hidden>
    <nav class="top-phase-nav" aria-label="教程阶段导航">
      <div class="top-phase-tabs">
        ${phases.map((p, idx) => `
          ${idx > 0 ? '<span class="top-phase-divider" aria-hidden="true">/</span>' : ''}
          <button type="button" class="top-phase-tab ${idx === 0 ? 'is-active' : ''}" data-phase-tab="${idx}" aria-label="阶段${idx + 1}：${p.title}">
            <span class="top-phase-badge">0${idx + 1}</span>
            <span class="top-phase-title">${p.title}</span>
          </button>
        `).join('')}
      </div>
      <div class="top-phase-actions">
        <button type="button" class="top-phase-restart" data-primary-action data-restart aria-label="重新开始教程">重新开始</button>
      </div>
    </nav>

    <section id="tutorial" class="viewer" data-mode="expanded" data-phase="0" aria-label="操作按钮分步教程">

      <div class="product-composition">
        <nav class="function-rail" aria-label="教程步骤">
          <div class="rail-viewport" data-rail-viewport tabindex="0" aria-label="教程步骤滚轮" aria-describedby="rail-gesture-hint">
            <div class="rail-track" data-rail-track>
              ${phases[0].steps.map((step, index) => `<button type="button" class="rail-button" data-step="${index}" aria-label="第 ${index + 1} 步：${step.label}" aria-pressed="false"><span class="metal-fx-target-reflection" aria-hidden="true"></span><span class="rail-icon">${step.icon}</span></button>`).join('')}
            </div>
            <span class="metal-fx-anchor" aria-hidden="true"><span class="metal-fx-stream"></span><span class="metal-fx-bead"></span><picture><source media="(prefers-reduced-motion: reduce)" srcset="/media/metal-fx/chromatic-circle-80.png"><img src="/media/metal-fx/chromatic-circle-80.webp" alt=""></picture></span>
          </div>
          <!-- 创意优雅、左侧展示且完美避让开头手势的步骤呼出标牌 -->
          <div class="rail-step-badge" data-rail-step-badge aria-hidden="true">
            <div class="step-badge-bubble">
              <span class="step-badge-dot"></span>
              <span class="step-badge-label">第<strong data-step-badge-num>1</strong>步</span>
            </div>
            <span class="step-badge-pointer" aria-hidden="true">
              <svg viewBox="0 0 6 10" width="5" height="8" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M1 1l4 4-4 4"/>
              </svg>
            </span>
          </div>
          <div class="rail-coachmark" id="rail-gesture-hint" data-rail-coachmark role="status">
            <div class="touch-gesture-demo" aria-hidden="true">
              <svg viewBox="0 0 48 68">
                <path class="swipe-route" d="M41 7v54m0-54-4 4m4-4 4 4m-4 50-4-4m4 4 4-4"/>
                <g class="swipe-hand">
                  <g transform="rotate(90 24 34)">
                    <rect x="19" y="18" width="10" height="29" rx="5"/>
                    <path d="M19 34.5c-2.7-2.6-6.8-1.3-6.8 2.5 0 2.1 1.6 4.2 3.1 6.1l4.5 5.6c1.8 2.2 4.5 3.5 7.4 3.5h2.6c5.3 0 9.5-4.2 9.5-9.5V31.6a3.6 3.6 0 0 0-7.2 0v2.1-1.8a3.5 3.5 0 0 0-7 0v2.5"/>
                    <circle cx="24" cy="18" r="2.2"/>
                  </g>
                </g>
              </svg>
            </div>
            <div class="wheel-gesture-demo" aria-hidden="true">
              <svg viewBox="0 0 48 58">
                <rect class="mouse-shell" x="10" y="5" width="28" height="42" rx="14"/>
                <path class="mouse-divider" d="M24 5v10"/>
                <rect class="mouse-wheel" x="21.5" y="11" width="5" height="10" rx="2.5"/>
                <path class="wheel-cues" d="m24 1-3 3m3-3 3 3m-3 52-3-3m3 3 3-3"/>
              </svg>
            </div>
            <span class="sr-only" data-gesture-copy></span>
          </div>
        </nav>
        <div class="device" data-device>
          <div class="device-screen" data-screen></div>
          <img class="official-bezel" src="/media/bezel/iphone-17-pro-cosmic-orange-portrait.png" alt="Apple 官方星宇橙色 iPhone 17 Pro 正面机框">
        </div>
      </div>

      <span class="hud-attention-cue ann ann-s ann-no-mark" data-note="↓" aria-hidden="true"></span>
      
      <!-- Apple 官方 1:1 底部 Dock 画廊切换控制器 (外置左右独立 PaddleNav + 居中对称 HUD 架构) -->
      <div class="gallery-dock" data-gallery-dock aria-label="教程阶段画廊">
        <!-- 阶段里程碑 / 居中对齐卡片正上方的轻扫教学提示 -->
        <div class="dock-swipe-coachmark" data-dock-coachmark aria-live="polite">
          <span class="swipe-cue-tag">提示</span>
          <span class="swipe-cue-text">完成后向左轻扫，或点右侧 <strong>›</strong></span>
        </div>

        <button type="button" class="paddlenav-button paddlenav-prev is-hidden" data-paddlenav="prev" aria-label="上一阶段" hidden disabled>
          <span class="paddlenav-icon">
            <svg class="icon-control" viewBox="0 0 36 36" aria-hidden="true">
              <path d="m20 25c-.3838 0-.7676-.1465-1.0605-.4395l-5.5-5.5c-.5859-.5854-.5859-1.5356 0-2.1211l5.5-5.5c.5859-.5859 1.5352-.5859 2.1211 0 .5859.5854.5859 1.5356 0 2.1211l-4.4395 4.4395 4.4395 4.4395c.5859.5854.5859 1.5356 0 2.1211-.293.293-.6768.4395-1.0605.4395z"></path>
            </svg>
          </span>
        </button>

        <article class="tutorial-hud" data-hud data-beam="tutorial-hud" data-active>
          <span class="hud-beam-inner" aria-hidden="true"></span>
          <span class="hud-beam-stroke" aria-hidden="true"></span>
          <span class="hud-beam-bloom" data-beam-bloom aria-hidden="true"></span>
          <div class="hud-copy">
            <div class="hud-heading">
              <span class="hud-step-badge" data-step-current-wrap><span data-step-current></span><span aria-hidden="true">/</span><span data-step-total></span><span class="sr-only" data-step-count></span></span>
              <p class="hud-title" data-step-title></p>
            </div>
            <div class="hud-body" data-step-body></div>
          </div>
          <div class="hud-action-slot">
            <a class="hud-launch-button" href="https://appleid.1yo.cc" target="_blank" rel="noopener noreferrer" aria-label="前往 appleid.1yo.cc（新标签页）" hidden>
              <span>前往</span>
              <svg class="hud-launch-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6"/></svg>
            </a>
          </div>
        </article>

        <button type="button" class="paddlenav-button paddlenav-next is-hidden" data-paddlenav="next" aria-label="下一阶段" hidden disabled>
          <span class="paddlenav-icon">
            <svg class="icon-control" viewBox="0 0 36 36" aria-hidden="true">
              <path d="m16 25c-.293 0-.6768-.1465-1.0605-.4395-.5859-.5854-.5859-1.5356 0-2.1211l4.4395-4.4395-4.4395-4.4395c-.5859-.5854-.5859-1.5356 0-2.1211.5859-.5859 1.5352-.5859 2.1211 0l5.5 5.5c.5859.5854.5859 1.5356 0 2.1211l-5.5 5.5c-.293.293-.6768.4395-1.0606.4395z"></path>
            </svg>
          </span>
        </button>
      </div>

      <button class="restore-control" type="button" data-restore aria-label="继续教程"><span>继续教程</span>${chevron('right')}</button>
      <p class="sr-only" aria-live="polite" data-status></p>
    </section>
  </main>`;

const platformGateway = document.querySelector<HTMLElement>('[data-platform-gateway]')!;
const gridScanHost = document.querySelector<HTMLElement>('[data-grid-scan-host]')!;
let gridScan: GridScanController | null = null;
let gridScanRequest = 0;
let gridScanSupport: boolean | null = null;
function supportsGridScan() {
  if (gridScanSupport !== null) {
    if (!gridScanSupport) gridScanHost.dataset.gridScan = 'fallback';
    return gridScanSupport;
  }
  const probe = document.createElement('canvas');
  try {
    const context = probe.getContext('webgl2', { alpha: true }) ?? probe.getContext('webgl', { alpha: true });
    gridScanSupport = context !== null;
    if (!gridScanSupport) gridScanHost.dataset.gridScan = 'fallback';
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    gridScanSupport = false;
    gridScanHost.dataset.gridScan = 'fallback';
  }
  return gridScanSupport;
}
const tutorialApp = document.querySelector<HTMLElement>('[data-tutorial-app]')!;
const gatewayTitle = document.querySelector<HTMLElement>('#gateway-title')!;
const tutorialHeading = document.querySelector<HTMLElement>('[data-tutorial-heading]');
const viewer = document.querySelector<HTMLElement>('.viewer')!;
const screen = document.querySelector<HTMLElement>('[data-screen]')!;
const status = document.querySelector<HTMLElement>('[data-status]')!;
const stepCount = document.querySelector<HTMLElement>('[data-step-count]')!;
const stepCurrent = document.querySelector<HTMLElement>('[data-step-current]')!;
const stepTotal = document.querySelector<HTMLElement>('[data-step-total]')!;
const stepTitle = document.querySelector<HTMLElement>('[data-step-title]')!;
const stepBody = document.querySelector<HTMLElement>('[data-step-body]')!;
// const stepProof = document.querySelector<HTMLElement>('[data-step-proof]')!;
const hud = document.querySelector<HTMLElement>('[data-hud]')!;
const hudLaunch = document.querySelector<HTMLAnchorElement>('.hud-launch-button')!;
const paddlePrev = document.querySelector<HTMLButtonElement>('[data-paddlenav="prev"]');
const paddleNext = document.querySelector<HTMLButtonElement>('[data-paddlenav="next"]');
const functionRail = document.querySelector<HTMLElement>('.function-rail')!;
const railViewport = document.querySelector<HTMLElement>('[data-rail-viewport]')!;
const railTrack = document.querySelector<HTMLElement>('[data-rail-track]')!;
const metalFxAnchor = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
const railCoachmark = document.querySelector<HTMLElement>('[data-rail-coachmark]')!;
const dockCoachmark = document.querySelector<HTMLElement>('[data-dock-coachmark]');
let dockLearned = false;
const gestureCopy = document.querySelector<HTMLElement>('[data-gesture-copy]')!;
const touchLearnedKey = 'apple-bezel-tutorial-v5.2-touch-learned';
const wheelLearnedKey = 'apple-bezel-tutorial-v5.2-wheel-learned';
const coarsePointer = window.matchMedia('(pointer: coarse)');
const anyCoarsePointer = window.matchMedia('(any-pointer: coarse)');
function preferredRailInput(): 'touch' | 'wheel' {
  const touchCapable = navigator.maxTouchPoints > 0 || 'ontouchstart' in window || anyCoarsePointer.matches || coarsePointer.matches;
  return touchCapable ? 'touch' : 'wheel';
}
type PhaseIndex = number;
let currentPhase: PhaseIndex = 0;
let currentStepInPhase = 0;
const phaseStepPositions: number[] = [0, 0, 0];
let signoutCompleted = false;
let railLearned = localStorage.getItem(preferredRailInput() === 'touch' ? touchLearnedKey : wheelLearnedKey) === '1';
const stepTransitionDuration = metalDuration;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let railMotion: Animation | null = null;
let badgeMotions: Animation[] = [];
let stepMotionActive = false;
let queuedStepIndex: number | null = null;
const badgeNum = document.querySelector<HTMLElement>('[data-step-badge-num]');
let metalMotion: Animation | null = null;
const railSettleDuration = 420;
const railSettleEasing = 'cubic-bezier(.22,1,.36,1)';

// Resolve the tiny rail's dimensions at route/resize boundaries, not on pointer
// release. Old WebKit must not parse calc()/var() inside compositor keyframes.
let railSize = 44;
let railPitchPx = 56;
let railHalfWidth = 22;
let railGeometryPending = false;
function measureRailGeometry() {
  if (tutorialApp.hidden || stepMotionActive || railPointerId !== null) { railGeometryPending = true; return; }
  const button = railTrack.querySelector<HTMLElement>('.rail-button');
  if (!button) return;
  const style = getComputedStyle(railTrack);
  railSize = parseFloat(getComputedStyle(button).height) || railSize;
  railPitchPx = railSize + (parseFloat(style.rowGap) || 0);
  railHalfWidth = (parseFloat(style.width) || railTrack.offsetWidth) / 2;
  railGeometryPending = false;
  railTrack.style.transform = railTransform(currentStepInPhase);
}
function railTransform(index: number, offset = 0) {
  return `translate3d(${-railHalfWidth}px, ${-index * railPitchPx - railSize / 2 + offset}px, 0px)`;
}

function syncBadgeNumber(index: number, animate: boolean, direction: -1 | 1) {
  if (!badgeNum) return;
  badgeMotions.forEach((motion) => motion.cancel());
  badgeMotions = [];
  const previous = badgeNum.querySelector('[data-badge-current]')?.textContent ?? badgeNum.textContent;
  const next = String(index + 1);
  const incoming = document.createElement('span');
  incoming.dataset.badgeCurrent = '';
  incoming.textContent = next;
  badgeNum.replaceChildren(incoming);
  if (!animate || previous === next) return;
  const outgoing = document.createElement('span');
  outgoing.className = 'badge-number-previous';
  outgoing.textContent = previous;
  badgeNum.append(outgoing);
  const options = { duration: stepTransitionDuration, easing: railSettleEasing };
  badgeMotions = [
    incoming.animate([{ opacity: 0, transform: `translateY(${direction * 6}px)` }, { opacity: 1, transform: 'translateY(0)' }], options),
    outgoing.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: `translateY(${-direction * 6}px)` }], { ...options, fill: 'forwards' }),
  ];
  badgeMotions[1].onfinish = () => outgoing.remove();
}

function cancelStepMotion() {
  clearScreenRequest();
  clearMetalTransition();
  railMotion?.cancel();
  railMotion = null;
  badgeMotions.forEach((motion) => motion.cancel());
  badgeMotions = [];
  badgeNum?.querySelector('.badge-number-previous')?.remove();
  railTrack.querySelectorAll('.step-feedback').forEach(button => button.classList.remove('step-feedback'));
  stepMotionActive = false;
  queuedStepIndex = null;
  hud.classList.remove('updating');
  viewer.classList.remove('metal-flowing');
}

function animateRailPosition(from: number, to: number, offset = 0) {
  railMotion?.cancel();
  railTrack.style.translate = '';
  // One compositor path owns both pointer release and snap. No return to the old center.
  railTrack.style.transform = railTransform(to);
  const duration = from === to ? 200 : railSettleDuration;
  if (reducedMotion.matches) return;
  railMotion = railTrack.animate(
    [{ transform: railTransform(from, offset) }, { transform: railTransform(to) }],
    { duration, easing: railSettleEasing },
  );
  railMotion.onfinish = () => { if (railGeometryPending) requestAnimationFrame(measureRailGeometry); };
}

const phaseProgressKey = 'apple-bezel-tutorial-phase-progress-v1';

function phaseSteps() {
  return phases[currentPhase].steps;
}

function saveProgress() {
  localStorage.setItem(phaseProgressKey, JSON.stringify({ phase: currentPhase, steps: phaseStepPositions, signoutCompleted }));
}

function restoreProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(phaseProgressKey) ?? 'null');
    if (!saved || !Array.isArray(saved.steps)) return;
    phases.forEach((phase, index) => {
      const step = saved.steps[index];
      phaseStepPositions[index] = Number.isInteger(step) && step >= 0 && step < phase.steps.length ? step : 0;
    });
    signoutCompleted = saved.signoutCompleted === true;
    currentPhase = typeof saved.phase === 'number' && saved.phase >= 0 && saved.phase < phases.length && (saved.phase === 0 || signoutCompleted) ? (saved.phase as PhaseIndex) : 0;
    currentStepInPhase = phaseStepPositions[currentPhase];
  } catch {
    localStorage.removeItem(phaseProgressKey);
  }
}

// Keep the approved motion, but retain direct handles. getAnimations() after
// .flowing changes synchronously resolved WebKit styles at each start/finish.
const metalTargets = [
  metalFxAnchor.querySelector<HTMLElement>('picture')!,
  metalFxAnchor.querySelector<HTMLElement>('.metal-fx-stream')!,
  metalFxAnchor.querySelector<HTMLElement>('.metal-fx-bead')!,
];
let metalAnimations: Animation[] = [];
function clearMetalTransition() {
  if (metalMotion) metalMotion.onfinish = null;
  metalMotion = null;
  metalAnimations.forEach((animation) => animation.cancel());
  metalAnimations = [];
  viewer.classList.remove('metal-flowing');
  delete metalFxAnchor.dataset.flowDirection;
}
function playMetalTransition(direction: -1 | 1, settled?: () => void) {
  if (reducedMotion.matches) return;
  clearMetalTransition();
  const flowDirection = direction > 0 ? 'next' : 'previous';
  metalFxAnchor.dataset.flowDirection = flowDirection;
  viewer.classList.add('metal-flowing');
  syncBeamActivity();
  metalAnimations = metalTargets.map((target, index) => {
    const animation = target.animate(metalFrames[flowDirection][index], { duration: metalDuration });
    animation.id = `${['metal-flow-core', 'metal-stream', 'metal-bead'][index]}-${flowDirection}`;
    return animation;
  });
  const core = metalAnimations[0];
  metalMotion = core;
  core.onfinish = () => {
    if (core !== metalMotion) return;
    clearMetalTransition();
    syncBeamActivity();
    settled?.();
    if (!stepMotionActive) {
      warmAdjacentScreens();
      if (railGeometryPending) requestAnimationFrame(measureRailGeometry);
    }
  };
}

// Prepare the actual future image node, not a disposable preload proxy.
// Template-owned images are inert in WebKit until adopted into this document.
const readyScreens = new Map<string, { ready: boolean; promise: Promise<boolean> }>();
let screenRequestGeneration = 0;
let waitingStep: number | null = null;
function prepareScreen(key: keyof typeof screenNodes) {
  const existing = readyScreens.get(key);
  if (existing) return existing;
  const node = screenNodes[key];
  if (node.ownerDocument !== document) document.adoptNode(node);
  const entry = { ready: false, promise: Promise.resolve(false) };
  const pending = [...node.querySelectorAll<HTMLImageElement>('img')].map(oldImage => {
    const image = oldImage.isConnected ? oldImage : new Image();
    if (image !== oldImage) {
      for (const attribute of oldImage.attributes) image.setAttribute(attribute.name, attribute.value);
      oldImage.replaceWith(image);
    }
    image.decoding = 'async';
    return image.decode().then(() => image.naturalWidth > 0).catch(() => false);
  });
  entry.promise = Promise.all(pending).then(results => {
    entry.ready = results.every(Boolean);
    if (!entry.ready) readyScreens.delete(key);
    return entry.ready;
  });
  readyScreens.set(key, entry);
  return entry;
}
function warmAdjacentScreens() {
  const steps = phaseSteps();
  for (const index of [currentStepInPhase, currentStepInPhase - 1, currentStepInPhase + 1]) {
    const step = steps[index];
    if (step) prepareScreen(step.screen);
  }
}
function clearScreenRequest() {
  screenRequestGeneration += 1;
  waitingStep = null;
  railViewport.removeAttribute('aria-busy');
}
function waitForStepScreen(index: number) {
  const entry = prepareScreen(phaseSteps()[index].screen);
  if (entry.ready) return false;
  waitingStep = index;
  const request = ++screenRequestGeneration;
  const phase = currentPhase;
  railViewport.setAttribute('aria-busy', 'true');
  status.textContent = '正在载入这一步的示意图，请稍候。';
  entry.promise.then(async ready => {
    // A cold image may become ready before a released drag has returned. Do not
    // cancel that rebound halfway and restart from the unshifted origin.
    if (ready && railMotion?.playState === 'running') await railMotion.finished.catch(() => undefined);
    if (request !== screenRequestGeneration || phase !== currentPhase) return;
    clearScreenRequest();
    if (ready) renderStep(index);
    else status.textContent = '这一步的示意图未能载入，请再次选择该步骤重试。';
  });
  return true;
}
// Tiny material surfaces should never make their first request at the handoff.
const metalWarmImages = ['chromatic-circle-80.webp', 'chromatic-circle-80.png',
  'chromatic-reflection-top-80.webp', 'chromatic-reflection-bottom-80.webp'].map((file) => {
  const image = new Image();
  image.src = `/media/metal-fx/${file}`;
  void image.decode().catch(() => {});
  return image;
});
void metalWarmImages;

function syncBeamActivity() {
  const transitionActive = viewer.classList.contains('metal-flowing') || viewer.classList.contains('practicing-rail');
  hud.toggleAttribute('data-paused', !railLearned || transitionActive);
}

function syncRailCoachmark() {
  const teaching = currentPhase === 0 && !railLearned;
  const touch = preferredRailInput() === 'touch';
  railCoachmark.dataset.gesture = touch ? 'touch' : 'wheel';
  gestureCopy.textContent = touch ? '在左侧上下滑动切换本阶段的步骤。第一次滑动只用于练习。' : '在左侧滚动切换本阶段的步骤。第一次滚动只用于练习。';
  railCoachmark.classList.toggle('dismissed', !teaching);
  railCoachmark.setAttribute('aria-hidden', String(!teaching));
  functionRail.classList.toggle('teaching', teaching);
  viewer.classList.toggle('teaching-rail', teaching);
  railViewport.removeAttribute('aria-describedby');
  if (teaching) railViewport.setAttribute('aria-describedby', 'rail-gesture-hint');
  syncBeamActivity();
}

function syncRailTrack() {
  railTrack.innerHTML = phaseSteps().map((step, index) => `
    <button type="button" class="rail-button" data-step="${index}" aria-label="第 ${index + 1} 步：${step.title}" aria-pressed="false">
      <span class="metal-fx-target-reflection" aria-hidden="true"></span>
      <span class="rail-icon">${step.icon}</span>
    </button>
  `).join('');
  railViewport.setAttribute('aria-label', `${phases[currentPhase].title}：上下切换步骤`);
}

function renderStep(index: number, animate = true, dragOffset = 0) {
  const target = Math.max(0, Math.min(phaseSteps().length - 1, index));
  if (animate && stepMotionActive && !reducedMotion.matches) {
    // Keep only the latest intent. Never restart an in-flight transition.
    queuedStepIndex = target;
    return;
  }
  if (animate && target === currentStepInPhase && waitingStep !== null) {
    clearScreenRequest();
    status.textContent = `仍停留在第 ${currentStepInPhase + 1} 步。`;
    return;
  }
  if (animate && target !== currentStepInPhase && waitForStepScreen(target)) {
    // Keep the old screenshot/step while a released drag returns to its origin.
    if (dragOffset) animateRailPosition(currentStepInPhase, currentStepInPhase, dragOffset);
    return;
  }
  clearScreenRequest();
  const previous = currentStepInPhase;
  currentStepInPhase = Math.max(0, Math.min(phaseSteps().length - 1, index));
  phaseStepPositions[currentPhase] = currentStepInPhase;
  const shouldAnimate = animate && currentStepInPhase !== previous;
  const step = phaseSteps()[currentStepInPhase];
  viewer.dataset.phase = String(currentPhase);
  viewer.dataset.currentStep = String(currentStepInPhase);
  railTrack.style.setProperty('--rail-index', String(currentStepInPhase));
  hud.classList.toggle('updating', shouldAnimate && !reducedMotion.matches);
  hudLaunch.hidden = currentPhase !== 1;


  railTrack.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button, buttonIndex) => {
    const selected = buttonIndex === currentStepInPhase;
    button.classList.toggle('selected', selected);
    button.classList.toggle('step-feedback', selected && shouldAnimate && !reducedMotion.matches);
    button.classList.toggle('reflection-above', buttonIndex === currentStepInPhase - 1);
    button.classList.toggle('reflection-below', buttonIndex === currentStepInPhase + 1);
    button.setAttribute('aria-pressed', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll<HTMLButtonElement>('[data-phase-tab]').forEach((tab) => {
    const selected = Number(tab.dataset.phaseTab) === currentPhase;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-current', selected ? 'step' : 'false');
  });

  const isPhase0 = currentPhase === 0;
  const isLastPhase = currentPhase === phases.length - 1;
  const isMiddlePhase = !isPhase0 && !isLastPhase;
  const atPhaseEnd = currentStepInPhase === phaseSteps().length - 1;

  if (paddlePrev) {
    // 第一阶段：坚决不显示左箭头；中间阶段及之后阶段：常驻激活左箭头，支持向左回退
    const showPrev = !isPhase0;
    paddlePrev.hidden = !showPrev;
    paddlePrev.disabled = !showPrev;
    paddlePrev.classList.toggle('is-hidden', !showPrev);
    paddlePrev.setAttribute('aria-label', `上一阶段：${isPhase0 ? '' : phases[currentPhase - 1]?.title}`);
  }

  if (paddleNext) {
    // 中间阶段（非第一阶段和最后一个阶段）：始终常驻显示右箭头
    // 第一阶段：仅在执行到最后一步时显现右箭头引导进入下一阶段
    // 最后一个阶段：不显示下一阶段箭头（结算或已到终点）
    const showNext = isMiddlePhase || (isPhase0 && atPhaseEnd);
    paddleNext.hidden = !showNext;
    paddleNext.disabled = !showNext;
    paddleNext.classList.toggle('is-hidden', !showNext);
    paddleNext.setAttribute('aria-label', isLastPhase ? '' : `下一阶段：${phases[currentPhase + 1]?.title}`);
  }

  dockCoachmark?.classList.toggle('is-visible', atPhaseEnd && !dockLearned && !isLastPhase);
  hud.classList.remove('dock-nudge-active');
  stepCount.textContent = `${phases[currentPhase].title}：第 ${currentStepInPhase + 1} 步，共 ${phaseSteps().length} 步`;
  stepCurrent.textContent = String(currentStepInPhase + 1);
  stepTotal.textContent = String(phaseSteps().length);
  stepTitle.textContent = step.title;

  if (currentPhase === 0) {
    if (currentStepInPhase === 0) {
      const prefix = document.createTextNode('打开你 iPhone 上的');
      const settingsIcon = document.createElement('img');
      settingsIcon.className = 'hud-inline-settings-icon';
      settingsIcon.src = '/media/rail-settings-apple.png';
      settingsIcon.alt = '设置';
      settingsIcon.draggable = false;
      stepBody.replaceChildren(prefix, settingsIcon);
    } else if (currentStepInPhase === 1) {
      stepBody.innerHTML = '进入设置页面后，轻点<span class="hud-note-avatar">顶部的头像</span>，<span class="hud-account-target">进入你的<img class="hud-inline-account-icon" src="/media/rail-action-apple.png" alt="" draggable="false"><span class="hud-note-account">“Apple 账户”</span></span>。';
    } else if (currentStepInPhase === 2) {
      stepBody.innerHTML = '在个人的 apple 账户页面，点击<span class="hud-media-target"><img class="hud-inline-media-icon" src="/media/rail-media-purchases-apple.png" alt="" draggable="false"><span class="hud-note-media">媒体与购买项目</span></span>选项。';
    } else if (currentStepInPhase === 3) {
      stepBody.innerHTML = '<span class="hud-note-signout">点击退出登录</span>，<span class="hud-note-warning">⚠️严格保证</span>你的<span class="hud-note-consistency">实际操作与前面步骤一致</span>，并再次检查是从<span class="hud-source-target"><img class="hud-inline-source-icon" src="/media/rail-media-purchases-apple.png" alt="" draggable="false"><span class="hud-note-source">媒体与购买项目</span></span>进来的，确认后<span class="hud-note-signout">退出登录</span>。';
    } else {
      stepBody.innerHTML = '在弹出的提示中，点击<span class="hud-confirm-target"><img class="hud-inline-confirm-icon" src="/media/rail-signout-confirm-icons8.png" alt="" draggable="false"><span class="hud-note-confirm-signout">“退出登录”</span></span>。<span class="hud-confirm-optional"><span class="hud-note-if-missing">若未出现</span>“再次确认”提示，<span class="hud-note-skip-step">可跳过此步</span>。</span>';
    }
  } else {
    stepBody.textContent = step.body;
  }
  screen.replaceChildren(screenNodes[step.screen]);
  if (currentPhase === 0 && currentStepInPhase === 0) {
    screen.querySelector<HTMLElement>('.home-settings-target')?.classList.toggle('cue-active', !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  syncRailCoachmark();
  saveProgress();
  status.textContent = `${phases[currentPhase].title}，第 ${currentStepInPhase + 1} 步：${step.title}。${step.body.replace(/<[^>]+>/g, '')}`;
  // Batch semantic DOM changes before Web Animations' required style resolution.
  // Starting the track/core before swapping the screenshot forced a second layout.
  if (shouldAnimate) {
    animateRailPosition(previous, currentStepInPhase, dragOffset);
  } else if (dragOffset) {
    animateRailPosition(previous, previous, dragOffset);
  } else {
    railMotion?.cancel();
    railTrack.style.transform = railTransform(currentStepInPhase);
  }
  if (shouldAnimate && !reducedMotion.matches) {
    stepMotionActive = true;
    playMetalTransition(currentStepInPhase > previous ? 1 : -1, () => {
      stepMotionActive = false;
      hud.classList.remove('updating');
      railTrack.querySelectorAll('.step-feedback').forEach(button => button.classList.remove('step-feedback'));
      const next = queuedStepIndex;
      queuedStepIndex = null;
      if (next !== null && next !== currentStepInPhase) renderStep(next);
    });
  }
  syncBadgeNumber(currentStepInPhase, shouldAnimate && !reducedMotion.matches, currentStepInPhase > previous ? 1 : -1);
}

function switchPhase(targetPhase: PhaseIndex) {
  if (targetPhase === currentPhase) { clearScreenRequest(); return; }
  // Viewing a screenshot is not evidence that a real-device sign-out has finished.
  // Advancing from the final step is the user's explicit completion/skip action.
  if (targetPhase === 1 && !signoutCompleted && currentStepInPhase !== phaseSteps().length - 1) {
    status.textContent = '请先按左侧步骤完成退出旧账户，再进入第二阶段。';
    return;
  }
  const entry = prepareScreen(phases[targetPhase].steps[phaseStepPositions[targetPhase]].screen);
  if (!entry.ready) {
    const request = ++screenRequestGeneration;
    railViewport.setAttribute('aria-busy', 'true');
    status.textContent = '正在载入下一阶段的示意图，请稍候。';
    entry.promise.then(ready => {
      if (request !== screenRequestGeneration) return;
      clearScreenRequest();
      if (ready) switchPhase(targetPhase);
      else status.textContent = '下一阶段的示意图未能载入，请重试。';
    });
    return;
  }
  cancelStepMotion();
  resetRailDrag(false);
  const direction = targetPhase > currentPhase ? 1 : -1;
  if (targetPhase === 1) {
    signoutCompleted = true;
    dockLearned = true;
  }
  currentPhase = targetPhase;
  currentStepInPhase = phaseStepPositions[currentPhase];
  syncRailTrack();
  renderStep(currentStepInPhase, false);
  playMetalTransition(direction);
  warmAdjacentScreens();
}

function learnRailInput(input: 'touch' | 'wheel') {
  localStorage.setItem(input === 'touch' ? touchLearnedKey : wheelLearnedKey, '1');
  railLearned = true;
  syncRailCoachmark();
  status.textContent = `已学会上下切换步骤。仍停留在第 ${currentStepInPhase + 1} 步。`;
}

function moveWithinPhase(direction: -1 | 1, input?: 'touch' | 'wheel', dragOffset = 0) {
  if (input && currentPhase === 0 && !railLearned) {
    learnRailInput(input);
    animateRailPosition(currentStepInPhase, currentStepInPhase, dragOffset);
    return;
  }
  renderStep(currentStepInPhase + direction, true, dragOffset);
}

// Delegate to the permanent viewport: rebuilding a phase's icons must not lose input handlers.
railViewport.addEventListener('click', (event) => {
  if (performance.now() < railClickSuppressedUntil) return;
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-step]');
  if (!button || !railTrack.contains(button)) return;
  if (!railLearned) learnRailInput(preferredRailInput());
  renderStep(Number(button.dataset.step));
});
railViewport.addEventListener('keydown', (event) => {
  const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
  if (!direction && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  if (!railLearned) learnRailInput(preferredRailInput());
  if (direction) moveWithinPhase(direction as -1 | 1);
  else renderStep(event.key === 'Home' ? 0 : phaseSteps().length - 1);
  railTrack.querySelector<HTMLButtonElement>('.selected')?.focus({ preventScroll: true });
});

let railStartX = 0;
let railStartY = 0;
let railDragOffset = 0;
let railGestureLimit = 0;
let railGestureDeferred = false;
let railPointerId: number | null = null;
let railClickSuppressedUntil = 0;
function resetRailDrag(rebound = true) {
  const pointerId = railPointerId;
  railPointerId = null;
  if (pointerId !== null && railViewport.hasPointerCapture(pointerId)) railViewport.releasePointerCapture(pointerId);
  if (rebound && railDragOffset) animateRailPosition(currentStepInPhase, currentStepInPhase, railDragOffset);
  railDragOffset = 0;
  viewer.classList.remove('practicing-rail');
  syncBeamActivity();
}
railViewport.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0 || railPointerId !== null) return;
  // A fresh press is intentional; only suppress the click generated by the preceding drag.
  railClickSuppressedUntil = 0;
  railPointerId = event.pointerId;
  railStartX = event.clientX;
  railStartY = event.clientY;
  // Route/resize geometry is cached; pressing does not force layout.
  railGestureLimit = railPitchPx * 0.6;
  railGestureDeferred = stepMotionActive;
  railDragOffset = 0;
});
railViewport.addEventListener('pointermove', (event) => {
  if (event.pointerId !== railPointerId) return;
  const dy = event.clientY - railStartY;
  const dx = event.clientX - railStartX;
  if (Math.abs(dy) <= Math.abs(dx) || Math.abs(dy) < 6 || phaseSteps().length === 1) return;
  // Capture only an actual drag. Capturing on press retargets Firefox's native tap away from the button.
  if (!railViewport.hasPointerCapture(event.pointerId)) railViewport.setPointerCapture(event.pointerId);
  if (railGestureDeferred) return;
  railMotion?.cancel();
  railDragOffset = Math.max(-railGestureLimit, Math.min(railGestureLimit, dy));
  railTrack.style.transform = railTransform(currentStepInPhase, railDragOffset);
  if (!railLearned && currentPhase === 0) viewer.classList.add('practicing-rail');
});
railViewport.addEventListener('pointerup', (event) => {
  if (event.pointerId !== railPointerId) return;
  const dy = event.clientY - railStartY;
  const dx = event.clientX - railStartX;
  const offset = railDragOffset;
  // Even a below-threshold drag owns a rebound. Its synthetic click must not
  // re-render the same step and cancel that rebound (notably in WebKit).
  if (Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) railClickSuppressedUntil = performance.now() + 350;
  resetRailDrag(false);
  if (Math.abs(dy) > 25 && Math.abs(dy) > Math.abs(dx) * 1.1) {
    railClickSuppressedUntil = performance.now() + 350;
    moveWithinPhase(dy < 0 ? 1 : -1, event.pointerType === 'touch' ? 'touch' : preferredRailInput(), offset);
  } else if (offset) {
    animateRailPosition(currentStepInPhase, currentStepInPhase, offset);
  }
});
railViewport.addEventListener('pointercancel', () => resetRailDrag());
railViewport.addEventListener('lostpointercapture', (event) => {
  // Moving capture from a touch's implicit button capture emits a bubbling child event.
  if (event.target === railViewport) resetRailDrag();
});

let wheelTotal = 0;
let lastWheelTime = 0;
railViewport.addEventListener('wheel', (event) => {
  if (!event.deltaY) return;
  event.preventDefault();
  const now = performance.now();
  if (now - lastWheelTime > 180) wheelTotal = 0;
  const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? railViewport.clientHeight : 1;
  const delta = event.deltaY * unit;
  if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
  wheelTotal += delta;
  if (now - lastWheelTime < 240) return;
  if (Math.abs(wheelTotal) < 24) return;
  moveWithinPhase(wheelTotal > 0 ? 1 : -1, 'wheel');
  wheelTotal = 0;
  lastWheelTime = now;
}, { passive: false });

const phaseTabs = document.querySelectorAll<HTMLButtonElement>('[data-phase-tab]');
phaseTabs.forEach((tab) => {
  tab.addEventListener('click', () => switchPhase(Number(tab.dataset.phaseTab) as PhaseIndex));
});
paddleNext?.addEventListener('click', () => {
  if (currentPhase < phases.length - 1) {
    switchPhase((currentPhase + 1) as PhaseIndex);
  }
});
paddlePrev?.addEventListener('click', () => {
  if (currentPhase > 0) {
    switchPhase((currentPhase - 1) as PhaseIndex);
  }
});
document.querySelector<HTMLButtonElement>('[data-restart]')?.addEventListener('click', () => {
  cancelStepMotion();
  resetRailDrag(false);
  currentPhase = 0;
  currentStepInPhase = 0;
  phaseStepPositions[0] = 0;
  phaseStepPositions[1] = 0;
  signoutCompleted = false;
  dockLearned = false;
  syncRailTrack();
  renderStep(0, false);
  status.textContent = '已重新开始第一阶段：退出旧账户，第 1 步。';
});

let dockTouchStartX = 0;
let dockTouchStartY = 0;
let dockPointerId: number | null = null;
let dockClickSuppressedUntil = 0;
function resetDockDrag() {
  const pointerId = dockPointerId;
  dockPointerId = null;
  if (pointerId !== null && hud.hasPointerCapture(pointerId)) hud.releasePointerCapture(pointerId);
  hud.style.transition = '';
  hud.style.transform = '';
}
hud.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !event.isPrimary || dockPointerId !== null) return;
  // Links and buttons keep their native click/popup behavior, never drag capture.
  if ((event.target as Element).closest('a, button')) return;
  dockPointerId = event.pointerId;
  dockTouchStartX = event.clientX;
  dockTouchStartY = event.clientY;
  hud.setPointerCapture(event.pointerId);
  hud.style.transition = 'none';
});
hud.addEventListener('pointermove', (event) => {
  if (event.pointerId !== dockPointerId) return;
  const dx = event.clientX - dockTouchStartX;
  const dy = event.clientY - dockTouchStartY;
  if (Math.abs(dx) > Math.abs(dy)) hud.style.transform = `translateX(${Math.max(-24, Math.min(24, dx * 0.2))}px)`;
});
hud.addEventListener('pointerup', (event) => {
  if (event.pointerId !== dockPointerId) return;
  const dx = event.clientX - dockTouchStartX;
  const dy = event.clientY - dockTouchStartY;
  resetDockDrag();
  if (Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy) * 1.1) {
    dockClickSuppressedUntil = performance.now() + 350;
    if (dx < 0 && currentPhase < phases.length - 1) switchPhase((currentPhase + 1) as PhaseIndex);
    if (dx > 0 && currentPhase > 0) switchPhase((currentPhase - 1) as PhaseIndex);
  }
});
hud.addEventListener('pointercancel', resetDockDrag);
hud.addEventListener('lostpointercapture', resetDockDrag);
hud.addEventListener('click', (event) => {
  // Suppress only the synthetic card click after a drag, never a deliberate action.
  if ((event.target as Element).closest('a,button')) return;
  if (performance.now() < dockClickSuppressedUntil) {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

function syncPreferredInput() {
  railLearned = localStorage.getItem(preferredRailInput() === 'touch' ? touchLearnedKey : wheelLearnedKey) === '1';
  syncRailCoachmark();
}
coarsePointer.addEventListener?.('change', syncPreferredInput);
anyCoarsePointer.addEventListener?.('change', syncPreferredInput);
document.addEventListener('visibilitychange', () => viewer.toggleAttribute('data-page-hidden', document.hidden));
viewer.toggleAttribute('data-page-hidden', document.hidden);

function syncRoute(moveFocus = false) {
  const showTutorial = location.hash === '#ios';
  if (location.hash && !showTutorial) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
  platformGateway.hidden = showTutorial;
  platformGateway.inert = showTutorial;
  if (showTutorial) {
    gridScanRequest += 1;
    gridScan?.dispose();
    gridScan = null;
    gridScanHost.dataset.gridScan = 'stopped';
  } else if (!gridScan && supportsGridScan()) {
    const request = ++gridScanRequest;
    void import('./grid-scan')
      .then(({ createGridScan }) => {
        if (request !== gridScanRequest || location.hash === '#ios' || gridScan) return;
        gridScan = createGridScan(gridScanHost, platformGateway);
        if (!gridScan) gridScanHost.dataset.gridScan = 'fallback';
      })
      .catch(() => {
        if (request === gridScanRequest && location.hash !== '#ios') gridScanHost.dataset.gridScan = 'fallback';
      });
  }
  tutorialApp.hidden = !showTutorial;
  tutorialApp.inert = !showTutorial;
  document.documentElement.dataset.route = showTutorial ? 'ios' : 'platforms';
  document.title = showTutorial ? 'iPhone 17 Pro · 操作按钮教程' : '选择设备 · 设备操作教程';
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', showTutorial ? '#000000' : '#07080a');
  if (showTutorial) requestAnimationFrame(measureRailGeometry);
  if (moveFocus) (showTutorial ? (tutorialHeading ?? viewer) : gatewayTitle).focus({ preventScroll: true });
}

window.addEventListener('hashchange', () => syncRoute(true));
window.addEventListener('popstate', () => syncRoute(true));
restoreProgress();
syncRoute();
syncRailTrack();
renderStep(currentStepInPhase, false);
warmAdjacentScreens();

new ResizeObserver(() => requestAnimationFrame(measureRailGeometry)).observe(railViewport);
requestAnimationFrame(measureRailGeometry);
