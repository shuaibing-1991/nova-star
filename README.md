# NOVA STAR · 爱豆模拟器（新星计划）

> 一部虚拟工作手机 + 30 天出道前沉浸式人生体验

**版本**：v0.9.0（阶段 9：音效系统 + i18n + 客户配置 + 反馈系统 + Web Vitals 完成）
**当前状态**：所有 30 天剧情 + 5 种结局 + 客户配置运行时接入 + i18n 框架 + 反馈系统就绪

---

## 项目特色

- **沉浸式剧情**：30 天 × 200+ 场景，4 种结局（圆满 / 平淡 / 遗憾 / 隐藏）+ 39 个成就
- **真实模拟**：体力 / 心情 / 信任 / 粉丝数 / 人际关系网 / 舆论热搜 / 数据分析
- **完整 PWA**：可安装到桌面 / 主屏，离线可用（Serwist 9.0.6）
- **音效系统**：Web Audio API 合成（零依赖），5 种音效（tap / chime / bell / reveal / error）
- **国际化**：类型安全 i18n 框架，zh-CN 主语言 + en-US 样例
- **多租户**：客户配置运行时接入，支持品牌色 / Logo / 元数据热切换
- **反馈系统**：navigator.sendBeacon 上报 + localStorage 暂存 + 隐私优先
- **Web Vitals**：LCP / FID / CLS / INP / FCP / TTFB 实时上报到 Umami
- **无障碍**：键盘导航 / 屏幕阅读器 / 触控目标 ≥ 44px / 减少动效 / 字号缩放
- **性能优先**：首屏懒加载（day 1-7 静态 + day 8-30 dynamic import）/ rAF 优化 / 性能预算

---

## 一、技术栈

- **框架**：Next.js 14.2.5（App Router）
- **语言**：TypeScript 5.5.4（strict 模式）
- **UI**：Tailwind CSS 3.4.7 + Radix UI 13 个原子组件
- **状态**：Zustand 4.5.4（4 个 store：game / engine / settings / ui）
- **动画**：framer-motion 11.3.19 + 自研 motion-tokens design tokens
- **图标**：lucide-react（统一图标库）
- **PWA**：Serwist 9.0.6
- **校验**：Zod 3.23.8
- **测试**：Vitest 2.0.4 + Playwright 1.45.3

---

## 二、5 步跑起来

```bash
# 1. 进入项目
cd nova-star

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 浏览器打开
open http://localhost:3000

# 5. 体验完整流程：开场 → 艺人档案 → 工作手机 → 30 天剧情 → 结局
```

环境要求：Node.js ≥ 18.18.0，pnpm ≥ 8.0.0

---

## 三、目录结构

```
nova-star/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 根布局（字体/主题/Toaster/PerfBadge/EndingTransition）
│   │   ├── page.tsx              # 开场沉浸页
│   │   ├── onboarding/           # 6 步艺人档案
│   │   ├── play/                 # 剧情播放
│   │   ├── phone/                # 工作手机（chat/weibo/schedule/data/notification/achievements/settings）
│   │   └── ending/[id]/          # 结局页
│   ├── components/
│   │   ├── ui/                   # 19 个通用 UI（Button/Card/Dialog/Switch/Slider...）
│   │   ├── business/             # 业务组件（PhoneShell/ScenePlayer/ChoiceCard/AchievementGrid...）
│   │   ├── theme-provider.tsx    # 主题切换
│   │   ├── error-boundary.tsx    # 错误边界
│   │   └── system/               # 系统级（PageTransition/PerfBadge/EndingTransition/FontSizeRoot/UpdatePrompt/InstallPrompt/SoundBridgeProvider/WebVitalsReporter）
│   ├── lib/                      # 工具与基础设施
│   │   ├── decision.ts           # 决策引擎
│   │   ├── save-manager.ts       # 存档（localStorage + SHA-256 + JSON）
│   │   ├── ending-evaluator.ts   # 结局评估器
│   │   ├── motion-tokens.ts      # 动效 design tokens（单一来源）
│   │   ├── sound.ts              # Web Audio API 音效引擎（阶段 9 新增）
│   │   ├── analytics.ts          # Umami 上报工具
│   │   ├── feedback-reporter.ts  # 反馈上报（sendBeacon + 离线暂存，阶段 9 新增）
│   │   ├── structured-data.ts    # JSON-LD 结构化数据
│   │   └── utils.ts              # cn / formatNumber / debounce
│   ├── hooks/                    # 自定义 hooks
│   │   ├── use-typewriter.ts     # 打字机（rAF 优化 + 屏幕阅读器支持）
│   │   ├── use-haptic.ts         # 触觉反馈（受 vibrationEnabled 控制）
│   │   ├── use-preferences.ts    # 偏好合并 hook（OS + 应用设置）
│   │   ├── use-sound-bridge.ts   # 音效与设置桥接（阶段 9 新增）
│   │   └── use-client-config.ts  # 客户端读取客户配置（阶段 9 新增）
│   ├── i18n/                     # 国际化（阶段 9 新增）
│   │   ├── messages/             # 语言包（zh-CN.ts + en-US.ts）
│   │   ├── registry.ts           # 语言注册表 + 浏览器检测
│   │   ├── use-translation.ts    # 翻译 Hook（类型安全 DeepKeys）
│   │   └── index.ts              # 统一导出
│   ├── stores/                   # 5 个 Zustand store（game / engine / settings / ui / feedback）
│   ├── types/                    # TypeScript 类型
│   ├── data/                     # 30 天剧情 / 5 NPC / 39 成就
│   └── config/                   # 多租户客户配置
├── public/                       # 静态资源（PWA manifest、图标）
├── tests/                        # Vitest + Playwright
├── Dockerfile                    # Docker 多阶段构建
├── LICENSE                       # 专有商业许可
└── package.json
```

---

## 四、核心命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发服务器（端口 3000） |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务器 |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm lint` / `pnpm lint:fix` | ESLint 检查 / 自动修复 |
| `pnpm format` | Prettier 格式化 |
| `pnpm test` / `pnpm test:run` | Vitest 监听 / 单次 |
| `pnpm test:e2e` | Playwright 端到端 |
| `pnpm analyze` | Bundle 体积分析（@next/bundle-analyzer） |

---

## 五、设计系统

详见 `[[../03-设计系统规范]]`：

- **品牌色**：primary (pink #FFB6C1) / accent (blue + cream)
- **字体**：Inter / LXGW 霞鹜文楷 / PingFang SC / Noto Sans SC
- **动效**：统一在 `src/lib/motion-tokens.ts`（duration / easing / stagger / spring）
- **图标**：lucide-react
- **触控目标**：≥ 44×44px（iOS HIG）
- **圆角**：sm 4px / DEFAULT 8px / md 12px / lg 16px / xl 24px

---

## 六、性能基线（阶段 7 优化后）

| 指标 | 目标 | 优化后预估 |
|------|------|-----------|
| 首屏 FCP | < 1.8s | ~1.0-1.5s |
| 首屏 LCP | < 2.5s | ~2-2.5s |
| 打字机帧率 | 60fps | rAF 循环稳定 |
| 触控目标 | ≥ 44px | 全场景达成 |
| 首屏 bundle | < 200KB | day 1-7 静态 + day 8-30 懒加载 |

开发期右下角可见 `<PerfBadge />`，实时显示 FCP/LCP。

---

## 七、无障碍

- **键盘**：Tab / Enter / Space / ESC 全场景可达
- **屏幕阅读器**：aria-label / role / live region 全覆盖；SR 用户直接看完整文本（跳过打字机）
- **触控**：所有可交互元素 ≥ 44×44px
- **减少动效**：检测 `prefers-reduced-motion` + 应用内开关双重门控
- **字号**：支持小 / 中 / 大三档（影响 rem 派生样式）
- **主题**：auto / light / dark 三档

---

## 八、阶段产出

| 阶段 | 内容 | 文档 |
| --- | --- | --- |
| 0 | PRD / 设计稿 / 设计系统 | `[[../01-产品PRD]]` |
| 1 | 基础设施 + 工程化 | `[[../阶段验收/阶段1-Round5-review]]` |
| 2 | 核心架构（剧情/决策/存档）| `[[../阶段验收/阶段2-Round5-review]]` |
| 3 | 工作手机主界面 | `[[../阶段验收/阶段3-Round5-review]]` |
| 4 | 日程/数据/通知 | `[[../阶段验收/阶段4-验收报告]]` |
| 5 | Day 2-7 剧情 + 成就扩展 | `[[../阶段验收/阶段5-验收报告]]` |
| 6 | Day 8-30 + 成就墙 + 结局系统 | `[[../阶段验收/阶段6-验收报告]]` |
| 7 | UI/UX 打磨 + 性能优化 | `[[../阶段验收/阶段7-验收报告]]` |
| 8 | 部署准备（PWA / SEO / 安全头）| `[[../阶段验收/阶段8-验收报告]]` |
| 9 | 音效 + i18n + 客户配置 + 反馈 + Web Vitals | `[[../阶段验收/阶段9-验收报告]]` |

### 阶段 9 新增能力速览

- **音效系统**：Web Audio API 合成（零外部资源），5 种音效（tap / chime / bell / reveal / error）
- **国际化**：类型安全 i18n 框架，zh-CN 主语言 + en-US 样例，4 个核心组件接入
- **客户配置**：运行时按 `NEXT_PUBLIC_CLIENT_ID` 加载不同客户的品牌色 / Logo / 元数据
- **反馈系统**：navigator.sendBeacon 上报 + 60 秒限流 + 离线暂存 + 隐私优先（仅元数据上报）
- **Web Vitals**：LCP / FID / CLS / INP / FCP / TTFB 通过 Umami 实时上报
- **单元测试**：阶段 9 新增 58 个测试（sound / i18n / client-config / feedback / web-vitals）

---

## 九、部署

### 9.0 5 分钟上线到 Vercel（推荐）

```bash
# 1. 推送到 GitHub
git init && git add . && git commit -m "NOVA STAR v0.9.0"
gh repo create nova-star --public --source=. --remote=origin --push

# 2. 在 https://vercel.com 导入 nova-star 仓库

# 3. 配置环境变量
#    NEXT_PUBLIC_SITE_URL       = https://nova-star.vercel.app
#    NEXT_PUBLIC_CLIENT_ID       = default
#    NEXT_PUBLIC_CSP_REPORT_ONLY = false

# 4. 点 Deploy → 3 分钟后自动获得 https://nova-star.vercel.app
```

详细指南：[`docs/DEPLOYMENT_VERCEL.md`](./docs/DEPLOYMENT_VERCEL.md)

### 9.1 其他部署方式

> 完整的多平台部署手册（Vercel / Netlify / Docker + Nginx / 静态 CDN / 客户切换 / 灰度 / 回滚 / 故障排查 / 运维清单）请查阅 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。本节为快速参考。

### 9.2 生产构建

> 💡 Vercel 部署时**无需手动构建**，平台自动执行 `pnpm build`。以下流程仅用于 Docker 自托管或本地验证。

```bash
# 1. 安装依赖
pnpm install

# 2. 生成 PWA 图标（首次部署或换 logo 时）
pnpm add -D sharp
node public/icons/generate-png.mjs

# 3. 构建（standalone 模式，便于 Docker）
BUILD_STANDALONE=true pnpm build

# 4. 启动
pnpm start
```

### 9.3 部署平台

> Vercel 详细步骤见 [`docs/DEPLOYMENT_VERCEL.md`](./docs/DEPLOYMENT_VERCEL.md)；其他平台（Docker / Netlify / 静态 CDN）见 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。

#### 自托管（Docker）
```bash
docker build -t nova-star:latest .
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  --name nova-star \
  nova-star:latest
```

#### 静态托管（Cloudflare Pages / Netlify）
```bash
pnpm build
# 上传 .next/static + out/ 目录
```

### 9.4 环境变量

详见 `.env.example`。生产环境必填：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 生产域名（用于 OG image 绝对路径） |
| `NEXT_PUBLIC_CLIENT_ID` | ✅ | 客户端标识（默认 `default`） |
| `NEXT_PUBLIC_CSP_REPORT_ONLY` | - | 调试 CSP 时设 `true`（不阻断，只上报）|

可选：
- `NEXT_PUBLIC_SENTRY_DSN`（错误监控）
- `NEXT_PUBLIC_ANALYTICS_URL` / `NEXT_PUBLIC_ANALYTICS_DOMAIN`（自托管 Umami）

### 9.5 HTTPS / CDN

- **必须 HTTPS**：PWA Service Worker 仅在 HTTPS 下注册（localhost 例外）
- **推荐 CDN**：Cloudflare / 阿里云 CDN / AWS CloudFront
- **缓存策略**：详见 `next.config.mjs` headers 配置
  - HTML：`no-cache`
  - `_next/static/*`：`max-age=31536000, immutable`（1 年）
  - `/icons/*`：`max-age=2592000`（30 天）

### 9.6 上线检查清单

部署后逐项验证：

- [ ] 域名解析正常（DNS A/CNAME）
- [ ] HTTPS 证书有效（Let's Encrypt / Cloudflare）
- [ ] `/manifest.json` 可访问
- [ ] `/sw.js` 可访问
- [ ] `/icons/favicon.ico` 可访问
- [ ] `/icons/icon-192x192.png` 可访问
- [ ] `/sitemap.xml` 可访问
- [ ] Chrome DevTools → Application → Service Worker 显示 activated
- [ ] Lighthouse PWA 检查 ≥ 90
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO ≥ 90
- [ ] 移动端实测：iOS Safari / Android Chrome
- [ ] 离线访问：飞行模式下打开 `/`，能看到开场页
- [ ] 添加到主屏：iOS / Android 都能正确安装

### 9.7 监控与日志

| 项 | 推荐方案 | 状态 |
| --- | --- | --- |
| 错误监控 | Sentry（前端异常上报） | ⚠️ 暂未启用（默认 Umami 兜底，详见 [[阶段8-Round4-review#修复清单]]） |
| 性能监控 | Web Vitals（阶段 7 已落地）+ Vercel Analytics | ✅ |
| 访问统计 | 自托管 Umami / Plausible | ✅ 已实现 |
| 日志 | Vercel Logs / Cloudflare Logs | ✅ |

### 9.8 常见问题

> 阶段 8 Round 6：完整构建流程详见 `[[docs/BUILD_CHECKLIST]]`

**Q: PWA 安装后图标是空白？**
A: 需要运行 `node public/icons/generate-png.mjs` 生成实际 PNG（README 占位）。详见 `public/icons/GENERATE.md`。

**Q: 构建产物缺少 PWA 图标？**
A: 完整构建流程见 `docs/BUILD_CHECKLIST.md`。常见原因：
- 未运行 `generate-png.mjs`
- `sharp` 依赖未安装
- `public/icons/` 目录为空

**Q: Service Worker 不注册？**
A: 检查是否 HTTPS；检查 `public/sw.js` 是否被 Serwist 生成；检查浏览器控制台报错。

**Q: CSP 阻断合法资源？**
A: 启动期设 `NEXT_PUBLIC_CSP_REPORT_ONLY=true`，观察浏览器 console 上报，逐步放开。

**Q: 首屏 LCP > 2.5s？**
A: 检查 Google Fonts CDN 是否能访问；考虑改自托管字体；用 `<link rel="preload">` 预加载关键资源。

### 9.9 浏览器兼容性

> 阶段 8 Round 6：补充多语言 hreflang 说明

#### 多语言 SEO（hreflang）

当前仅 `zh-CN`，未声明 `hreflang`。原因：
- 单语言站点无需 `hreflang`（Google 不会因为缺失而惩罚）
- 未来如需多语言，按以下方式扩展：

```ts
// src/app/layout.tsx
alternates: {
  canonical: '/',
  languages: {
    'zh-CN': '/',
    // 'en-US': '/en',
    // 'ja-JP': '/ja',
  },
}
```

如启用多语言，sitemap 也需为每种语言生成对应 URL。

#### 支持范围（阶段 8 验证）

| 浏览器 | 版本 | 状态 | 备注 |
| --- | --- | --- | --- |
| Chrome / Edge | ≥ 90 | ✅ 完全支持 | 推荐体验环境 |
| Safari (macOS) | ≥ 14 | ✅ 完全支持 | iOS 14+ 等同 |
| Safari (iOS) | ≥ 14 | ✅ 完全支持 | 需 iOS 16.4+ 才能用 viewport interactiveWidget |
| Firefox | ≥ 90 | ✅ 基本支持 | SW / PWA 安装可能受限（Firefox 对 PWA 支持较弱） |
| Android Chrome | ≥ 90 | ✅ 完全支持 | 主力移动端 |
| Android WebView | ≥ 90 | ⚠️ 部分 | WebView 需开启 PWA 支持 |
| 微信内置浏览器 | - | ⚠️ 部分 | SW 不可用，需 HTTPS |

#### 已使用的较新 API

| API | 用途 | 兼容版本 |
| --- | --- | --- |
| `viewport interactiveWidget` | iOS 键盘避让 | Safari iOS 16.4+ |
| `viewportFit: cover` | iPhone 安全区 | Safari iOS 11+ |
| `navigator.share` | 移动分享 | Android Chrome / iOS Safari |
| `clipboard.writeText` | 复制 | 主流浏览器全部支持（HTTPS 必需） |
| 动态 `import()` | 错误上报懒加载 | Chrome 63+ / Safari 11.1+ |
| `AbortController` | 自动播放取消 | Chrome 66+ / Safari 11.1+ |
| `Map` / `Set` | 数据结构 | 全部现代浏览器 |

#### 不支持的浏览器（降级策略）

- **IE 11 及以下**：完全不兼容（项目使用 ES2020+ 特性）
- **Safari < 14**：CSS `:has()` 选择器等新特性不可用，UI 可能异常
- **iOS < 14**：无法安装 PWA（系统限制），但可正常浏览

### 9.10 自动化验证

#### Playwright 烟囱测试（阶段 8 Round 4 新增）

```bash
# 安装 Playwright 浏览器（一次性）
pnpm exec playwright install

# 运行 e2e
pnpm test:e2e
```

覆盖场景：
- 启动页 → onboarding → play 完整流程
- 任一结局可到达
- 离线场景 fallback 到 `/offline`
- 关键页面无 JS 报错

#### Lighthouse 手动验证

```bash
# 启动生产构建
pnpm build && pnpm start

# Chrome DevTools → Lighthouse → 勾选 PWA / Performance / Accessibility / SEO
```

目标分数：
- PWA ≥ 90
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 90

#### 兼容性测试矩阵

详见 `tests/e2e/` 下的 Playwright 配置（多浏览器矩阵）。

### 9.11 PWA 自定义安装提示（阶段 8 Round 6）

项目自动捕获浏览器 `beforeinstallprompt` 事件，在合适时机（3 秒延迟）显示「安装到主屏」按钮。

#### 行为说明

- 默认隐藏（避免首启打扰）
- 用户主动展开后才显示「立即安装」按钮
- 7 天内 dismiss 不再显示（localStorage 缓存）
- 已安装（standalone 模式）自动隐藏

#### 关闭方式

如需关闭（如开发期调试），可注释 `src/app/layout.tsx` 中的 `<InstallPrompt />`。

#### 兼容性

- ✅ Chrome / Edge 90+（桌面 / Android）
- ✅ Samsung Internet
- ⚠️ iOS Safari（不支持 beforeinstallprompt，需用户手动操作：分享 → 添加到主屏幕）

---

## 十、已知限制

- **音效**：未实现，UI 占位（soundEnabled 字段保留）
- **抖音 / Bubble / Instagram**：暂未开放，主页显示"敬请期待"
- **离线存档**：localStorage 容量限制（5-10MB），超长剧情分支可能受影响
- **国际化**：仅 zh-CN，i18n 留待阶段 8+
- **fontSize**：仅影响 rem 派生样式，tailwind 绝对值字号不受影响（已文档说明）

---

## 十、部署

详见 `[[../阶段验收/阶段7-Round4-fix#bundle-影响估算]]`：

- 静态导出：`pnpm build` 后产物可直接部署到 CDN
- 推荐平台：Vercel / Netlify / 阿里云 OSS / Cloudflare Pages
- PWA：使用 Serwist 9.0.6，需配置 HTTPS

---

## 十一、许可证

本项目为专有商业软件。详见 [LICENSE](./LICENSE)。

---

**项目管理**：听雨 · **AI 助手**：Claudian · **仓库路径**：`11.项目/爱豆模拟器/代码/nova-star/`