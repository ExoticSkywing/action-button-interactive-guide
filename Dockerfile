# ==========================================
# 阶段 1: 依赖与构建环境
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 利用 Docker 层缓存加速依赖安装
COPY package.json package-lock.json* ./
RUN npm ci

# 复制源码并执行构建
COPY . .
RUN npm run build

# ==========================================
# 阶段 2: 高性能轻量 Nginx 静态服务
# ==========================================
FROM nginx:alpine

# 复制定制化的高性能 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 网页根目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
