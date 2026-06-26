# 构建检查清单

> 阶段 8 Round 6 新增：每次构建前的标准流程
> 适用于本地构建、CI/CD、部署前自检

## 一、构建前（Pre-build）

### 1.1 依赖与代码

- [ ] `pnpm install` 无错误（Node.js ≥ 18.18 / pnpm ≥ 8.0）
- [ ] `pnpm lint` 通过（ESLint + Next.js 规则）
- [ ] `pnpm type-check` 通过（TypeScript strict 模式）
- [ ] `pnpm test:run` 单元测试全部通过
- [ ] `pnpm test:e2e` 烟囱测试全部通过（可选，需 dev server）

### 1.2 环境变量

- [ ] `.env.local` 已创建（基于 `.env.example`）
- [ ] `NEXT_PUBLIC_SITE_URL` 指向正确的域名
- [ ] `NEXT_PUBLIC_CSP_REPORT_ONLY=false`（生产环境）
- [ ] `NODE_ENV=production`
- [ ] `BUILD_STANDALONE=true`（Docker 部署）

### 1.3 资源就绪

- [ ] `node public/icons/generate-png.mjs` 已运行（首次或换 logo 后）
- [ ] `public/icons/*.png` 文件齐全（72/96/128/144/152/192/384/512/maskable）
- [ ] `public/icons/favicon.ico` 已生成
- [ ] `public/icons/og-image.png` 已生成
- [ ] `public/icons/apple-touch-icon.png` 已生成

### 1.4 Git 状态

- [ ] 工作目录无未提交的关键文件
- [ ] 已 commit 当前迭代的所有代码
- [ ] 已在正确的分支（main / release）

## 二、构建中（Build）

### 2.1 运行命令

```bash
# 1. 生成 PWA 图标（如未生成）
pnpm add -D sharp
node public/icons/generate-png.mjs

# 2. 构建
BUILD_STANDALONE=true pnpm build

# 3. 验证产物
ls -la .next/standalone/
ls -la .next/static/
ls -la public/
```

### 2.2 验证产物

- [ ] `.next/standalone/server.js` 存在
- [ ] `.next/standalone/.next/static/` 完整
- [ ] `.next/standalone/public/` 包含 `manifest.json` / `sw.js` / `icons/`
- [ ] `.next/standalone/public/sw.js` 存在且非空
- [ ] `.next/standalone/package.json` 存在

### 2.3 构建输出分析

```bash
# Bundle 大小（应小于 300KB gzip）
pnpm build 2>&1 | grep -E "(First Load|Route)"

# 预期大致：
# /              First Load JS ≈ 100KB
# /play          First Load JS ≈ 180KB
# /phone         First Load JS ≈ 150KB
# /ending/[id]   First Load JS ≈ 130KB
```

- [ ] 所有页面 First Load JS < 300KB
- [ ] 无 `Module not found` 错误
- [ ] 无 `Type error` 警告

## 三、构建后（Post-build）

### 3.1 本地启动验证

```bash
# 启动生产模式
pnpm start

# 验证关键 URL
curl -I http://localhost:3000/
curl -I http://localhost:3000/play
curl -I http://localhost:3000/phone
curl -I http://localhost:3000/ending/success
curl -I http://localhost:3000/manifest.json
curl -I http://localhost:3000/sw.js
curl -I http://localhost:3000/sitemap.xml
curl -I http://localhost:3000/robots.txt
```

- [ ] 所有关键 URL 返回 200
- [ ] `/sw.js` Content-Type 为 `application/javascript`
- [ ] `/manifest.json` 返回合法 JSON（含 name / icons / start_url）
- [ ] `/sitemap.xml` 返回合法 XML
- [ ] `/robots.txt` 含 User-Agent

### 3.2 浏览器验证

#### Chrome DevTools

- [ ] Application → Manifest 无错误
- [ ] Application → Service Workers 显示 activated and is running
- [ ] Application → Cache Storage 有 nova-star-* 缓存
- [ ] Console 无 JS 错误（清空后刷新）
- [ ] Network → Doc 无 404

#### Lighthouse

- [ ] PWA ≥ 90
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 90

#### 移动端实测

- [ ] iOS Safari：可浏览、可添加到主屏
- [ ] Android Chrome：可安装 PWA、可离线浏览
- [ ] 微信内置浏览器：可访问（SW 可能失效）

### 3.3 安全验证

- [ ] 浏览器 console 无 CSP 违规报告
- [ ] HTTPS 配置正确（生产环境）
- [ ] `Strict-Transport-Security` 头存在
- [ ] `X-Frame-Options: DENY` 头存在

## 四、Docker 部署

### 4.1 镜像构建

```bash
# 构建镜像
docker build -t nova-star:v1.0.0 .

# 验证镜像大小（应 < 250MB）
docker images nova-star:v1.0.0
```

- [ ] 镜像构建成功
- [ ] 镜像大小 < 250MB
- [ ] 健康检查通过（HEALTHCHECK）

### 4.2 容器启动

```bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f nova-star

# 健康检查
curl http://localhost:3000/
```

- [ ] 容器启动成功
- [ ] 无启动错误
- [ ] 健康检查通过
- [ ] `/` 返回 200

## 五、上线清单

- [ ] DNS 解析正确
- [ ] HTTPS 证书有效
- [ ] CDN 配置（Cloudflare / Vercel Edge）
- [ ] Umami 埋点 DSN 配置
- [ ] 错误监控告警配置
- [ ] 备份 `.env.local` 和 `.next/standalone/`
- [ ] 监控告警渠道（邮件 / Slack / 微信）

## 六、回滚预案

如果上线后发现严重问题：

```bash
# Vercel：一键回滚
vercel rollback

# Docker：切换镜像
docker compose down
docker compose up -d nova-star:v0.9.0

# 自托管：恢复备份
cp -r backup/.next/standalone/* /app/
docker compose restart nova-star
```

- [ ] 已准备上一个稳定版本的镜像/代码
- [ ] 已测试回滚流程
- [ ] 数据库迁移可回滚（本项目无数据库）

## 七、构建问题排查

### 7.1 `Module not found`

```bash
# 清理依赖
rm -rf node_modules .next
pnpm install
pnpm build
```

### 7.2 `Type error` 但 `type-check` 通过

可能是动态导入的类型问题，检查 `next.config.mjs` 的 `optimizePackageImports`。

### 7.3 `Out of memory`

```bash
# 增加 Node 内存
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### 7.4 SW 未生成

- 检查 `next.config.mjs` 的 Serwist 配置
- 确认 `src/app/sw.ts` 无语法错误
- 删除 `.next` 后重新构建

---

> 本清单应作为 CI/CD 流水线的一部分自动化（GitHub Actions / GitLab CI）。
> 推荐至少自动化：构建前 + 构建后两个阶段。