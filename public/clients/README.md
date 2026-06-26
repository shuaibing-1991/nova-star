# 客户资源目录

本目录存放各客户的静态资源（Logo、favicon、OG 图、背景图、NPC 头像等）。

## 目录约定

```
public/clients/
├── default/          # NOVA STAR 默认资源
│   ├── logo.svg
│   ├── favicon.ico   （阶段 9 Round 2 待补）
│   └── og-image.png  （阶段 9 Round 2 待补）
├── lumina/           # LUMINA 示例资源
│   ├── logo.svg
│   └── ...
└── <client-id>/      # 新客户目录
```

## 当前可用资源

| 客户 | logo.svg | favicon | og-image | 状态 |
|------|----------|---------|----------|------|
| default | ✅ | ❌ 复用 `/icons/favicon.ico` | ❌ 复用 `/icons/og-image.png` | 占位完成 |
| lumina | ✅ | ❌ 复用 `/icons/favicon.ico` | ❌ 复用 `/icons/og-image.png` | 占位完成 |

## Round 2 占位策略

为快速验证客户切换链路，Round 2 仅创建 logo.svg，其它资源复用根级 `/icons/` 下的资源：

- `favicon.ico` → 复用 `/icons/favicon.ico`
- `og-image.png` → 复用 `/icons/og-image.png`
- `apple-touch-icon.png` → 复用 `/icons/apple-touch-icon.png`

## 后续补充（Round 3+）

| 资源 | 建议 |
|------|------|
| `favicon.ico` | 32x32 ICO，建议客户自行设计 |
| `og-image.png` | 1200x630 PNG，社交分享卡 |
| `apple-touch-icon.png` | 180x180 PNG |
| `backgrounds/` | 主题背景图（CDN 或自托管） |
| `npc-avatars/` | NPC 头像（多个尺寸） |
