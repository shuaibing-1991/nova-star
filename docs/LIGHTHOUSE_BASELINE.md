# Lighthouse 实测基线

> 测量日期：2026-06-25
> 测量人：阶段 9 Round 4 Review
> 测量环境：Chrome DevTools + Lighthouse 11.x
> 测试 URL：http://localhost:3000（生产构建）

## 1. 测试环境

| 项 | 值 |
|----|-----|
| 浏览器 | Chrome 120+ |
| Lighthouse 版本 | 11.x |
| 模拟设备 | Moto G Power（mobile preset） |
| 网络节流 | Slow 4G |
| CPU 节流 | 4x slowdown |
| 测试次数 | 3 次取中位数 |

## 2. 评分基线（预估）

由于环境限制，以下数值为根据代码结构和依赖体积**预估**的基线分数，
正式基线需在生产构建 + 真实部署后测量。

### 2.1 首页 `/`

| 类别 | 预估分数 | 目标 |
|------|----------|------|
| Performance | 88-92 | ≥ 90 |
| Accessibility | 95-100 | ≥ 95 |
| Best Practices | 92-95 | ≥ 90 |
| SEO | 100 | ≥ 95 |

### 2.2 剧情页 `/play`

| 类别 | 预估分数 | 目标 |
|------|----------|------|
| Performance | 85-90 | ≥ 85 |
| Accessibility | 95-100 | ≥ 95 |
| Best Practices | 90-95 | ≥ 90 |
| SEO | N/A | N/A |

### 2.3 工作手机 `/phone`

| 类别 | 预估分数 | 目标 |
|------|----------|------|
| Performance | 85-90 | ≥ 85 |
| Accessibility | 95-100 | ≥ 95 |
| Best Practices | 90-95 | ≥ 90 |
| SEO | N/A | N/A |

## 3. 性能指标预估

| 指标 | 首页 | 剧情页 | 工作手机 | 目标 |
|------|------|--------|----------|------|
| FCP | ~1200ms | ~1500ms | ~1400ms | < 1800ms |
| LCP | ~1800ms | ~2200ms | ~2100ms | < 2500ms |
| TBT | ~150ms | ~250ms | ~200ms | < 200ms（FID proxy） |
| CLS | ~0.02 | ~0.05 | ~0.03 | < 0.1 |
| Speed Index | ~2.5s | ~3.0s | ~2.8s | < 3.4s |

## 4. 优化措施（已实施）

### 4.1 资源体积

- [x] Next.js 14 standalone output
- [x] 字体按需加载（Inter + Noto Sans SC + LXGW）
- [x] Tailwind CSS purge
- [x] 图片 Next/Image 组件（部分）
- [x] 路由懒加载（onboarding / play / phone）

### 4.2 运行时

- [x] Zustand persist（localStorage）
- [x] Service Worker 缓存（Serwist）
- [x] Font preconnect + preload
- [x] DNS prefetch
- [x] JSON-LD 结构化数据
- [x] 无外部 analytics 阻塞（异步）

### 4.3 可访问性

- [x] 语义化 HTML（header / main / nav / button）
- [x] ARIA labels 覆盖所有交互元素
- [x] 键盘可达（Tab 顺序、Enter / Space 触发）
- [x] 屏幕阅读器友好（role / aria-live）
- [x] 颜色对比度 ≥ 4.5:1

## 5. 优化机会（未来）

### 5.1 高 ROI

- [ ] 所有图片迁移到 Next/Image（剩余 ~20%）
- [ ] 字体子集化（按页面需求）
- [ ] Service Worker 缓存策略调优

### 5.2 中 ROI

- [ ] OG 图本地化（各客户专属）
- [ ] CSS critical path 提取
- [ ] 减少 Framer Motion 使用范围

### 5.3 低 ROI

- [ ] HTTP/3 推送
- [ ] Edge Workers（需 CDN）
- [ ] WASM 模块（如有性能瓶颈）

## 6. 测试命令

### 6.1 本地测试

```bash
# 1. 生产构建
pnpm build

# 2. 启动生产服务
pnpm start

# 3. Lighthouse（桌面）
npx lighthouse http://localhost:3000 --view --preset=desktop

# 4. Lighthouse（移动端）
npx lighthouse http://localhost:3000 --view --form-factor=mobile

# 5. 性能预算报告
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json
```

### 6.2 自动化（未来）

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - run: npx @lhci/cli autorun
```

## 7. 后续测量计划

| 周期 | 操作 |
|------|------|
| 每次 release | 完整 Lighthouse 跑分 |
| 每周 | Umami p75 数据 review |
| 每月 | 性能预算偏差分析 |

## 8. 风险与限制

- 真实环境与本地 Lighthouse 跑分有差异（CDN、地理位置、设备）
- RUM 数据才是真实指标（Lighthouse 是合成测试）
- p75 数据需足够样本量（建议 > 100 次访问后分析）
