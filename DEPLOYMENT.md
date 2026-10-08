# Action Button Interactive Guide (浪漫宇宙生态教程交互系统)

> 专为非技术用户独立闭环完成操作打造的 2026 旗舰级实操引导站点。纯静态现代化架构，零服务端依赖，极速开箱即用。

---

## 🛠 架构特性
- **纯前端静态工程**：基于 Vite + TypeScript + Three.js 构建，打包后直接产出纯静态资源（HTML/CSS/JS/WebP），无任何 Node.js 运行时或数据库依赖。
- **高性能与高并发**：轻量化 Nginx / Caddy / Cloudflare Pages 即可承载万级并发访问。
- **全端适配**：深度通过 WebKit/iOS Safari 与 Firefox 严苛审查，支持物理手势、纵向平滑微动效及超椭圆毛玻璃暗黑视觉。

---

## 🚀 部署方案 A：Docker 极速容器化（推荐，生产首选）

项目已内置针对静态单页优化的高性能 Alpine Nginx Dockerfile。无需在宿主机安装 Node 环境，一行命令起服。

### 1. 运行 Docker 容器
```bash
# 1. 克隆代码
git clone git@github.com:ExoticSkywing/action-button-interactive-guide.git
cd action-button-interactive-guide

# 2. 构建并启动容器（映射宿主机 80 端口）
docker compose up -d --build
```
> 启动后直接访问服务器 IP 或域名：`http://your-server-ip/`

---

## 🌐 部署方案 B：经典 Nginx 纯静态托管

如果目标服务器已有现成的 Nginx 环境：

### 1. 本地/CI 构建静态包
在开发机或 CI 环境中执行（需 Node.js >= 20）：
```bash
npm install
npm run build
```
编译产物位于 `dist/` 目录。

### 2. 上传至服务器
```bash
rsync -avz --delete dist/ user@your-server-ip:/var/www/action-button-guide/
```

### 3. Nginx 配置示例 (`/etc/nginx/conf.d/guide.conf`)
```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为你的域名或 IP

    root /var/www/action-button-guide;
    index index.html;

    # 开启 Gzip 压缩，加速暗黑玻璃材质与矢量图形加载
    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # 静态强缓存策略（资源带 Vite hash，永不过期）
    location ~* \.(?:css|js|webp|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 单页应用路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
重载 Nginx：`nginx -t && systemctl reload nginx`。

---

## ☁️ 部署方案 C：无服务器边缘托管（Vercel / Cloudflare Pages）

对于海外或分布式客户群体，可直接利用无服务器 Edge 极速分发（零服务器运维）：

### Cloudflare Pages / Vercel 配置
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Node.js Version**: `20.x` 或以上

---

## 🔍 部署后验证检查清单
部署完成后，建议在目标机器按以下清单验收核心转化路径：
1. **直接访问**：浏览器打开 `http://<ip-or-domain>/#ios`，确认首屏主屏幕 iPhone 机模加载无黑边；
2. **第一阶段验证**：第 5 步确认常驻出现“提示：完成后向左轻扫，或点右侧 ›”；
3. **第二阶段验证**：点击右侧“前往 ↗”胶囊按钮，测试是否在新标签页打开 `https://appleid.1yo.cc`；
4. **第三阶段验证**：
   - 切换至第 6 步，测试点击“复制配置链接”按钮，是否变绿显示“已复制 ✓”；
   - 切换至第 11 步，测试点击“复制 DNS 链接”，是否能复制 `https://doh.pub/dns-query`；
   - 切换至第 12 步，测试全屏 Canvas 五彩纸屑与礼炮是否自然绽放。
