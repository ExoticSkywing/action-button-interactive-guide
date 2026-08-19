type TutorialStep = {
  id: string;
  label: string;
  title: string;
  body: string;
  proof: string;
  hudProof: string;
  screen: 'settings' | 'action' | 'translate' | 'complete';
  icon: string;
};

const icons = {
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"/><path d="M19 13.4v-2.8l-2-.7-.6-1.4.9-1.9-2-2-1.9.9-1.4-.6-.7-2H8.6l-.7 2-1.4.6-1.9-.9-2 2 .9 1.9-.6 1.4-2 .7v2.8l2 .7.6 1.4-.9 1.9 2 2 1.9-.9 1.4.6.7 2h2.8l.7-2 1.4-.6 1.9.9 2-2-.9-1.9.6-1.4 1.9-.7Z"/></svg>',
  railSettings: '<img class="rail-icon-image" src="/media/rail-settings-apple.png" alt="" draggable="false">',
  action: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="4"/><path d="M9 7.5h6M9 11h6M9 14.5h3.5"/></svg>',
  translate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5h9M9 3.5v2M6 8.5c1.5 3.1 3.8 5.2 7 6.6M12.8 8.5c-1 2.5-3 4.7-6 6.7"/><path d="m14 19.5 3.1-8 3.4 8M15.2 16.5h4.1"/></svg>',
  complete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 4.7 4.7L19.5 7"/></svg>',
};

const homeIcons = {
  weather: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4"/><path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4"/><path d="M7 18.5h10.5a3 3 0 0 0 .1-6 5 5 0 0 0-9.3 1.4A2.5 2.5 0 0 0 7 18.5Z"/></svg>',
  photos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c-3.9-1.6-5.3-4.2-3.7-6.3 1.6-2 3.7-.2 3.7 2.9 0-3.1 2.1-4.9 3.7-2.9 1.6 2.1.2 4.7-3.7 6.3Z"/><path d="M12 12c1.6-3.9 4.2-5.3 6.3-3.7 2 1.6.2 3.7-2.9 3.7 3.1 0 4.9 2.1 2.9 3.7-2.1 1.6-4.7.2-6.3-3.7Z"/><path d="M12 12c3.9 1.6 5.3 4.2 3.7 6.3-1.6 2-3.7.2-3.7-2.9 0 3.1-2.1 4.9-3.7 2.9-1.6-2.1-.2-4.7 3.7-6.3Z"/><path d="M12 12c-1.6 3.9-4.2 5.3-6.3 3.7-2-1.6-.2-3.7 2.9-3.7-3.1 0-4.9-2.1-2.9-3.7 2.1-1.6 4.7-.2 6.3 3.7Z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3v11h-15Z"/><circle cx="12" cy="13" r="3.7"/><circle cx="17.2" cy="9.7" r=".8"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 4.2 9.4 8 7.8 9.5c1.2 2.8 3.5 5.1 6.3 6.3l1.6-1.7 4 2.4-.8 3.1c-.2.8-1 1.3-1.8 1.2C9.8 19.8 4.2 14.2 3.2 6.9c-.1-.8.4-1.6 1.2-1.8Z"/></svg>',
  messages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5c0 4.4-3.9 7.5-8.3 7.5-1.2 0-2.4-.2-3.4-.7L4 20l1.3-3.7A7 7 0 0 1 4 11.5C4 7.4 7.6 4 12 4s8 3.4 8 7.5Z"/></svg>',
  safari: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m14.8 8.2-1.7 5-3.9 2.6 1.7-5Z"/></svg>',
  music: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17.5V6.8l9-2v10.7"/><path d="M9 9.5 18 7.5"/><ellipse cx="6.5" cy="18" rx="2.5" ry="2"/><ellipse cx="15.5" cy="16" rx="2.5" ry="2"/></svg>',
};

const steps: TutorialStep[] = [
  { id: 'open-settings', label: '打开设置', title: '打开“设置”', body: '轻点主屏幕上的“设置”图标。', proof: '看到“设置”页面，即可继续。', hudProof: '看到“设置”页面', screen: 'settings', icon: icons.railSettings },
  { id: 'choose-action', label: '选择操作按钮', title: '进入“操作按钮”', body: '在“设置”列表中轻点“操作按钮”。', proof: '页面标题显示“操作按钮”。', hudProof: '页面标题显示“操作按钮”', screen: 'action', icon: icons.action },
  { id: 'select-translate', label: '选择翻译', title: '选择“翻译”', body: '选择“翻译”，再确认使用的语言。', proof: '“翻译”显示为当前选中功能。', hudProof: '“翻译”显示为已选择', screen: 'translate', icon: icons.translate },
  { id: 'hold-to-finish', label: '长按完成', title: '长按操作按钮', body: '长按机身侧面的操作按钮，直到屏幕弹出提示。', proof: '看到“翻译已启动”，任务完成。', hudProof: '设置完成', screen: 'complete', icon: icons.complete },
];

const chevron = (direction: 'left' | 'right') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'}"/></svg>`;
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

const screenTemplates: Record<TutorialStep['screen'], () => string> = {
  settings: () => `
    <div class="phone-ui home-ui" data-screen-state="settings">
      <div class="status-bar light"><b>9:41</b><span class="system-status" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><strong></strong></span></div>
      <div class="home-app-grid">
        <div><span class="home-app weather">${homeIcons.weather}</span><small>天气</small></div>
        <div><span class="home-app photos">${homeIcons.photos}</span><small>照片</small></div>
        <div><span class="home-app camera">${homeIcons.camera}</span><small>相机</small></div>
        <div class="settings-app-target"><span class="home-app settings-gear">${icons.settings}</span><small>设置</small></div>
      </div>
      <div class="home-dock"><span class="dock-phone">${homeIcons.phone}</span><span class="dock-message">${homeIcons.messages}</span><span class="dock-safari">${homeIcons.safari}</span><span class="dock-music">${homeIcons.music}</span></div>
    </div>`,
  action: () => `
    <div class="phone-ui settings-ui" data-screen-state="action">
      <div class="status-bar"><b>9:41</b><span class="system-status" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><strong></strong></span></div>
      <h2>设置</h2>
      <div class="search-field"><span>⌕</span>搜索</div>
      <section class="settings-group profile-row"><span class="avatar">A</span><div><b>Apple 账户</b><small>iCloud、媒体与购买项目</small></div><em>›</em></section>
      <section class="settings-group setting-rows">
        <div><span class="app-icon wifi">⌁</span><b>无线局域网</b><small>已连接</small><em>›</em></div>
        <div><span class="app-icon bluetooth">B</span><b>蓝牙</b><small>已打开</small><em>›</em></div>
        <div><span class="app-icon mobile">⌁</span><b>蜂窝网络</b><em>›</em></div>
      </section>
      <section class="settings-group setting-rows target-row"><div><span class="app-icon action-color">●</span><b>操作按钮</b><small>轻点进入</small><em>›</em></div></section>
    </div>`,
  translate: () => `
    <div class="phone-ui translate-ui" data-screen-state="translate">
      <div class="status-bar light"><b>9:41</b><span class="system-status" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><strong></strong></span></div>
      <nav class="phone-nav"><span>‹ 返回</span><b>操作按钮</b><span></span></nav>
      <div class="feature-orb translate-orb">${icons.translate}</div>
      <h2>翻译</h2><p>快速翻译对话或文字</p>
      <section class="language-panel"><div><small>从</small><b>中文（普通话）</b><em>›</em></div><div><small>到</small><b>英语（美国）</b><em>›</em></div></section>
      <div class="selected-feature"><span>✓</span>已选择“翻译”</div>
      <div class="screen-hint dark"><span>3</span>确认语言后继续</div>
    </div>`,
  complete: () => `
    <div class="phone-ui complete-ui" data-screen-state="complete">
      <div class="status-bar light"><b>9:41</b><span class="system-status" aria-hidden="true"><i></i><i></i><i></i><i></i><em></em><strong></strong></span></div>
      <p class="lock-date">8 月 14 日 星期五</p><div class="lock-time">9:41</div>
      <div class="live-activity"><span>✓</span><div><b>翻译已启动</b><small>操作按钮设置成功</small></div></div>
    </div>`,
};

const screenNodes = Object.fromEntries(Object.entries(screenTemplates).map(([key, render]) => {
  const template = document.createElement('template');
  template.innerHTML = render().trim();
  return [key, template.content.firstElementChild as HTMLElement];
})) as Record<TutorialStep['screen'], HTMLElement>;
export { chevron, closeIcon, screenNodes, steps };
