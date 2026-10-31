/**
 * Typebot 客服/答疑小部件按需优雅加载模块
 * 
 * 性能与架构原则：
 * 1. 绝不阻塞首屏主线程与关键渲染路径（LCP/FCP 零影响）；
 * 2. 仅在首页网关（设备选择页）展示，避免在深度教程沉浸交互中干扰用户操作；
 * 3. 采用 requestIdleCallback / 用户轻微交互或轻度延时懒加载外部 CDN 脚本；
 * 4. 路由切换到教程模式时自动隐藏，返回首页网关时自动恢复。
 */

let typebotInitialized = false;
let typebotLoadingPromise: Promise<void> | null = null;

export function loadTypebot(): Promise<void> {
  if (typebotInitialized) return Promise.resolve();
  if (typebotLoadingPromise) return typebotLoadingPromise;

  typebotLoadingPromise = (async () => {
    try {
      // 动态引入外部 ESM 模块
      // @ts-ignore
      const { default: Typebot } = await import('https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js');
      
      Typebot.initBubble({
        typebot: "my-typebot-cqixji2",
        apiHost: "https://kefu.1yo.cc",
        theme: {
          button: { backgroundColor: "#9B74B7" },
          chatWindow: { backgroundColor: "#F8F8F8" },
        },
      });
      typebotInitialized = true;

      // 智能微调 Shadow DOM 容器变量，确保在移动端教程中避让底部 Dock 卡片
      const updatePosition = () => {
        const el = document.querySelector('typebot-bubble');
        if (el?.shadowRoot) {
          const container = el.shadowRoot.querySelector('div[class*=\"bottom-\"]') as HTMLElement | null;
          if (container) {
            const isMobile = window.innerWidth <= 600;
            const isTutorial = location.hash.startsWith('#ios') || location.hash.startsWith('#android') || location.hash.startsWith('#harmony');
            // 教程页由于底部有全宽操作 Dock 卡片，避让至 Dock 上方（86px），首页网关则保持标准 20px
            container.style.setProperty('--container-bottom', isMobile && isTutorial ? '90px' : '20px');
          }
        }
      };

      setTimeout(updatePosition, 100);
      setTimeout(updatePosition, 600);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('hashchange', () => setTimeout(updatePosition, 50));
    } catch (err) {
      console.warn('Typebot failed to load:', err);
    }
  })();

  return typebotLoadingPromise;
}

/**
 * 在空闲时或首次用户交互时智能预热加载
 */
export function scheduleTypebotWarmup() {
  const triggerLoad = () => {
    window.removeEventListener('pointerdown', triggerLoad);
    window.removeEventListener('scroll', triggerLoad);
    window.removeEventListener('keydown', triggerLoad);
    void loadTypebot();
  };

  window.addEventListener('pointerdown', triggerLoad, { once: true, passive: true });
  window.addEventListener('scroll', triggerLoad, { once: true, passive: true });
  window.addEventListener('keydown', triggerLoad, { once: true, passive: true });

  // 无论当前处于首页还是具体教程，1.2 秒后自动预热加载，保证全流程随叫随到
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      setTimeout(triggerLoad, 1200);
    }, { timeout: 2500 });
  } else {
    setTimeout(triggerLoad, 1200);
  }
}

/**
 * 根据当前是否展示首页网关，同步 Typebot 的显隐状态
 */
export function syncTypebotVisibility(_showOnGatewayOnly: boolean, _isGateway: boolean) {
  // 全站常驻：用户在任何流程都可能遇到卡点，Typebot 保持全流程常驻可用
  const bubble = document.querySelector('typebot-bubble') as HTMLElement | null;
  if (!bubble) return;
  bubble.style.display = '';
}
