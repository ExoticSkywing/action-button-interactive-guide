import './style.css';
import { chevron, closeIcon, screenNodes, steps } from './tutorial-content';

type ViewerMode = 'expanded' | 'collapsed';
const root = document.querySelector<HTMLElement>('#app')!;
root.innerHTML = `
  <!--
  THESIS: Apple Product Viewer becomes a task-completion tutorial; refuse the white landing-page-plus-demo scaffold.
  OWN-WORLD: Neutral-black ribbon stage, official orange Product Bezel, one translucent HUD, one monochrome icon rail.
  STORY: Pick a step, see the whole phone state change, recognize proof, and finish independently.
  FIRST VIEWPORT: Dark localnav above a full-bleed viewer; rail and phone read as one object; one card floats at the bottom.
  FORM: Operate mode, official Apple reference canon, seed APPLE-BEZEL-V4. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
  -->
  <main class="experience-shell">
    <nav class="localnav" aria-label="产品导航">
      <strong>iPhone 17 Pro</strong>
      <div><button type="button" class="explore">概览</button><button type="button" class="buy" data-primary-action>重新开始</button></div>
    </nav>

    <section id="tutorial" class="viewer" data-mode="expanded" aria-label="操作按钮分步教程">
      <button class="close-control" type="button" data-close aria-label="关闭教程">${closeIcon}</button>

      <div class="product-composition">
        <nav class="function-rail" aria-label="教程步骤">
          <div class="rail-viewport" data-rail-viewport tabindex="0" aria-label="教程步骤滚轮" aria-describedby="rail-gesture-hint">
            <div class="rail-track" data-rail-track>
              ${steps.map((step, index) => `<button type="button" class="rail-button" data-step="${index}" aria-label="第 ${index + 1} 步：${step.label}" aria-pressed="false"><span class="metal-fx-target-reflection" aria-hidden="true"></span><span class="rail-icon">${step.icon}</span></button>`).join('')}
            </div>
            <span class="metal-fx-anchor" aria-hidden="true"><span class="metal-fx-stream"></span><span class="metal-fx-bead"></span><picture><source media="(prefers-reduced-motion: reduce)" srcset="/media/metal-fx/chromatic-circle-80.png"><img src="/media/metal-fx/chromatic-circle-80.webp" alt=""></picture></span>
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
      <article class="tutorial-hud" data-hud data-beam="tutorial-hud" data-active>
        <span class="hud-beam-inner" aria-hidden="true"></span>
        <span class="hud-beam-stroke" aria-hidden="true"></span>
        <span class="hud-beam-bloom" data-beam-bloom aria-hidden="true"></span>
        <div class="hud-copy">
          <div class="hud-heading">
            <p class="hud-step"><span data-step-current></span><span aria-hidden="true">/</span><span data-step-total></span><span class="sr-only" data-step-count></span></p>
            <p class="hud-title" data-step-title></p>
          </div>
          <p class="hud-body" data-step-body></p>
          <p class="hud-proof"><span class="hud-proof-mark" aria-hidden="true">✓</span><span data-step-proof></span></p>
        </div>
      </article>

      <button class="restore-control" type="button" data-restore aria-label="继续教程"><span>继续教程</span>${chevron('right')}</button>
      <p class="sr-only" aria-live="polite" data-status></p>
    </section>
  </main>`;

const viewer = document.querySelector<HTMLElement>('.viewer')!;
const screen = document.querySelector<HTMLElement>('[data-screen]')!;
const status = document.querySelector<HTMLElement>('[data-status]')!;
const stepCount = document.querySelector<HTMLElement>('[data-step-count]')!;
const stepCurrent = document.querySelector<HTMLElement>('[data-step-current]')!;
const stepTotal = document.querySelector<HTMLElement>('[data-step-total]')!;
const stepTitle = document.querySelector<HTMLElement>('[data-step-title]')!;
const stepBody = document.querySelector<HTMLElement>('[data-step-body]')!;
const stepProof = document.querySelector<HTMLElement>('[data-step-proof]')!;
const hud = document.querySelector<HTMLElement>('[data-hud]')!;
const functionRail = document.querySelector<HTMLElement>('.function-rail')!;
const closeControl = document.querySelector<HTMLButtonElement>('[data-close]')!;
const restoreControl = document.querySelector<HTMLButtonElement>('[data-restore]')!;
const railViewport = document.querySelector<HTMLElement>('[data-rail-viewport]')!;
const railTrack = document.querySelector<HTMLElement>('[data-rail-track]')!;
const metalFxAnchor = document.querySelector<HTMLElement>('.metal-fx-anchor')!;
const railCoachmark = document.querySelector<HTMLElement>('[data-rail-coachmark]')!;
const gestureCopy = document.querySelector<HTMLElement>('[data-gesture-copy]')!;
const primaryAction = document.querySelector<HTMLButtonElement>('[data-primary-action]')!;
const storageKey = 'apple-bezel-tutorial-v4.1';
const touchLearnedKey = 'apple-bezel-tutorial-v5.2-touch-learned';
const wheelLearnedKey = 'apple-bezel-tutorial-v5.2-wheel-learned';
const coarsePointer = window.matchMedia('(pointer: coarse)');
const anyCoarsePointer = window.matchMedia('(any-pointer: coarse)');
function preferredRailInput(): 'touch' | 'wheel' {
  const touchCapable = navigator.maxTouchPoints > 0 || 'ontouchstart' in window || anyCoarsePointer.matches || coarsePointer.matches;
  return touchCapable ? 'touch' : 'wheel';
}
let current = 0;
let mode: ViewerMode = 'expanded';
let railLearned = localStorage.getItem(preferredRailInput() === 'touch' ? touchLearnedKey : wheelLearnedKey) === '1';
let metalTransitionTimer = 0;
let screenTransitionTimer = 0;
let feedbackTransitionTimer = 0;
let completionFeedbackTimer = 0;
let stepTransitionTimer = 0;
let stepTransitionLocked = false;
let queuedStep: number | null = null;
const stepTransitionDuration = 460;
let gesturePracticeTimer = 0;
let gesturePracticeLocked = false;
function playMetalTransition(direction: -1 | 1) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.clearTimeout(metalTransitionTimer);
  metalFxAnchor.dataset.flowDirection = direction > 0 ? 'next' : 'previous';
  metalFxAnchor.classList.add('flowing');
  viewer.classList.add('metal-flowing');
  syncBeamActivity();
  metalTransitionTimer = window.setTimeout(() => {
    metalFxAnchor.classList.remove('flowing');
    viewer.classList.remove('metal-flowing');
    delete metalFxAnchor.dataset.flowDirection;
    syncBeamActivity();
  }, stepTransitionDuration);
}

function syncBeamActivity() {
  const transitionActive = viewer.classList.contains('metal-flowing') || viewer.classList.contains('practicing-rail');
  hud.toggleAttribute('data-paused', mode === 'collapsed' || !railLearned || transitionActive);
}

function syncRailCoachmark() {
  const touch = preferredRailInput() === 'touch';
  railCoachmark.dataset.gesture = touch ? 'touch' : 'wheel';
  gestureCopy.textContent = touch ? '先在左侧按钮上练习一次上下滑动，教程仍从第 1 步开始' : '先将鼠标移到左侧按钮上滚动一次，教程仍从第 1 步开始';
  railCoachmark.classList.toggle('dismissed', railLearned);
  railCoachmark.setAttribute('aria-hidden', String(railLearned));
  railCoachmark.closest('.function-rail')?.classList.toggle('teaching', !railLearned);
  viewer.classList.toggle('teaching-rail', !railLearned);
  syncBeamActivity();
  railViewport.removeAttribute('aria-describedby');
  if (!railLearned) railViewport.setAttribute('aria-describedby', 'rail-gesture-hint');
}

function confirmRailLearned(input: 'touch' | 'wheel') {
  const currentInput = preferredRailInput();
  if (railLearned || input !== currentInput) return;
  railLearned = true;
  localStorage.setItem(input === 'touch' ? touchLearnedKey : wheelLearnedKey, '1');
  syncRailCoachmark();
}

function practiceRail(input: 'touch' | 'wheel', direction: -1 | 1) {
  const currentInput = preferredRailInput();
  if (railLearned || gesturePracticeLocked || input !== currentInput) return false;
  gesturePracticeLocked = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gesturePracticeLocked = false;
    confirmRailLearned(input);
    status.textContent = '手势练习完成，教程从第 1 步正式开始';
    return true;
  }
  window.clearTimeout(gesturePracticeTimer);
  viewer.classList.add('practicing-rail');
  viewer.dataset.practiceDirection = direction > 0 ? 'next' : 'previous';
  playMetalTransition(direction);
  status.textContent = '正在练习步骤切换，教程仍停留在第 1 步';
  gesturePracticeTimer = window.setTimeout(() => {
    viewer.classList.remove('practicing-rail');
    delete viewer.dataset.practiceDirection;
    gesturePracticeLocked = false;
    confirmRailLearned(input);
    status.textContent = '手势练习完成，教程从第 1 步正式开始';
  }, 500);
  return true;
}

function storedStep() {
  const value = Number.parseInt(localStorage.getItem(storageKey) ?? '0', 10);
  return Number.isInteger(value) && value >= 0 && value < steps.length ? value : 0;
}

function renderStep(index: number, animate = true, announce = true) {
  const previous = current;
  current = Math.max(0, Math.min(steps.length - 1, index));
  const shouldAnimate = animate && current !== previous;
  if (shouldAnimate) playMetalTransition(current > previous ? 1 : -1);
  const step = steps[current];
  viewer.dataset.currentStep = String(current);
  railTrack.style.setProperty('--rail-index', String(current));
  hud.classList.toggle('updating', shouldAnimate);
  hud.classList.toggle('is-complete', current === steps.length - 1);
  document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button, buttonIndex) => {
    const selected = buttonIndex === current;
    button.classList.toggle('selected', selected);
    button.classList.toggle('step-feedback', shouldAnimate && selected);
    button.classList.toggle('reflection-above', buttonIndex === current - 1);
    button.classList.toggle('reflection-below', buttonIndex === current + 1);
    button.setAttribute('aria-pressed', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  stepCount.textContent = `第 ${current + 1} 步，共 ${steps.length} 步`;
  stepCurrent.textContent = String(current + 1);
  stepTotal.textContent = String(steps.length);
  const complete = current === steps.length - 1;
  stepTitle.textContent = step.title;
  if (current === 0) {
    const prefix = document.createTextNode('打开你 iPhone 上的');
    const settingsIcon = document.createElement('img');
    settingsIcon.className = 'hud-inline-settings-icon';
    settingsIcon.src = '/media/rail-settings-apple.png';
    settingsIcon.alt = '设置';
    settingsIcon.draggable = false;
    stepBody.replaceChildren(prefix, settingsIcon);
  } else if (current === 1) {
    stepBody.innerHTML = '进入设置页面后，轻点<span class="hud-note-avatar">顶部的头像</span>，<span class="hud-account-target">进入你的<img class="hud-inline-account-icon" src="/media/rail-action-apple.png" alt="" draggable="false"><span class="hud-note-account">“Apple 账户”</span></span>。';
  } else if (current === 2) {
    stepBody.innerHTML = '在个人的 apple 账户页面，点击<span class="hud-media-target"><img class="hud-inline-media-icon" src="/media/rail-media-purchases-apple.png" alt="" draggable="false"><span class="hud-note-media">媒体与购买项目</span></span>选项。';
  } else if (current === 3) {
    stepBody.innerHTML = '<span class="hud-note-signout">点击退出登录</span>，<span class="hud-note-warning">⚠️严格保证</span>你的<span class="hud-note-consistency">实际操作与前面步骤一致</span>，并再次检查是从<span class="hud-source-target"><img class="hud-inline-source-icon" src="/media/rail-media-purchases-apple.png" alt="" draggable="false"><span class="hud-note-source">媒体与购买项目</span></span>进来的，确认后<span class="hud-note-signout">退出登录</span>。';
  } else if (current === 4) {
    stepBody.innerHTML = '在弹出的提示中，点击<span class="hud-confirm-target"><img class="hud-inline-confirm-icon" src="/media/rail-signout-confirm-icons8.png" alt="" draggable="false"><span class="hud-note-confirm-signout">“退出登录”</span></span>。<span class="hud-confirm-optional"><span class="hud-note-if-missing">若未出现</span>“再次确认”提示，<span class="hud-note-skip-step">可跳过此步</span>。</span>';
  } else if (current === 5) {
    stepBody.innerHTML = '在做<span class="hud-note-step-three">第3步</span>点击<span class="hud-relogin-target"><img class="hud-inline-relogin-icon" src="/media/rail-media-purchases-apple.png" alt="" draggable="false"><span class="hud-note-relogin-media">媒体与购买项目</span></span>之前，建议先做<span class="hud-note-prior-steps">1,2两步</span>，以免直接点击<span class="hud-note-step-three">第3步</span><span class="hud-note-no-response">没有任何反应</span>。';
  } else if (current === 6) {
    stepBody.innerHTML = '如屏幕上点击<span class="hud-note-second-option">第二个选项</span>，以此来使用<span class="hud-other-account-target">其他<img class="hud-inline-other-account-icon" src="/media/rail-action-apple.png" alt="" draggable="false"><span class="hud-note-other-account">Apple ID账户</span></span>登录。';
  }
  stepProof.textContent = step.hudProof;
  stepProof.closest('.hud-proof')?.classList.toggle('hidden', !step.hudProof);
  primaryAction.textContent = '重新开始';
  primaryAction.setAttribute('aria-label', primaryAction.textContent);
  window.clearTimeout(screenTransitionTimer);
  window.clearTimeout(feedbackTransitionTimer);
  window.clearTimeout(completionFeedbackTimer);
  screen.querySelector('.live-activity.confirming')?.classList.remove('confirming');
  screen.classList.toggle('switching', shouldAnimate);
  screenTransitionTimer = window.setTimeout(() => {
    screen.replaceChildren(screenNodes[step.screen]);
    screen.querySelector<HTMLElement>('.home-settings-target')?.classList.toggle('cue-active', !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    screen.classList.remove('switching');
    hud.classList.remove('updating');
    if (shouldAnimate && complete) {
      const activity = screen.querySelector<HTMLElement>('.live-activity');
      activity?.classList.add('confirming');
      completionFeedbackTimer = window.setTimeout(() => {
        activity?.classList.remove('confirming');
        completionFeedbackTimer = 0;
      }, 500);
    }
  }, shouldAnimate ? 120 : 0);
  if (shouldAnimate) {
    feedbackTransitionTimer = window.setTimeout(() => {
      document.querySelectorAll('.rail-button.step-feedback').forEach(button => button.classList.remove('step-feedback'));
      feedbackTransitionTimer = 0;
    }, 260);
  } else {
    hud.classList.remove('updating');
    document.querySelectorAll('.rail-button.step-feedback').forEach(button => button.classList.remove('step-feedback'));
  }
  localStorage.setItem(storageKey, String(current));
  if (announce) status.textContent = `第 ${current + 1} 步：${step.title}。${step.proof}`;
}

function requestStep(index: number, announce = true) {
  if (mode !== 'expanded') return false;
  const target = Math.max(0, Math.min(steps.length - 1, index));
  if (target === current) {
    if (stepTransitionLocked) queuedStep = null;
    return false;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    renderStep(target, false, announce);
    return true;
  }
  if (stepTransitionLocked) {
    queuedStep = target;
    return false;
  }
  stepTransitionLocked = true;
  renderStep(target, true, announce);
  window.clearTimeout(stepTransitionTimer);
  stepTransitionTimer = window.setTimeout(() => {
    stepTransitionLocked = false;
    stepTransitionTimer = 0;
    const queued = queuedStep;
    queuedStep = null;
    if (queued !== null && queued !== current) requestStep(queued);
  }, stepTransitionDuration);
  return true;
}

function requestDirection(direction: -1 | 1) {
  return requestStep(current + direction);
}

function resetStep(index: number) {
  window.clearTimeout(stepTransitionTimer);
  window.clearTimeout(metalTransitionTimer);
  stepTransitionTimer = 0;
  metalTransitionTimer = 0;
  stepTransitionLocked = false;
  queuedStep = null;
  metalFxAnchor.classList.remove('flowing');
  viewer.classList.remove('metal-flowing');
  delete metalFxAnchor.dataset.flowDirection;
  syncBeamActivity();
  renderStep(index, false);
}

function cancelActiveTransition() {
  window.clearTimeout(stepTransitionTimer);
  window.clearTimeout(metalTransitionTimer);
  window.clearTimeout(screenTransitionTimer);
  window.clearTimeout(feedbackTransitionTimer);
  window.clearTimeout(completionFeedbackTimer);
  window.clearTimeout(gesturePracticeTimer);
  stepTransitionTimer = 0;
  metalTransitionTimer = 0;
  screenTransitionTimer = 0;
  feedbackTransitionTimer = 0;
  completionFeedbackTimer = 0;
  gesturePracticeTimer = 0;
  stepTransitionLocked = false;
  queuedStep = null;
  gesturePracticeLocked = false;
  metalFxAnchor.classList.remove('flowing');
  viewer.classList.remove('metal-flowing', 'practicing-rail');
  delete metalFxAnchor.dataset.flowDirection;
  delete viewer.dataset.practiceDirection;
  screen.classList.remove('switching');
  hud.classList.remove('updating');
  document.querySelectorAll('.rail-button.step-feedback').forEach(button => button.classList.remove('step-feedback'));
  screen.querySelector('.live-activity.confirming')?.classList.remove('confirming');
  screen.querySelector('.home-settings-target.cue-active')?.classList.remove('cue-active');
  screen.replaceChildren(screenNodes[steps[current].screen]);
}

function syncModeAccessibility() {
  const collapsed = mode === 'collapsed';
  for (const element of [functionRail, hud, closeControl]) {
    element.inert = collapsed;
    element.setAttribute('aria-hidden', String(collapsed));
  }
  restoreControl.inert = !collapsed;
  restoreControl.setAttribute('aria-hidden', String(!collapsed));
}

function setMode(next: ViewerMode) {
  if (next === 'collapsed') cancelActiveTransition();
  mode = next;
  viewer.dataset.mode = mode;
  syncModeAccessibility();
  syncBeamActivity();
  status.textContent = mode === 'expanded' ? `教程已恢复，当前为第 ${current + 1} 步` : `教程已关闭，进度已保存`;
  (mode === 'expanded' ? railViewport : restoreControl).focus({ preventScroll: true });
}

document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button) => button.addEventListener('click', () => {
  if (!suppressRailClick && railLearned) requestStep(Number(button.dataset.step));
  else if (!railLearned) status.textContent = '先完成左侧按钮的手势练习，教程会从第 1 步开始';
}));
screen.addEventListener('click', (event) => {
  if (!(event.target instanceof Element) || !event.target.closest('.home-settings-target') || current !== 0 || mode !== 'expanded') return;
  if (railLearned) requestStep(1);
  else status.textContent = '先完成左侧按钮的手势练习，再点击屏幕上的“设置”';
});
let wheelLocked = false;
railViewport.addEventListener('wheel', (event) => {
  if (wheelLocked || gesturePracticeLocked || Math.abs(event.deltaY) < 4) return;
  if (!railLearned && preferredRailInput() !== 'wheel') return;
  event.preventDefault();
  wheelLocked = true;
  const direction: -1 | 1 = event.deltaY > 0 ? 1 : -1;
  if (practiceRail('wheel', direction)) {
    window.setTimeout(() => { wheelLocked = false; }, stepTransitionDuration);
    return;
  }
  requestDirection(direction);
  window.setTimeout(() => { wheelLocked = false; }, 120);
}, { passive: false });
let dragStartY: number | null = null;
let dragPointerId: number | null = null;
let draggingRail = false;
let suppressRailClick = false;
railViewport.addEventListener('pointerdown', (event) => {
  if (gesturePracticeLocked || (!railLearned && preferredRailInput() !== 'touch')) return;
  dragStartY = event.clientY;
  dragPointerId = event.pointerId;
  draggingRail = false;
});
railViewport.addEventListener('pointermove', (event) => {
  if (dragStartY === null || dragPointerId !== event.pointerId) return;
  if (Math.abs(event.clientY - dragStartY) > 8 && !draggingRail) {
    draggingRail = true;
    railViewport.setPointerCapture(event.pointerId);
  }
});
railViewport.addEventListener('pointerup', (event) => {
  if (dragStartY === null) return;
  const distance = event.clientY - dragStartY;
  dragStartY = null;
  dragPointerId = null;
  if (draggingRail && Math.abs(distance) >= 18) {
    suppressRailClick = true;
    const direction: -1 | 1 = distance < 0 ? 1 : -1;
    if (!practiceRail('touch', direction)) requestDirection(direction);
    window.setTimeout(() => { suppressRailClick = false; }, 0);
  }
  draggingRail = false;
});
railViewport.addEventListener('pointercancel', () => {
  dragStartY = null;
  dragPointerId = null;
  draggingRail = false;
});
closeControl.addEventListener('click', () => setMode('collapsed'));
restoreControl.addEventListener('click', () => setMode('expanded'));
primaryAction.addEventListener('click', () => {
  setMode('expanded');
  resetStep(0);
  document.querySelector('#tutorial')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (mode === 'expanded') setMode('collapsed');
    return;
  }
  if (mode !== 'expanded' || !railLearned) return;
  const target = event.target;
  if (!(target === railViewport || target instanceof Element && target.closest('[data-step]'))) return;
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault();
    const next = Math.max(0, Math.min(steps.length - 1, current + (event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1)));
    if (next !== current) requestStep(next);
  }
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    requestStep(event.key === 'Home' ? 0 : steps.length - 1);
  }
});

current = railLearned ? storedStep() : 0;
if (!railLearned) localStorage.setItem(storageKey, '0');
function syncPreferredInput() {
  railLearned = localStorage.getItem(preferredRailInput() === 'touch' ? touchLearnedKey : wheelLearnedKey) === '1';
  syncRailCoachmark();
}
coarsePointer.addEventListener?.('change', syncPreferredInput);
anyCoarsePointer.addEventListener?.('change', syncPreferredInput);
document.addEventListener('visibilitychange', () => viewer.toggleAttribute('data-page-hidden', document.hidden));
viewer.toggleAttribute('data-page-hidden', document.hidden);
syncRailCoachmark();
syncModeAccessibility();
renderStep(current, false, false);
status.textContent = current ? `已恢复到第 ${current + 1} 步：${steps[current].title}` : `教程已就绪：${steps[0].title}`;
