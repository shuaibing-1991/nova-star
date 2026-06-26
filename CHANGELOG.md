# 变更日志 (CHANGELOG)

所有版本变动均记录于此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- 阶段 3：核心页面（艺人档案、工作手机、对话、热搜）
- 阶段 5：剧情内容（Day 1-30 完整对话脚本）
- 阶段 7：测试与优化（覆盖率 80%+）
- 阶段 8：部署交付（CDN、Docker 镜像、域名）

---

## [0.2.0] - 2026-06-24

### 阶段 2：核心架构

#### 新增
- **场景引擎** `src/stores/engine.ts`：6 种场景类型（narration/dialogue/choice/event/transition/ending），generation 防竞态，依赖注入可测试
- **决策引擎** `src/lib/decision.ts`：纯函数 `evaluateCondition` / `filterVisibleOptions` / `applyDecision` / `applySceneEnter` / `extractEffects`
- **触发器系统** `src/lib/scene-trigger.ts`：`matchTrigger` / `findTriggeredScene` / `findDayTriggers`
- **打字机 Hook** `src/hooks/use-typewriter.ts`：速度自适应、skip、reset、onComplete 回调
- **自动播放 Hook** `src/hooks/use-auto-advance.ts`：依赖 `blockReady`，generation 防竞态，ref 缓存
- **多槽位存档** `src/lib/save-manager.ts`：5 槽位 + 自动存档（槽 0）+ 文件/剪贴板导入导出
- **存档 UI** `src/components/business/save-import-export.tsx`：基于 Radix Dialog
- **场景播放器** `src/components/business/scene-player.tsx`：打字机集成 + useMemo 优化 + 暂停/继续按钮
- **调试面板** `src/components/dev/debug-panel.tsx`：开发模式场景跳转、Flag 添加、数值修改
- **全局错误边界** `src/components/error-boundary.tsx`：防白屏，开发模式显示错误堆栈
- **Day 1 剧情数据** `src/data/story/day1.ts`：11 个场景，含开场、第一选项、NPC 介绍

#### 修复
详见 `阶段验收/阶段2-Round1-review.md` ~ `阶段验收/阶段2-Round5-review.md`

- Round 1：跨 store 耦合、隐式 autoSave、NPC 信息重复、竞态、类型守卫
- Round 2：modifyRelationship 跨层、触发器未实现、调试面板薄弱、测试覆盖
- Round 3：存档读档可靠性、版本迁移、元数据缓存、导入导出 UI、错误细分
- Round 4：打字机首帧回退、双计时器脱节、decisionDelay 截断、性能优化、暂停按钮
- Round 5：README/CHANGELOG 脱节、.env.example 冗余字段、ErrorBoundary 缺失、客户配置手册

#### 测试
- 25+ 单元测试覆盖决策引擎（嵌套条件、screenPresence 边界、modifyRelationship）
- 8 单元测试覆盖剧情数据完整性
- 30+ 单元测试覆盖存档读档（round-trip、checksum 篡改、QuotaExceeded、迁移）

#### 性能
- `filterVisibleOptions` / `getNpcById` 用 `useMemo` 缓存
- `advanceBlock` 用 ref 缓存，避免 timer 频繁重置
- 元数据缓存减少 `listSaveSlots` 的 JSON.parse 次数

---

## [0.1.0] - 2026-06-24

### 阶段 1：基础设施搭建

#### 新增
- Next.js 14.2.5 + TypeScript 5.5.4 + Tailwind CSS 3.4.7 项目脚手架
- 18 个通用 UI 组件（button、card、input、textarea、badge、progress、avatar、dialog、sheet、tabs、tooltip、slider、switch、separator、skeleton、accordion、dropdown-menu、toast）
- 4 个业务组件（phone-shell、status-bar、chat-bubble、choice-card）
- 3 个 Zustand store（game、settings、ui）
- 6 个 React Hooks（use-local-storage、use-online-status、use-performance-monitor、use-media-query、use-debounced-callback、use-theme-effect）
- 客户配置目录化（`config/clients/{default,lumina}`）
- 单点版本管理（`config/version.ts`）
- NPC 元数据系统（`data/npcs/`）
- 成就元数据系统（`data/achievements/`）
- 暗色模式 class 切换机制
- SHA-256 校验的 LocalStorage 持久化
- 自托管 Umami 埋点封装
- Serwist PWA 配置（含自定义运行时缓存）
- Service Worker 源文件
- PWA manifest.json、robots.txt、icons/README
- TypeScript 路径别名（9 个）
- ESLint + Prettier + Husky + lint-staged
- vitest.config.ts + playwright.config.ts + 单元测试样例
- Dockerfile（多阶段 standalone）+ docker-compose.yml
- GitHub Actions CI 工作流
- LICENSE（专有商业）+ CHANGELOG.md

#### 修复
详见 `[[../阶段验收/阶段1-Round1-fix]]` ~ `[[../阶段验收/阶段1-Round5-fix]]`

- Round 1：sw.ts runtimeCaching 重复、storage.ts unescape/escape 弃用、SSR 不安全、随机数碰撞、manifest 404、CDN 字体
- Round 2：status-bar 数字格式化重复、exportSave 偏好丢失、版本号重复、未使用 import、订阅模式混合
- Round 3：toast setTimeout 泄漏、useLocalStorage 写入回滚、button transition 冲突、analytics 可观察性
- Round 4：NPC 硬编码、成就元数据、客户配置单文件、暗色模式 class
- Round 5：README 脱节、Dockerfile/CI、LICENSE/CHANGELOG、测试基础设施

#### 安全
- 6 项安全响应头（X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy、HSTS、SW Cache-Control）

#### 性能基线
- 首屏 bundle 目标：≤ 200KB gzipped
- LCP 目标：≤ 2.0s
- CLS 目标：≤ 0.05