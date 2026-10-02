# 设备操作教程入口与 iOS 七步教程

面向非技术用户的操作系统导航首页：用户先选择正在操作的设备系统，再进入对应的分步教程。当前 `iOS / iPadOS` 进入本地七步教程；Android、HarmonyOS、Windows 与 macOS 在配置真实目标 URL 前明确显示为“准备中”。

iOS 教程从“设置”进入 Apple 账户，安全退出“媒体与购买项目”，再选择其他 Apple ID 身份登录。

这是独立实现的教程原型，与 Apple Inc. 无关联或背书关系。官方产品机框的分发边界见 [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

## 产品原则

```text
任务完成率
> 状态确定性
> 错误恢复能力
> 阅读负担
> 视觉装饰
```

产品与视觉合同分别记录在：

- [`PRODUCT.md`](./PRODUCT.md)：任务、流程、恢复与完成证据；
- [`DESIGN.md`](./DESIGN.md)：当前视觉系统、交互权威与拒绝项；
- [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)：第三方素材、来源与许可；
- [`RIGHTS.md`](./RIGHTS.md)：原创代码、Apple素材、第三方衍生资源和Git历史的分发边界。

第五步退出图标为 Icons8 的 [`Logout` Color图标（ID 13925）](https://icons8.com/icon/13925/logout)，依照 [Icons8免费使用与署名条款](https://icons8.com/license)提供来源回链；完整声明见 `THIRD_PARTY_NOTICES.md`。

## 技术栈

- Vite 7；
- TypeScript；
- 原生 HTML / CSS / SVG；
- 首页背景按需加载 `three@0.180.0` 与 React Bits Grid Scan shader；
- 无前端框架；`#ios` 教程运行时无 Canvas、WebGL、Video 或 React。

## 环境要求

- Node.js `>=22.12.0`；
- npm；
- Playwright Chromium 与 Firefox：`npx playwright install chromium firefox`；
- Python 3 与 Pillow（仅 `qa:metal` 使用）。

## 运行

```bash
npm ci
npm run dev -- --port 44122
```

开发服务器默认绑定 `0.0.0.0`。根路径显示操作系统选择首页，`#ios` 打开本地 iOS / iPadOS 教程。

其他系统的真实教程地址通过构建时环境变量配置：

```bash
VITE_ANDROID_TUTORIAL_URL=https://example.com/android
VITE_HARMONY_TUTORIAL_URL=https://example.com/harmony
VITE_WINDOWS_TUTORIAL_URL=https://example.com/windows
VITE_MACOS_TUTORIAL_URL=https://example.com/macos
```

可复制 [`.env.example`](./.env.example) 后填写。未配置、格式无效或不是 `http/https` 的目标保持为原生禁用“准备中”，不会生成假链接。Vite 会把这些值编译进公开前端产物，因此不要在其中保存密钥。

## 构建与验证

先在一个终端启动服务器：

```bash
npm run dev -- --port 4173
```

再在另一个终端执行静态检查与构建：

```bash
npm run check
```

依次执行 ESLint、TypeScript 和生产构建。

完整自动验证：

```bash
QA_URL=http://127.0.0.1:4173 npm run qa:all
```

可单独执行：

```bash
npm run qa:gateway  # 六组双引擎首页、路由、键盘与响应式合同
npm run qa          # 八组双引擎七步教程流程与资源合同
npm run qa:stress   # 双引擎快速连续滑动串行门禁
npm run qa:metal    # Metal FX 动画闭环门禁
```

`npm run qa` 默认把截图写入 `RECON/qa-output/`。该目录被 Git 忽略，运行测试不会污染工作树。可通过 `QA_OUTPUT_DIR` 改写输出目录。QA 会先验证页面标题；如果端口被其他项目占用，会立即失败。

生产构建本地预览：

```bash
npm run build
npm run preview -- --port 4173
```

## 目录

```text
src/
  main.ts           页面装配、Hash 路由、教程状态机与输入处理
  platform-navigation.ts 操作系统入口配置、图标与语义结构
  grid-scan.ts      React Bits Grid Scan shader 的首页原生运行壳（动态加载）
  tutorial-content.ts 步骤文案、图标与七个手机屏幕模板
  style.css         首页与教程视觉系统、响应式布局和动效
public/media/
  bezel/            官方透明机框
  metal-fx/         离线生成的选中环与邻近反射资源
  stage/            移动端与桌面端静态背景裁图
scripts/
  gateway-qa.ts     首页、路由、焦点和响应式入口合同
  qa.ts             七步教程主流程与资源合同
  rail-stress-qa.ts 快速输入串行门禁
  verify-metal-loop.py
RECON/
  current/          当前人工评审证据
  user-baselines/   仍有效的人类基线
  qa-output/        自动生成且忽略的测试截图
```

## 当前教程运行合同（仅 `#ios`）

首页 `/` 独立运行 React Bits Grid Scan：支持 WebGL 时懒加载 Three.js Shader，`prefers-reduced-motion` 绘制单帧；不支持 WebGL 时使用静态透视网格。进入 `#ios` 即销毁首页 Canvas 与 WebGL 上下文，直接访问 `#ios` 不请求背景引擎。

```text
Canvas = 0
WebGL = 0
Video = 0
React = 0
背景持续动画 = 0
空闲 HUD Beam 动画 = 0
空闲命名 CSS 动画 = 0
步骤反馈最长 = 460ms
完成反馈最长 = 500ms
```

Rail 的 Metal FX 使用离线 Animated WebP；`prefers-reduced-motion` 使用同源静态 PNG。静态背景不取样、不跟随，也不修改用户上传的手机屏幕内容。

## 回滚点

- 当前静态背景基线：`preview/official-bezel-tutorial-static-ribbon-v1`；
- 纯黑舞台基线：`preview/official-bezel-tutorial-v5.6`。

历史设计实验与旧证据保留在 Git 历史和版本标签中，不继续复制到当前工作树。
