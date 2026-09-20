type TutorialStep = {
  id: string;
  label: string;
  title: string;
  body: string;
  proof: string;
  hudProof: string;
  screen: 'settings' | 'action' | 'translate' | 'complete' | 'confirmSignout' | 'signedOutMedia' | 'identityChoice';
  icon: string;
};

const icons = {
  railSettings: '<img class="rail-icon-image" src="/media/rail-settings-apple.png" alt="" draggable="false">',
  action: '<img class="rail-icon-image" src="/media/rail-action-apple.png" alt="" draggable="false">',
  translate: '<img class="rail-icon-image" src="/media/rail-media-purchases-apple.png" alt="" draggable="false">',
  complete: '<img class="rail-icon-image" src="/media/rail-media-purchases-apple.png" alt="" draggable="false">',
  confirmSignout: '<img class="rail-icon-image" src="/media/rail-signout-confirm-icons8.png" alt="" draggable="false">',
  signedOutMedia: '<img class="rail-icon-image" src="/media/rail-media-purchases-apple.png" alt="" draggable="false">',
  identityChoice: '<img class="rail-icon-image" src="/media/rail-media-purchases-apple.png" alt="" draggable="false">',
};

const steps: TutorialStep[] = [
  { id: 'open-settings', label: '打开设置', title: '打开“设置”', body: '打开你 iPhone 上的设置。', proof: '看到“设置”页面，即可继续。', hudProof: '', screen: 'settings', icon: icons.railSettings },
  { id: 'choose-action', label: '选择操作按钮', title: '进入“Apple 账户”', body: '进入设置页面后，轻点顶部的头像，进入你的“Apple 账户”。', proof: '', hudProof: '', screen: 'action', icon: icons.action },
  { id: 'select-translate', label: '媒体与购买项目', title: '进入“媒体与购买项目”', body: '在个人的 apple 账户页面，点击媒体与购买项目选项。', proof: '', hudProof: '', screen: 'translate', icon: icons.translate },
  { id: 'hold-to-finish', label: '退出登录', title: '退出登录“媒体与购买项目”', body: '点击退出登录，⚠️严格保证你的实际操作与前面步骤一致，并再次检查是从媒体与购买项目进来的，确认后退出登录。', proof: '', hudProof: '', screen: 'complete', icon: icons.complete },
  { id: 'confirm-signout', label: '再次确认退出', title: '再次确认“退出登录”', body: '在弹出的提示中，点击“退出登录”。若未出现“再次确认”提示，可跳过此步。', proof: '', hudProof: '', screen: 'confirmSignout', icon: icons.confirmSignout },
  { id: 'prepare-new-account', label: '准备登入', title: '准备登入新的Apple账户', body: '在做第3步点击媒体与购买项目之前，建议先做1,2两步，以免直接点击第3步没有任何反应。', proof: '', hudProof: '', screen: 'signedOutMedia', icon: icons.signedOutMedia },
  { id: 'choose-other-identity', label: '选择其他身份', title: '选择其他身份（Apple账户）', body: '如屏幕上点击第二个选项，以此来使用其他 Apple ID账户登录。', proof: '', hudProof: '', screen: 'identityChoice', icon: icons.identityChoice },
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
    <div class="phone-ui settings-ui" data-screen-state="action" aria-label="用户的 iPhone 设置页面">
      <img class="settings-screen-image" src="/media/screens/settings-screen-user.jpg" alt="" draggable="false">
    </div>`,
  translate: () => `
    <div class="phone-ui translate-ui" data-screen-state="translate" aria-label="用户的 Apple 账户页面">
      <img class="apple-account-screen-image" src="/media/screens/apple-account-screen-user.jpg" alt="" draggable="false">
    </div>`,
  complete: () => `
    <div class="phone-ui complete-ui" data-screen-state="complete" aria-label="媒体与购买项目退出登录菜单">
      <img class="media-signout-screen-image" src="/media/screens/media-purchases-signout-user.jpg" alt="" draggable="false">
    </div>`,
  confirmSignout: () => `
    <div class="phone-ui confirm-signout-ui" data-screen-state="confirmSignout" aria-label="退出登录确认弹窗">
      <img class="media-signout-confirm-screen-image" src="/media/screens/media-signout-confirm-user.jpg" alt="" draggable="false">
    </div>`,
  signedOutMedia: () => `
    <div class="phone-ui signed-out-media-ui" data-screen-state="signedOutMedia" aria-label="退出登录后的 Apple 账户页面">
      <img class="media-signed-out-screen-image" src="/media/screens/media-signed-out-account-user.jpg" alt="" draggable="false">
    </div>`,
  identityChoice: () => `
    <div class="phone-ui identity-choice-ui" data-screen-state="identityChoice">
      <img class="identity-choice-screen-image" src="/media/screens/apple-account-identity-choice-user.jpg" alt="" draggable="false">
    </div>`,
};

const screenNodes = Object.fromEntries(Object.entries(screenTemplates).map(([key, render]) => {
  const template = document.createElement('template');
  template.innerHTML = render().trim();
  return [key, template.content.firstElementChild as HTMLElement];
})) as Record<TutorialStep['screen'], HTMLElement>;
export { chevron, closeIcon, screenNodes, steps };
