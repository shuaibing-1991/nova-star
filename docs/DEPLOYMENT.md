# NOVA STAR · 部署指南

> 适用版本：v0.9.0（阶段 9 完成态）
> 覆盖范围：架构 / 构建 / 环境变量 / 多平台部署 / 客户切换 / PWA / HTTPS / 监控 / 灰度 / 回滚 / 运维
> 读者：运维 / DevOps / 实施工程师 / 客户交付团队

---

## 一、架构概览

### 1.1 系统拓扑

```
                        ┌─────────────────────────────────────────────┐
                        │             用户浏览器（Chrome/Safari）       │
                        │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
                        │  │  HTML    │  │   SW     │  │  PWA     │  │
                        │  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
                        └───────┼─────────────┼─────────────┼────────┘
                                │ HTTPS       │ cache       │ install
                        ┌───────▼─────────────▼─────────────▼────────┐
                        │   CDN（Cloudflare / Vercel Edge / 自建）    │
                        │   - 静态资源缓存                              │
                        │   - HTTPS 终止                                │
                        │   - HTTP/2 / HTTP/3                           │
                        └───────────────────────┬─────────────────────┘
                                                │
                        ┌───────────────────────▼─────────────────────┐
                        │       反向代理（Nginx / Vercel Router）       │
                        │       - 安全头（CSP / HSTS / XFO 等）         │
                        │       - SW 路径透传                            │
                        └───────────────────────┬─────────────────────┘
                                                │
                        ┌───────────────────────▼─────────────────────┐
                        │       Next.js Standalone（Node 20）           │
                        │       - SSR + 静态导出                        │
                        │       - 客户配置（编译时注入）                  │
                        │       - Web Vitals / Umami 上报              │
                        └─────────────────────────────────────────────┘
                                                │
                                                │ navigator.sendBeacon
                                                ▼
                        ┌─────────────────────────────────────────────┐
                        │   Umami 自托管（可选）                         │
                        │   - Web Vitals 事件                          │
                        │   - 反馈结构化字段（不上传 content）            │
                        │   - PWA 安装 / 决策事件                       │
                        └─────────────────────────────────────────────┘
```

### 1.2 核心特性

| 特性 | 说明 | 实现 |
|------|------|------|
| **100% 纯前端** | 无后端 API / 数据库 | 所有数据在客户端 localStorage |
| **静态优先** | 全站可静态导出 | `output: 'standalone'` 模式 |
| **编译时多租户** | 客户配置在 `pnpm build` 时注入 | `NEXT_PUBLIC_CLIENT_ID` |
| **边缘缓存** | HTML 不缓存 + 静态资源长缓存 | Nginx / CDN 双层 |
| **隐私优先** | 反馈仅元数据 / Web Vitals 无 PII | 设计阶段约束 |

### 1.3 部署形态对比

| 形态 | 适用场景 | 复杂度 | 性能 | 成本 |
|------|---------|--------|------|------|
| **Vercel** | 中小流量 / 演示 / 个人项目 | ⭐ | ⭐⭐⭐⭐⭐ | 免费 / $20 起 |
| **Netlify** | 类似 Vercel | ⭐ | ⭐⭐⭐⭐⭐ | 免费 / $19 起 |
| **Docker + Nginx** | 自托管 / 企业内网 / 国内合规 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 服务器成本 |
| **静态托管（OSS + CDN）** | 大流量 / 国内访问 | ⭐⭐ | ⭐⭐⭐⭐⭐ | CDN 流量费 |

---

## 二、构建流程

### 2.1 构建前检查

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
pnpm install --frozen-lockfile

# 3. 质量门禁
pnpm type-check     # TS strict 通过
pnpm lint           # ESLint 通过
pnpm test:run       # ~200 个单元测试全部通过
pnpm test:e2e       # 21 个 e2e smoke（可选，需先 pnpm dev）
```

详见 `docs/BUILD_CHECKLIST.md`。

### 2.2 标准构建命令

```bash
# 通用：仅 .next/ 输出（用于 Vercel / Netlify / 静态托管）
pnpm build

# Docker：standalone 模式（自托管）
BUILD_STANDALONE=true pnpm build

# 带 bundle 分析
ANALYZE=true pnpm build
# 产物：.next/analyze/client.html + .next/analyze/nodejs.html
```

### 2.3 构建产物说明

```
.next/
├── standalone/                # Docker 部署用（self-contained Node 服务）
│   ├── server.js              # Next.js 服务器入口
│   ├── .next/static/          # 静态资源（带 hash）
│   ├── public/                # public/ 目录 + manifest + sw.js
│   └── package.json           # 依赖清单
├── static/                    # 静态资源（同 standalone 内）
├── analyze/                   # ANALYZE=true 时生成
└── ...

public/
├── sw.js                      # Service Worker（Serwist 生成）
├── manifest.json              # PWA manifest
├── icons/                     # PWA 图标（72/96/128/.../512）
├── clients/                   # 客户 Logo 占位资源
└── ...
```

---

## 三、环境变量

### 3.1 必填项（生产环境）

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 生产域名（OG image / canonical） | `https://nova-star.app` |
| `NEXT_PUBLIC_CLIENT_ID` | 客户标识（default / lumina / 自定义） | `default` |

### 3.2 推荐配置

| 变量 | 说明 | 推荐值 |
|------|------|--------|
| `NEXT_PUBLIC_CSP_REPORT_ONLY` | CSP 调试模式 | `false`（生产） |
| `BUILD_STANDALONE` | standalone 模式（Docker 必需） | `true` |
| `NODE_ENV` | 运行环境 | `production` |

### 3.3 可选项

| 变量 | 说明 | 默认 |
|------|------|------|
| `NEXT_PUBLIC_ANALYTICS_URL` | Umami 收集地址 | 留空 = 不启用 |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | Umami 站点域名 | 留空 = 不启用 |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN（错误监控） | 留空 = 不启用 |
| `NEXT_PUBLIC_SW_ENABLED` | Service Worker 开关 | `true` |
| `ANALYZE` | Bundle 分析开关 | `false` |

### 3.4 运行时注入 vs 编译时注入

**编译时注入（build-time）**：
- `NEXT_PUBLIC_*` 前缀变量会被 `webpack.DefinePlugin` 替换为字面量
- 同一镜像只能服务一个客户（不可热切换）
- SSR / CSR 一致性最高

**运行时注入（runtime）**：
- 仅 `PORT` / `HOSTNAME` 等服务端变量
- 不建议把客户配置改成运行时（如有需求需改 `src/hooks/use-client-config.ts`）

---

## 四、部署平台

### 4.1 平台 A：Vercel（推荐）

**优势**：零配置、自动 HTTPS、全球 Edge、内置预览环境。

```bash
# 1. 安装 CLI
pnpm i -g vercel

# 2. 登录
vercel login

# 3. 首次部署（预览环境）
vercel

# 4. 生产部署
vercel --prod
```

#### 项目配置（`vercel.json` 可选）

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "env": {
    "NEXT_PUBLIC_SITE_URL": "https://nova-star.app",
    "NEXT_PUBLIC_CLIENT_ID": "default"
  }
}
```

#### 域名绑定

1. Vercel Dashboard → Project → Settings → Domains
2. 添加 `nova-star.app` + `www.nova-star.app`
3. 按提示配置 DNS（CNAME → `cname.vercel-dns.com`）

#### 预览环境

- 每个 PR 自动获得独立 URL（如 `nova-star-git-feature-xxx.vercel.app`）
- 用于客户演示 / QA 验收

#### 回滚

```bash
vercel rollback              # 回滚到上一个生产部署
# 或在 Dashboard → Deployments → 选择历史版本 → Promote
```

---

### 4.2 平台 B：Netlify

```bash
# 1. 安装 CLI
pnpm i -g netlify-cli

# 2. 登录
netlify login

# 3. 初始化
netlify init

# 4. 部署
netlify deploy --prod
```

#### `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_SITE_URL = "https://nova-star.app"
  NEXT_PUBLIC_CLIENT_ID = "default"
  BUILD_STANDALONE = "true"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/icons/*"
  [headers.values]
    Cache-Control = "public, max-age=2592000, must-revalidate"
```

#### 重定向（可选：`/index.html` → `/`）

```toml
[[redirects]]
  from = "/index.html"
  to = "/"
  status = 301
```

---

### 4.3 平台 C：Docker + Nginx（自托管）

适用于：企业内网 / 国内合规 / 已有 K8s / 私有云。

#### 4.3.1 准备工作

```bash
# 项目根目录结构
nova-star/
├── Dockerfile                 # 多阶段构建（已提供）
├── docker-compose.yml         # 应用 + Nginx（已提供）
├── nginx.conf                 # 反向代理 + HTTPS（已提供）
├── .env                       # 生产环境变量（从 .env.example 复制）
├── certs/                     # SSL 证书
│   ├── fullchain.pem
│   └── privkey.pem
└── ...
```

#### 4.3.2 准备 SSL 证书

**Let's Encrypt（推荐）**：

```bash
# 安装 certbot
sudo apt install certbot

# 申请证书（standalone 模式需先停止 Nginx）
sudo certbot certonly --standalone -d nova-star.app -d www.nova-star.app

# 复制到项目目录
sudo cp /etc/letsencrypt/live/nova-star.app/fullchain.pem ./certs/
sudo cp /etc/letsencrypt/live/nova-star.app/privkey.pem ./certs/
sudo chmod 644 ./certs/*.pem
```

**自动续期**：

```bash
# crontab -e
0 3 * * * certbot renew --quiet --deploy-hook "cd /opt/nova-star && docker compose restart nginx"
```

#### 4.3.3 配置 `.env`

```bash
cp .env.example .env
vim .env
```

```env
NEXT_PUBLIC_SITE_URL=https://nova-star.app
NEXT_PUBLIC_CLIENT_ID=default
NEXT_PUBLIC_ANALYTICS_URL=https://umami.your-domain.com/api/collect
NEXT_PUBLIC_ANALYTICS_DOMAIN=nova-star.app
NODE_ENV=production
```

#### 4.3.4 修改 `nginx.conf`

将 `server_name` 改为生产域名（已是占位 `nova-star.app`，可直接用）。

#### 4.3.5 启动

```bash
# 构建并启动
docker compose up -d --build

# 查看日志
docker compose logs -f nova-star
docker compose logs -f nginx

# 健康检查
docker compose ps
curl -I https://nova-star.app/
```

#### 4.3.6 防火墙配置

```bash
# 仅开放 80/443
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 4.3.7 容器编排升级（可选：K8s）

详见 `docs/KUBERNETES.md`（待补）。核心要点：
- Deployment 副本数 ≥ 2
- Service ClusterIP（不暴露 3000）
- Ingress（nginx-ingress）终止 HTTPS + 注入安全头
- ConfigMap 注入客户配置（`NEXT_PUBLIC_CLIENT_ID`）

---

### 4.4 平台 D：静态 CDN（OSS + CloudFront / 阿里云 OSS）

适用于：大流量 / 国内外多 CDN / 不需要 SSR。

#### 4.4.1 构建

```bash
# 使用 output: 'export' 模式（需修改 next.config.mjs）
# 或仅部署 standalone 的 .next/static + public（推荐）
pnpm build
```

#### 4.4.2 上传到 OSS

```bash
# 阿里云 OSS
ossutil cp -r .next/static/ oss://nova-star/_next/static/ --update
ossutil cp -r public/ oss://nova-star/ --update

# 或 AWS S3
aws s3 sync .next/static/ s3://nova-star/_next/static/ --delete
aws s3 sync public/ s3://nova-star/ --delete
```

#### 4.4.3 CDN 缓存策略

| 路径 | 缓存策略 |
|------|----------|
| `/_next/static/*` | `max-age=31536000, immutable` |
| `/icons/*` | `max-age=2592000, must-revalidate` |
| `/sw.js` | `max-age=0, must-revalidate`（每次回源） |
| `/*`（HTML） | `max-age=0, must-revalidate` |

#### 4.4.4 回源策略

- SPA 路由：`/*` 全部回源到 `/index.html`（如使用 `output: 'export'`）
- 静态资源：直接命中 CDN，无需回源

---

## 五、客户配置切换

### 5.1 工作原理

`NEXT_PUBLIC_CLIENT_ID` 在 **构建时**通过 `webpack.DefinePlugin` 注入到代码中：

```ts
// src/hooks/use-client-config.ts（编译后）
export function useClientConfig() {
  const id = "default"  // 字面量，非变量
  if (id === 'lumina') return luminaConfig
  return defaultConfig
}
```

### 5.2 为新客户构建

```bash
# 1. 在 src/config/clients/ 创建客户配置目录
mkdir -p src/config/clients/acme
cat > src/config/clients/acme/index.ts <<'EOF'
import type { ClientConfig } from '../types'

export const acmeClientConfig: ClientConfig = {
  id: 'acme',
  brand: {
    name: 'ACME 星计划',
    primaryColor: '#FF6B35',
    accentColor: '#004E89',
  },
  assets: {
    logo: '/clients/acme/logo.svg',
  },
  meta: {
    title: 'ACME 星计划 · 爱豆模拟器',
    description: '...',
  },
}
EOF

# 2. 准备 Logo
mkdir -p public/clients/acme
cp /path/to/acme-logo.svg public/clients/acme/

# 3. 构建
NEXT_PUBLIC_CLIENT_ID=acme pnpm build

# 4. 部署（按平台）
vercel --prod                  # Vercel
docker compose up -d --build   # Docker
```

### 5.3 同一镜像多客户（不推荐）

需要修改 `useClientConfig` 为运行时检测：

```ts
// 改为读取 window.__CLIENT_ID__ 或 cookie
// 需放弃 SSR 一致性
```

**当前方案**：每个客户独立构建 / 独立部署，简单可靠。

---

## 六、PWA 部署要点

### 6.1 Service Worker 路径

**必须根作用域**：`/sw.js`，不能放在 `/public/sw.js` 之外。

```nginx
# nginx.conf
location = /sw.js {
    proxy_pass http://nova_star_backend;
    add_header Service-Worker-Allowed "/" always;
    add_header Cache-Control "public, max-age=0, must-revalidate" always;
}
```

**Next.js 配置**：`next.config.mjs` 中 `swDest: 'public/sw.js'`。

### 6.2 Manifest

`public/manifest.json` 必须可访问且 Content-Type 正确：

```bash
curl -I https://nova-star.app/manifest.json
# 200 OK
# Content-Type: application/manifest+json
```

### 6.3 图标资源

```bash
# 生成所有尺寸
node public/icons/generate-png.mjs

# 验证
ls public/icons/*.png
# 72/96/128/144/152/192/384/512/maskable-512.png + favicon.ico
```

### 6.4 HTTPS 强制

- SW 仅在 HTTPS 下注册（localhost 例外）
- HTTP → HTTPS 重定向（nginx.conf 第 44-48 行）
- HSTS：`Strict-Transport-Security: max-age=63072000`

### 6.5 PWA 安装验证

```bash
# Chrome DevTools → Application → Manifest
# - Name / Icons / Start URL 全部正常
# - Installability: ✓

# Lighthouse → PWA 类别
# - Installable manifest
# - Service Worker registered
# - Works offline
```

---

## 七、HTTPS 与安全头

### 7.1 安全头清单

| Header | 值 | 作用 |
|--------|----|----|
| `Content-Security-Policy` | 见 `next.config.mjs` | 防 XSS / 数据外泄 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | 强制 HTTPS |
| `X-Frame-Options` | `DENY` | 防 clickjacking |
| `X-Content-Type-Options` | `nosniff` | 防 MIME 嗅探 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 控制 referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | 关掉危险权限 |

### 7.2 双层加固

- **Next.js 层**（`next.config.mjs` headers）：编译时确定
- **Nginx 层**（`nginx.conf`）：运行时加强

两层互为冗余，任意一层失效仍有保护。

### 7.3 CSP 调试

```bash
# 临时启用 Report-Only（不阻断，只上报）
NEXT_PUBLIC_CSP_REPORT_ONLY=true pnpm build

# 浏览器 console 查看违规报告
# 调整 next.config.mjs 中的 CSP 策略
# 验证通过后改为 false（正式启用）
```

### 7.4 CSP 白名单（已配置）

| 指令 | 值 |
|------|----|
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'`（Next.js 必需） |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` |
| `font-src` | `'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:` |
| `img-src` | `'self' data: blob:` |
| `connect-src` | `'self'`（无后端，纯前端） |
| `frame-src` | `'none'` |
| `object-src` | `'none'` |

---

## 八、监控

### 8.1 Umami（自托管 / SaaS）

**启用条件**：

```env
NEXT_PUBLIC_ANALYTICS_URL=https://umami.your-domain.com/api/collect
NEXT_PUBLIC_ANALYTICS_DOMAIN=nova-star.app
```

**自托管 Umami（推荐）**：

```bash
# Docker 部署
docker run -d --name umami \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://umami:umami@db:5432/umami \
  ghcr.io/umami-software/umami:postgresql-v2.x
```

**上报事件类型**：

| 事件 | 来源 | 字段 |
|------|------|------|
| `pageview` | 自动 | path / referrer / screen |
| `web_vital` | `WebVitalsReporter`（阶段 9） | name / value / rating / id |
| `feedback_submit` | `feedback-reporter.ts`（阶段 9） | type / contentLength / hasContact |
| `pwa_install` | 手动 | method / outcome |
| `decision_made` | engine store | choiceId / day |

### 8.2 Web Vitals 监控

阶段 9 落地的 `WebVitalsReporter` 自动上报到 Umami。

**关注指标阈值**（详见 `docs/PERFORMANCE_BUDGET.md`）：

| 指标 | good | poor |
|------|------|------|
| LCP | < 2500ms | > 4000ms |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |
| INP | < 200ms | > 500ms |
| FCP | < 1800ms | > 3000ms |
| TTFB | < 800ms | > 1800ms |

### 8.3 错误监控（Sentry，可选）

```bash
# .env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/123
```

当前未启用（默认 Umami 兜底）。如需启用：

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 8.4 服务器监控

**Docker 场景**：

```bash
# 容器资源
docker stats nova-star-app nova-star-nginx

# 健康检查日志
docker inspect --format='{{.State.Health.Status}}' nova-star-app
```

**Nginx 访问日志**：

```bash
# 实时
docker compose logs -f nginx | grep -E " (4|5)[0-9]{2} "

# 异常 IP 统计
awk '$9 ~ /^5/ {print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
```

---

## 九、灰度发布

### 9.1 灰度策略

**Vercel / Netlify**：

```bash
# 1. 部署到预览环境
vercel           # 或 git push 自动触发 PR Preview

# 2. QA 验收（自动化 e2e + 人工）

# 3. 渐进发布（Vercel 付费功能）
vercel --prod --target=staging   # 内部用户
vercel --prod                    # 全量
```

**Docker + Nginx**：

```bash
# 1. 蓝绿部署
# 蓝（当前）：nova-star:v0.9.0 → 80
# 绿（新版）：nova-star:v0.10.0-rc1 → 8080

# 2. 灰度 Nginx（按 IP / Cookie）
# upstream nova_star_backend {
#     server nova-star-blue:3000 weight=90;
#     server nova-star-green:3000 weight=10;
# }

# 3. 全量切换：调整 weight 到 100/0
```

### 9.2 Feature Flag

如需更细粒度控制，引入 `posthog` / `growthbook`：

```ts
// 当前项目暂无 Feature Flag 框架
// v0.2 候选：自研轻量版（基于 localStorage + 环境变量）
```

---

## 十、回滚预案

### 10.1 Vercel

```bash
# 一键回滚
vercel rollback

# 或在 Dashboard 选择历史版本
```

### 10.2 Netlify

```bash
# 回滚到上一个部署
netlify rollback
```

### 10.3 Docker

```bash
# 1. 查看历史镜像
docker images nova-star

# 2. 停止当前
docker compose down

# 3. 修改 docker-compose.yml 的 image tag
# image: nova-star:v0.9.0  # 改为上一稳定版

# 4. 启动
docker compose up -d

# 5. 验证
curl -I https://nova-star.app/
```

### 10.4 静态 CDN

```bash
# 1. 找到上一个版本的资源快照
# 2. 重新上传（覆盖当前）
aws s3 sync backup/.next/static/ s3://nova-star/_next/static/
```

### 10.5 回滚检查清单

- [ ] 已保留上一稳定版本的镜像 / 代码 / 构建产物
- [ ] 已演练回滚流程（建议每季度一次）
- [ ] 数据库迁移可逆（本项目无数据库，✅）
- [ ] 监控告警正常（确认回滚后指标恢复）
- [ ] 用户通知渠道（重大事故需公告）

---

## 十一、运维清单

### 11.1 上线前

- [ ] DNS 解析正确（A / CNAME）
- [ ] HTTPS 证书有效（剩余有效期 ≥ 30 天）
- [ ] HSTS preload 已提交（可选）
- [ ] CSP 正式启用（非 Report-Only）
- [ ] Umami 收集端点验证
- [ ] Sentry DSN 配置（如启用）
- [ ] 监控告警渠道配置（邮件 / Slack / 飞书）
- [ ] 上一个稳定版本镜像 / 代码已备份

### 11.2 上线时

- [ ] 构建产物完整（manifest / sw / icons）
- [ ] Docker 镜像推送到镜像仓库
- [ ] 灰度发布（5% → 20% → 50% → 100%）
- [ ] 实时监控（Web Vitals / 错误率 / 反馈数）
- [ ] 客服 / 运营通知渠道畅通

### 11.3 上线后（首 24 小时）

- [ ] LCP p75 < 2500ms（持续）
- [ ] JS 错误率 < 0.1%
- [ ] 反馈提交正常
- [ ] PWA 安装数趋势
- [ ] 服务器 CPU / 内存 < 70%
- [ ] 无 5xx 异常突增

### 11.4 日常（每周）

- [ ] SSL 证书有效期检查
- [ ] 备份 `.next/standalone/` 与 `.env`
- [ ] Umami 数据巡检（趋势是否平稳）
- [ ] Sentry issue 处理（如启用）
- [ ] 依赖更新检查（`pnpm outdated`）

### 11.5 季度

- [ ] 演练回滚流程
- [ ] Lighthouse 重新跑分（更新 `docs/LIGHTHOUSE_BASELINE.md`）
- [ ] 安全头审计
- [ ] CSP 白名单审计（移除不再需要的外部域）

---

## 十二、故障排查

### 12.1 PWA 安装后图标空白

**原因**：未生成实际 PNG 图标。

**修复**：

```bash
pnpm add -D sharp
node public/icons/generate-png.mjs
# 重新构建
pnpm build
```

### 12.2 Service Worker 不注册

**检查清单**：

- [ ] 部署在 HTTPS（localhost 例外）
- [ ] `/sw.js` URL 返回 200 + Content-Type `application/javascript`
- [ ] 浏览器 console 无报错
- [ ] DevTools → Application → Service Workers 查看

### 12.3 CSP 阻断合法资源

**临时调试**：

```bash
NEXT_PUBLIC_CSP_REPORT_ONLY=true pnpm build
# 浏览器 console 查看违规报告
```

**修复**：在 `next.config.mjs` 的 CSP 策略中加入白名单。

### 12.4 首屏 LCP > 2.5s

**排查方向**：

1. Google Fonts CDN 是否能访问 → 改自托管字体
2. 是否预加载关键资源 → `<link rel="preload">`
3. Bundle 是否过大 → `pnpm analyze`
4. CDN 配置是否最优 → 启用 Brotli / HTTP/3

### 12.5 Docker 容器频繁重启

**排查**：

```bash
docker logs nova-star-app --tail 100
docker inspect nova-star-app | grep -A 5 "State"
```

**常见原因**：
- 端口冲突（3000 被占用）
- 内存不足（OOM Killed）
- 启动期健康检查失败（启动慢可调整 `start_period`）

### 12.6 客户 Logo 不显示

**排查**：

```bash
# 1. 确认 NEXT_PUBLIC_CLIENT_ID 正确
echo $NEXT_PUBLIC_CLIENT_ID

# 2. 确认 Logo 文件存在
ls public/clients/$NEXT_PUBLIC_CLIENT_ID/logo.svg

# 3. 浏览器访问
curl -I https://nova-star.app/clients/$NEXT_PUBLIC_CLIENT_ID/logo.svg
```

### 12.7 反馈发送失败

**排查**：

1. Umami 收集端点是否配置
2. 浏览器是否拦截 sendBeacon（隐私模式）
3. localStorage 是否被禁用
4. 限流是否触发（60s 内重复提交）

---

## 十三、参考资源

### 13.1 项目内部文档

- `README.md`：项目概览
- `docs/BUILD_CHECKLIST.md`：构建检查清单
- `docs/PERFORMANCE_BUDGET.md`：性能预算
- `docs/LIGHTHOUSE_BASELINE.md`：Lighthouse 基线
- `../阶段验收/阶段8-验收报告.md`：阶段 8（部署准备）验收报告
- `../阶段验收/阶段9-验收报告.md`：阶段 9（综合）验收报告

### 13.2 外部参考

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Serwist 配置](https://serwist.pages.dev/)
- [Web Vitals 标准](https://web.dev/vitals/)
- [Umami 自托管](https://umami.is/docs)
- [MDN CSP 指南](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 十四、版本历史

| 版本 | 日期 | 关键变更 |
|------|------|----------|
| v0.9.0 | 2026-06-25 | 阶段 9 综合文档化（本文档初版） |
| v0.8.0 | 2026-06-20 | 阶段 8 部署准备（Docker + Nginx） |
| v0.7.0 | 2026-06-15 | 阶段 7 性能优化 |
| v0.1.0 | 2026-05-01 | 阶段 1 基础设施 |

---

**部署架构师**：听雨 · **AI 助手**：Claudian · **最后更新**：2026-06-25