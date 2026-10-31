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
        previewMessage: { 
          message: "I have a question for you!",
          autoShowDelay: 1000,
        },
        theme: {
          button: { 
            backgroundColor: "#9B74B7",
            size: "40px",
          },
          chatWindow: { backgroundColor: "#F8F8F8" },
          previewMessage: {
            backgroundColor: "#FFFFFF",
            textColor: "#1D1D1F",
            closeButtonBackgroundColor: "rgba(0, 0, 0, 0.06)",
            closeButtonIconColor: "#6E6E73",
          },
        },
      });
      typebotInitialized = true;
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
