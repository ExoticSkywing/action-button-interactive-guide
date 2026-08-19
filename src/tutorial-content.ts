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
  railSettings: '<img class="rail-icon-image" src="/media/rail-settings-apple.png" alt="" draggable="false">',
  action: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="4"/><path d="M9 7.5h6M9 11h6M9 14.5h3.5"/></svg>',
  translate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5h9M9 3.5v2M6 8.5c1.5 3.1 3.8 5.2 7 6.6M12.8 8.5c-1 2.5-3 4.7-6 6.7"/><path d="m14 19.5 3.1-8 3.4 8M15.2 16.5h4.1"/></svg>',
  complete: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 4.7 4.7L19.5 7"/></svg>',
};

const steps: TutorialStep[] = [
  { id: 'open-settings', label: '打开设置', title: '打开“设置”', body: '打开你 iPhone 上的设置。', proof: '看到“设置”页面，即可继续。', hudProof: '', screen: 'settings', icon: icons.railSettings },
  { id: 'choose-action', label: '选择操作按钮', title: '进入“操作按钮”', body: '在“设置”列表中轻点“操作按钮”。', proof: '页面标题显示“操作按钮”。', hudProof: '页面标题显示“操作按钮”', screen: 'action', icon: icons.action },
  { id: 'select-translate', label: '选择翻译', title: '选择“翻译”', body: '选择“翻译”，再确认使用的语言。', proof: '“翻译”显示为当前选中功能。', hudProof: '“翻译”显示为已选择', screen: 'translate', icon: icons.translate },
  { id: 'hold-to-finish', label: '长按完成', title: '长按操作按钮', body: '长按机身侧面的操作按钮，直到屏幕弹出提示。', proof: '看到“翻译已启动”，任务完成。', hudProof: '设置完成', screen: 'complete', icon: icons.complete },
];

const chevron = (direction: 'left' | 'right') => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction === 'left' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'}"/></svg>`;
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';

const screenTemplates: Record<TutorialStep['screen'], () => string> = {
  settings: () => `
    <div class="phone-ui home-ui" data-screen-state="settings" aria-label="用户的 iPhone 主屏幕">
      <img class="home-screen-image" src="/media/screens/home-screen-user.jpg" alt="" draggable="false">
      <button class="home-settings-target ann ann-nw ann-no-mark" type="button" data-note="点击你 iPhone 上的“设置”" aria-label="打开设置">
        <img src="/media/rail-settings-apple.png" alt="" draggable="false">
      </button>
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
