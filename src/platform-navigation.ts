type PlatformOption = {
  id: 'ios' | 'android' | 'harmony' | 'windows' | 'macos';
  name: string;
  devices: string;
  href: string | null;
  action: string;
  icon: string;
};

const icon = (content: string) => `
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    ${content}
  </svg>`;

const tutorialUrl = (value: string | undefined) => {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim(), window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

const externalTutorials = {
  android: tutorialUrl(import.meta.env.VITE_ANDROID_TUTORIAL_URL),
  harmony: tutorialUrl(import.meta.env.VITE_HARMONY_TUTORIAL_URL),
  windows: tutorialUrl(import.meta.env.VITE_WINDOWS_TUTORIAL_URL),
  macos: tutorialUrl(import.meta.env.VITE_MACOS_TUTORIAL_URL),
};

const platformOptions: PlatformOption[] = [
  {
    id: 'ios',
    name: 'iOS / iPadOS',
    devices: 'iPhone 与 iPad',
    href: '#ios',
    action: '进入教程',
    icon: icon('<rect x="6.5" y="4.5" width="12" height="23" rx="3"/><path d="M10.5 7.5h4M11.5 24.5h2"/><rect x="20.5" y="8.5" width="6" height="15" rx="1.8"/>'),
  },
  {
    id: 'android',
    name: 'Android',
    devices: '安卓手机与平板',
    href: externalTutorials.android,
    action: externalTutorials.android ? '进入教程' : '准备中',
    icon: icon('<path d="m10 8-2-3m14 3 2-3M8 14h16v10.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 8 24.5V14Z"/><path d="M8 14v-1a8 8 0 0 1 16 0v1M12.5 11h.01M19.5 11h.01M4.5 15v8M27.5 15v8"/>'),
  },
  {
    id: 'harmony',
    name: 'HarmonyOS',
    devices: '鸿蒙手机与平板',
    href: externalTutorials.harmony,
    action: externalTutorials.harmony ? '进入教程' : '准备中',
    icon: icon('<path d="M6 11.5c2.6-3.4 6-5 10-5s7.4 1.6 10 5M9.5 15.5c1.8-2 4-3 6.5-3s4.7 1 6.5 3M13 19.5c.9-.8 1.9-1.2 3-1.2s2.1.4 3 1.2"/><circle cx="16" cy="24" r="1.5"/>'),
  },
  {
    id: 'windows',
    name: 'Windows',
    devices: 'Windows 电脑',
    href: externalTutorials.windows,
    action: externalTutorials.windows ? '进入教程' : '准备中',
    icon: icon('<path d="M5 7.5 14 6v9H5v-7.5Zm12-2L27 4v11H17V5.5ZM5 18h9v8L5 24.5V18Zm12 0h10v10l-10-1.5V18Z"/>'),
  },
  {
    id: 'macos',
    name: 'macOS',
    devices: 'Mac 电脑',
    href: externalTutorials.macos,
    action: externalTutorials.macos ? '进入教程' : '准备中',
    icon: icon('<rect x="4.5" y="5.5" width="23" height="16" rx="2.5"/><path d="M12 26.5h8M14 21.5v5m4-5v5"/>'),
  },
];

function platformItem(option: PlatformOption) {
  const content = `
    <span class="platform-icon" aria-hidden="true">${option.icon}</span>
    <span class="platform-copy">
      <strong>${option.name}</strong>
      <span>${option.devices}</span>
    </span>
    <span class="platform-action">
      <span>${option.action}</span>
      ${option.href ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg>' : ''}
    </span>`;

  if (option.href) {
    return `<li><a class="platform-option is-available" data-platform="${option.id}" href="${option.href}" aria-label="${option.name}：${option.action}">${content}</a></li>`;
  }

  return `<li><button class="platform-option" data-platform="${option.id}" type="button" disabled aria-label="${option.name}：教程准备中">${content}</button></li>`;
}

export function renderPlatformGateway() {
  return `
    <main class="platform-gateway" data-platform-gateway>
      <div class="gateway-gridscan" data-grid-scan-host aria-hidden="true"></div>
      <div class="gateway-atmosphere" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="gateway-frame">
        <header class="gateway-header">
          <a class="gateway-brand" href="./" aria-label="设备操作教程首页">
            <span class="gateway-brand-mark" aria-hidden="true"><span></span></span>
            <span>设备操作教程</span>
          </a>
          <p>按设备匹配步骤</p>
        </header>

        <div class="gateway-content">
          <section class="gateway-intro" aria-labelledby="gateway-title">
            <h1 id="gateway-title" tabindex="-1">
              <span class="gateway-title-lead">
                <svg viewBox="0 0 54 32" aria-hidden="true"><rect x="2" y="3" width="20" height="27" rx="5"/><rect x="28" y="7" width="24" height="18" rx="3"/><path d="M35 29h10M40 25v4"/></svg>
                你的设备
              </span>
              <span class="gateway-title-question">是什么系统？</span>
            </h1>
            <p class="gateway-intro-copy">选择你正在操作的那台设备。我们会打开对应教程，跟着屏幕一步一步完成。</p>
            <ol class="gateway-journey" aria-label="使用教程的三个环节">
              <li>
                <span class="journey-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="5" y="3" width="10" height="18" rx="2.5"/><path d="M8 6h4M9 18h2"/><rect x="16.5" y="7" width="4" height="11" rx="1.2"/></svg>
                </span>
                <strong>选对系统</strong>
                <span>确认当前设备</span>
              </li>
              <li>
                <span class="journey-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M4 6.5h16v11H4z"/><path d="m7 14 3-3 2.5 2 2.5-3 2 4M8 9h.01"/></svg>
                </span>
                <strong>看图操作</strong>
                <span>每步清楚指引</span>
              </li>
              <li>
                <span class="journey-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="m8 12 2.6 2.6L16.5 9"/></svg>
                </span>
                <strong>独立完成</strong>
                <span>无需技术基础</span>
              </li>
            </ol>
          </section>

          <section class="platform-picker" aria-labelledby="platform-picker-title">
            <h2 id="platform-picker-title" class="sr-only">选择操作系统</h2>
            <ul class="platform-list">
              ${platformOptions.map(platformItem).join('')}
            </ul>
            <p class="platform-help">不确定系统？可在设备的“设置”或“关于本机”中查看。</p>
          </section>
        </div>
      </div>
      <p class="gateway-status sr-only" aria-live="polite" data-gateway-status></p>
    </main>`;
}
