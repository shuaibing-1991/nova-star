# 性能预算文档（Performance Budget）

> 创建日期：2026-06-25
> 适用范围：NOVA STAR 生产环境
> 上游：阶段 9 Round 4

## 1. Core Web Vitals 预算

依据 Google Web Vitals 标准（[web.dev/vitals](https://web.dev/articles/vitals)），我们的目标：

| 指标 | 全称 | 单位 | good | needs-improvement | poor | 我们的目标 |
|------|------|------|------|-------------------|------|-----------|
| **LCP** | Largest Contentful Paint | ms | ≤ 2500 | ≤ 4000 | > 4000 | **< 2500ms** |
| **FID** | First Input Delay | ms | ≤ 100 | ≤ 300 | > 300 | **< 100ms** |
| **INP** | Interaction to Next Paint | ms | ≤ 200 | ≤ 500 | > 500 | **< 200ms** |
| **CLS** | Cumulative Layout Shift | score | ≤ 0.1 | ≤ 0.25 | > 0.25 | **< 0.1** |
| **FCP** | First Contentful Paint | ms | ≤ 1800 | ≤ 3000 | > 3000 | **< 1800ms** |
| **TTFB** | Time to First Byte | ms | ≤ 800 | ≤ 1800 | > 1800 | **< 800ms** |

### 1.1 第 75 百分位达标

Web Vitals 报告应按 75 百分位（p75）达标，而非平均值。

- 1000 个用户访问，p75 表示 750 个用户的体验都达标
- 我们需确保 75% 的用户访问满足上述 good 阈值

## 2. Bundle Size 预算

| 资源类型 | 单资源上限 | 总计上限 | 超出处理 |
|----------|------------|----------|----------|
| **First Load JS** | - | **< 200KB**（gzip） | 拆分路由懒加载 |
| **单个 chunk** | < 100KB | - | 动态 import |
| **CSS** | - | < 50KB | 提取关键 CSS |
| **字体** | < 80KB/字重 | < 300KB | 子集化 |
| **图片（OG 图）** | < 200KB | - | WebP + 压缩 |
| **图片（图标）** | < 30KB | - | SVG 优先 |

### 2.1 First Load JS 当前估算

| Bundle | 大小（gzip） | 备注 |
|--------|--------------|------|
| Next.js Runtime | ~80KB | 框架基础 |
| React + React DOM | ~45KB | 必需 |
| Zustand | ~3KB | 状态管理 |
| Framer Motion | ~30KB | 动画 |
| 应用代码（初始） | ~30KB | layout + home + minimal |
| **合计** | **~188KB** | 在预算内 |

### 2.2 路由懒加载

| 路由 | 是否懒加载 | 备注 |
|------|------------|------|
| `/` | ❌ 必需 | 首页入口 |
| `/onboarding` | ✅ 懒加载 | 用户首次进入后才需要 |
| `/play` | ✅ 懒加载 | 剧情引擎（最大） |
| `/phone` | ✅ 懒加载 | 工作手机（中等） |
| `/phone/*` | ✅ 懒加载 | 子页面 |
| `/ending/[id]` | ✅ 懒加载 | 结局页 |

## 3. 资源加载预算

### 3.1 关键资源（必须 preload）

| 资源 | 类型 | preload 优先级 |
|------|------|----------------|
| Inter Regular 400 | font | medium |
| Noto Sans SC Regular 400 | font | medium |
| 主背景图（home / play） | image | high |
| Logo (client config) | image | medium |

### 3.2 非关键资源

- 用户头像：lazy load
- OG 图：仅首次 social share 时加载
- 字体粗体变体：fallback 到 system font

## 4. 网络预算

| 网络 | LCP 目标 | 备注 |
|------|----------|------|
| 4G（Fast 3G preset） | < 4000ms | Lighthouse 默认测试 |
| 3G（Slow 4G preset） | < 6000ms | 移动端最低标准 |
| WiFi | < 1500ms | 桌面端标准 |

## 5. 设备预算

| 设备等级 | 内存 | CPU | 性能目标 |
|----------|------|-----|----------|
| 高端机 | > 4GB | Apple A14 / Snapdragon 8 Gen 2+ | 全部 good |
| 中端机 | 2-4GB | A13 / Snapdragon 7 系 | 全部 good |
| 低端机 | < 2GB | A12 以下 / 旧 Android | LCP < 4000ms 可接受 |

## 6. CI 检查清单

每次 PR 应自动检查：

- [ ] `next build` 成功，无 warning
- [ ] First Load JS ≤ 200KB（自动报告）
- [ ] 图片资源 < 200KB
- [ ] 无新增 ≥ 30KB 的依赖
- [ ] Lighthouse CI（可选，v0.2+）

## 7. 回归检测

### 7.1 监控方式

- 生产环境 Web Vitals 通过 `WebVitalsReporter` 上报 Umami
- Umami 后端按 page / device class 切片
- 每周 review p75 数据，> 5% 退化则报警

### 7.2 阈值报警

| 指标 | p75 退化阈值 |
|------|--------------|
| LCP | + 200ms |
| FID | + 50ms |
| CLS | + 0.05 |
| Bundle Size | + 10KB |

## 8. 工具链

- **本地测试**：`pnpm build && pnpm start` + Chrome DevTools
- **Lighthouse**：`npx lighthouse http://localhost:3000 --view`
- **WebPageTest**：https://www.webpagetest.org/
- **真实用户监控（RUM）**：Umami web_vital 事件

## 9. 参考资料

- [Web Vitals 官方文档](https://web.dev/articles/vitals)
- [Next.js 性能优化指南](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse 评分标准](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)
