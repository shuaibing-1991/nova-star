# ============================================
# NOVA STAR · Dockerfile
# 多阶段构建：依赖 → 构建 → 运行时
# ============================================

# 阶段 1：依赖安装与构建
FROM node:20-alpine AS builder

# pnpm 启用
RUN corepack enable && corepack prepare pnpm@9.5.0 --activate

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
COPY .npmrc* ./

# 安装依赖（含 devDependencies 用于构建）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建参数：standalone 模式便于 Docker 部署
ENV BUILD_STANDALONE=true
ENV NEXT_TELEMETRY_DISABLED=1

# 构建
RUN pnpm build

# ============================================
# 阶段 2：运行时镜像（精简）
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Service Worker
COPY --from=builder --chown=nextjs:nodejs /app/public/sw.js ./public/sw.js 2>/dev/null || true

USER nextjs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]