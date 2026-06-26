# NOVA STAR · Vercel 部署指南

> 适用版本：v0.9.0
> 部署平台：Vercel（Next.js 官方推荐）
> 部署时长：约 5 分钟（首次）
> 适用读者：所有需要快速上线 / 不想本地部署的开发者

---

## 一、为什么选 Vercel

| 优势 | 说明 |
|------|------|
| **零配置** | Next.js 官方团队出品，自动检测框架，无需写部署脚本 |
| **Git 集成** | 推送即部署，PR 自动获得预览环境 |
| **全球 CDN** | Edge Network 自动 HTTPS |
| **免费额度慷慨** | 100 GB 带宽 / 月（个人项目绰绰有余）|
| **Serverless Functions** | 免费 100 GB-小时（足够 SSR 用） |

**适用场景**：个人项目 / 客户演示 / 中小流量 / 不愿运维服务器

---

## 二、5 分钟极速部署（推荐新手）

### 步骤 1：把代码推到 GitHub

```bash
# 在 nova-star/ 项目根目录

# 初始化 git（如果还没有）
git init
git add .
git commit -m "NOVA STAR v0.9.0 ready for deploy"

# 创建 GitHub 仓库并推送
# 方式 A：用 GitHub CLI
gh repo create nova-star --public --source=. --remote=origin --push

# 方式 B：手动
# 1. 去 https://github.com/new 创建 nova-star 仓库（public）
# 2. 然后执行：
git remote add origin https://github.com/你的用户名/nova-star.git
git branch -M main
git push -u origin main
```

### 步骤 2：在 Vercel 导入项目

1. 打开 **https://vercel.com**
2. 点击右上角 **Sign Up** → 选择 **Continue with GitHub**
3. 授权 Vercel 访问你的 GitHub
4. 进入 Dashboard → 点击 **Add New → Project**
5. 在仓库列表中找到 **nova-star** → 点击 **Import**

### 步骤 3：配置项目设置

#### 3.1 基础配置（通常自动识别）

| 项 | 推荐值 | 说明 |
|----|--------|------|
| Project Name | `nova-star` | URL 形如 `nova-star.vercel.app` |
| Framework Preset | `Next.js` | 自动识别 |
| Root Directory | `./` | 默认 |
| Build Command | `pnpm build` | 来自 `vercel.json` |
| Install Command | `pnpm install --frozen-lockfile` | 来自 `vercel.json` |
| Output Directory | 默认 | 自动 |
| Node.js Version | 20.x | 默认 |

#### 3.2 环境变量（重要！）

点击 **Environment Variables** 区域，逐个添加：

| 变量名 | 值 | 环境 |
|--------|----|----|
| `NEXT_PUBLIC_SITE_URL` | `https://nova-star.vercel.app` | Production / Preview |
| `NEXT_PUBLIC_CLIENT_ID` | `default` | Production / Preview |
| `NEXT_PUBLIC_CSP_REPORT_ONLY` | `false` | Production |
| `NEXT_PUBLIC_CSP_REPORT_ONLY` | `true` | Preview（调试 CSP） |

可选（如需埋点）：
| 变量名 | 值 |
|--------|----|
| `NEXT_PUBLIC_ANALYTICS_URL` | `https://你的-umami.com/api/collect` |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | `nova-star.vercel.app` |

> 💡 **小技巧**：把鼠标悬停在变量名上，可以选择 **Production / Preview / Development** 三个环境分别设不同值。例如 `NEXT_PUBLIC_SITE_URL` 在 Preview 应设为预览 URL，Production 设为正式 URL。

#### 3.3 区域设置（影响国内访问）

- 已通过 `vercel.json` 设置为 `hnd1`（香港）
- 国内用户访问延迟通常 < 100ms
- 如需更近：选 `sin1`（新加坡）
- 如面向欧美：选 `iad1`（美东）/ `fra1`（欧洲）

### 步骤 4：点击 Deploy

- 点击页面底部的 **Deploy** 按钮
- Vercel 会自动：
  1. clone 仓库
  2. 安装依赖（pnpm）
  3. 执行 `pnpm build`
  4. 部署到 Edge Network
- 通常 **2-3 分钟** 完成
- 完成后会自动跳转到预览页面

### 步骤 5：验证部署

```bash
# 你的 URL 形如：
https://nova-star.vercel.app

# 检查关键资源
curl -I https://nova-star.vercel.app/
curl -I https://nova-star.vercel.app/manifest.json
curl -I https://nova-star.vercel.app/sw.js
curl -I https://nova-star.vercel.app/sitemap.xml
```

打开浏览器实测：
- [ ] 首页正常加载
- [ ] 可以走完 30 天剧情
- [ ] 4 种结局可到达
- [ ] DevTools → Application → Service Worker 显示 activated
- [ ] DevTools → Application → Manifest 无错误
- [ ] 添加到主屏（PWA 安装）正常

---

## 三、日常开发工作流

### 3.1 推送即部署

```bash
# 修改代码后
git add .
git commit -m "feat: 新增 XX 功能"
git push origin main

# Vercel 自动：
# - 检测 push
# - 构建 + 部署生产环境
# - 给你发邮件（含部署日志链接）
```

### 3.2 PR 预览环境

```bash
# 创建分支开发新功能
git checkout -b feat/xxx
# 改代码...
git push origin feat/xxx

# 在 GitHub 创建 PR
gh pr create --title "feat: xxx" --body "..."

# Vercel 自动：
# - 为这个 PR 创建独立预览环境
# - URL 形如：nova-star-git-feat-xxx-用户名.vercel.app
# - 在 PR 里会评论这个 URL
```

### 3.3 查看部署日志

- Vercel Dashboard → 你的项目 → **Deployments** 标签
- 点击任意部署记录 → 查看 **Build Logs** / **Function Logs**
- 实时错误会显示红色

---

## 四、自定义域名

### 4.1 添加域名

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. 输入你的域名（如 `nova-star.app`）
3. Vercel 会提示你需要配置的 DNS 记录：

```
# 选项 A：使用 Vercel DNS（推荐，自动配置）
在域名注册商处把 nameservers 改为 Vercel 提供的：
ns1.vercel-dns.com
ns2.vercel-dns.com

# 选项 B：使用现有 DNS（手动配置）
添加 CNAME 记录：
nova-star.app  →  cname.vercel-dns.com
www            →  cname.vercel-dns.com
```

4. 等待 DNS 生效（通常 5-30 分钟）
5. Vercel 自动签发 SSL 证书（Let's Encrypt）
6. 自动启用 HTTPS + HSTS

### 4.2 多域名管理

- 支持同时绑定多个域名（如 `nova-star.app` + `nova-star.cn`）
- 自动 HTTPS + 自动重定向 HTTP → HTTPS
- 免费证书自动续期

### 4.3 修改默认 URL

部署完成后，Vercel 给你一个 `*.vercel.app` 域名。**生产建议用自定义域名**：
- 更专业
- 国内访问更快（可选 Cloudflare 代理）
- 避免 vercel.app 在某些地区被墙

---

## 五、环境变量管理

### 5.1 在 Dashboard 配置

- Project → **Settings** → **Environment Variables**
- 支持三个环境：
  - **Production**：正式环境
  - **Preview**：PR 预览环境
  - **Development**：`vercel dev` 本地调试

### 5.2 通过 CLI 配置

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 登录
vercel login

# 进入项目目录
cd nova-star

# 拉取环境变量到本地 .env.local
vercel env pull .env.local

# 设置环境变量
vercel env add NEXT_PUBLIC_SITE_URL production
# 按提示输入值

# 列出所有环境变量
vercel env ls
```

### 5.3 注意事项

- ⚠️ `NEXT_PUBLIC_*` 变量会暴露到客户端 bundle
- ⚠️ 变量名变更后需要 **重新部署** 才能生效
- ⚠️ 删除变量同样需要重新部署

---

## 六、Vercel CLI（高级用法）

### 6.1 安装与登录

```bash
# 安装
pnpm i -g vercel

# 登录
vercel login

# 关联项目（在项目目录）
vercel link
```

### 6.2 常用命令

```bash
# 本地开发（与 pnpm dev 类似，但用 Vercel 环境）
vercel dev

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署列表
vercel ls

# 查看实时日志
vercel logs

# 回滚到上一个生产部署
vercel rollback

# 强制重新部署（无代码变更）
vercel --prod --force
```

### 6.3 团队协作

```bash
# 添加团队成员（需要在 Dashboard → Team Settings）
vercel teams add email@example.com
```

---

## 七、监控与分析

### 7.1 Vercel Analytics（可选付费）

Vercel 提供内置 Web Analytics：
- Project → **Analytics** 标签
- 免费层：有限指标
- 付费：完整 Web Vitals 数据

如需免费替代：用项目自带的 Web Vitals Reporter（阶段 9）+ Umami。

### 7.2 Vercel Speed Insights（可选付费）

- Project → **Speed Insights** 标签
- 真实用户 RUM 数据
- 与自带的 Web Vitals Reporter 二选一即可

### 7.3 Function Logs

- Project → **Logs** 标签（实时）
- 或 Project → **Deployments** → 选某次部署 → **Function Logs**
- 含 SSR 请求、错误堆栈

### 7.4 告警配置

- Project → **Settings** → **Notifications**
- 可配置：
  - 部署成功 / 失败 → Slack / Discord / Email
  - 函数错误阈值告警
  - 性能预算告警

---

## 八、回滚与故障处理

### 8.1 一键回滚

```bash
# 方式 A：CLI
vercel rollback

# 方式 B：Dashboard
# Project → Deployments → 选历史版本 → Promote to Production
```

Vercel 保留所有部署记录，可随时切回任意历史版本。

### 8.2 部署失败排查

```bash
# 查看失败原因
# Dashboard → Deployments → 失败的部署 → Build Logs

# 常见原因：
# 1. 环境变量缺失 → 检查 .env 配置
# 2. 构建超时 → 免费层 45 分钟限制（够用）
# 3. 内存不足 → 免费层 8 GB（Next.js 14 通常够用）
# 4. 依赖冲突 → 删除 node_modules 重新 pnpm install
```

### 8.3 服务降级

Vercel 出问题时（如 502）：
- 通常 1-5 分钟自动恢复
- 可临时回滚到上一个稳定部署
- 状态页：https://vercel-status.com

### 8.4 数据丢失？

✅ **本项目无后端，无数据库**：
- 所有用户数据在浏览器 `localStorage`
- Vercel 部署失败不影响任何用户数据
- 即使服务挂掉，用户游戏进度 100% 安全

---

## 九、成本与升级

### 9.1 免费层额度（基于我训练数据）

| 资源 | 免费额度 | 备注 |
|------|----------|------|
| 部署次数 | 无限 | |
| 带宽 | 100 GB / 月 | 个人项目绰绰有余 |
| 构建时间 | 6,000 分钟 / 月 | |
| Serverless Functions | 100 GB-小时 / 月 | |
| 图片优化 | 1,000 张 / 月 | Next.js `<Image>` 用量 |
| Edge Middleware | 100 万次 / 月 | |
| 团队成员 | 最多 1 人 | 加成员需付费 |

### 9.2 个人项目成本估算

NOVA STAR 典型用量：
- 1,000 用户 / 月 × 平均 3 次访问 × 2 MB / 次 = **6 GB 带宽**
- 30 次部署 / 月 × 2 分钟 / 次 = **60 分钟构建**
- SSR 渲染 ≈ 10 万次 / 月 = **5 GB-小时**

**结论**：在免费层内，足够支撑 **5,000-10,000 月活用户**。

### 9.3 超出免费层怎么办

| 选项 | 价格 | 适用 |
|------|------|------|
| Pro | $20 / 月 / 人 | 团队协作 + 更大额度 |
| Enterprise | 定制 | 大客户 |
| 迁移到 Cloudflare Pages | $0 | 国内访问更好 |

---

## 十、与本地部署的对比

| 维度 | Vercel | 本地 Docker |
|------|--------|------------|
| 部署时间 | 5 分钟 | 2-4 小时 |
| 域名 | 免费 `*.vercel.app` | 需自己买 |
| HTTPS | 自动 | 需配证书 |
| CDN | 全球 Edge | 需自己配 |
| 国内访问 | ⚠️ 一般（除非 hnd1） | 取决于服务器位置 |
| 运维 | 零 | 自己维护 |
| 成本 | 免费 / $20 起 | 服务器 ¥50-500/月 |
| 数据安全 | Vercel 平台风险 | 自己掌控 |

**结论**：
- **个人 / 客户演示 / 中小流量** → Vercel ✅
- **企业内网 / 国内合规 / 大流量** → 自托管 + 国内 CDN

---

## 十一、Vercel 兼容性核对清单

针对 NOVA STAR v0.9.0：

| 项 | 状态 | 备注 |
|----|------|------|
| Next.js 14.2.5 | ✅ | Vercel 完全支持 |
| TypeScript 5.5.4 | ✅ | 自动编译 |
| Tailwind CSS 3.4.7 | ✅ | PostCSS 自动处理 |
| Framer Motion 11.3.19 | ✅ | Edge Runtime 兼容 |
| Zustand 4.5.4 | ✅ | 客户端运行 |
| Serwist 9.0.6（PWA / SW）| ✅ | 生产模式自动启用 |
| `@next/bundle-analyzer` | ✅ | 本地按需启用 |
| 客户配置（`NEXT_PUBLIC_CLIENT_ID`）| ✅ | 编译时注入 |
| Web Vitals 上报 | ✅ | 客户端 sendBeacon |
| 反馈系统 | ✅ | sendBeacon + localStorage |
| 无 API Routes | ✅ | 不影响 |
| 无 middleware | ✅ | 不影响 |

**结论**：零修改即可部署。

---

## 十二、常见问题 FAQ

### Q1：Vercel 国内访问慢怎么办？

**A**：
- `vercel.json` 已设置 `regions: ["hnd1"]`（香港）
- 如果还是慢，加自定义域名 + Cloudflare 代理（免费）

### Q2：能绑定自己的域名吗？

**A**：可以。Project → Settings → Domains，按提示添加。

### Q3：会不会泄露我的代码？

**A**：不会。GitHub public 仓库代码本来就公开，private 仓库 Vercel 也不会泄露。

### Q4：免费额度用完怎么办？

**A**：升级 Pro（$20/月）或迁移到 Cloudflare Pages。

### Q5：能自动部署吗？

**A**：默认 `git push origin main` 就自动部署，无需 GitHub Actions。

### Q6：预览环境数据怎么管理？

**A**：每个 PR 独立 URL + 独立环境变量。生产数据库不共用（本项目无数据库，无影响）。

### Q7：客户配置切换怎么处理？

**A**：每个客户用不同的 Vercel Project（或不同的 Git 分支）。在环境变量里设不同的 `NEXT_PUBLIC_CLIENT_ID`。

### Q8：怎么监控 Web Vitals？

**A**：两种方案二选一：
- Vercel 内置 Speed Insights（付费）
- 项目自带 Web Vitals Reporter（免费）+ Umami

---

## 十三、下一步

部署完成后，建议做以下事情：

- [ ] 在 `https://nova-star.vercel.app` 走完一遍 30 天剧情
- [ ] 浏览器 DevTools 检查 SW / Manifest / Console 无错误
- [ ] Lighthouse 跑分（PWA / Performance / Accessibility / SEO）
- [ ] 绑定自定义域名（可选）
- [ ] 配置 Umami 埋点（可选）
- [ ] 配置告警通知（Slack / Email）
- [ ] 准备分享链接给客户 / 用户

---

## 十四、参考链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 定价](https://vercel.com/pricing)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
- [自定义域名配置](https://vercel.com/docs/projects/domains)

---

**部署负责人**：听雨 · **AI 助手**：Claudian · **最后更新**：2026-06-25