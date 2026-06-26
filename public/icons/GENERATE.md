# PWA 图标生成指南

> 阶段 8 Round 1：PWA 占位图标已就绪 + 生成脚本就绪
> 设计师可替换 `icon.svg` 后重新运行脚本

## 一、当前状态

| 项 | 状态 |
| --- | --- |
| SVG 源图 | ✅ `icon.svg`（512×512 矢量） |
| OG image SVG | ✅ `og-image.svg`（1200×630 矢量） |
| 生成脚本 | ✅ `generate-png.mjs`（基于 sharp） |
| PNG 输出 | ⏳ 需运行脚本生成 |

## 二、生成方法

### 2.1 安装 sharp（一次性）

```bash
pnpm add -D sharp
```

### 2.2 运行生成脚本

```bash
node public/icons/generate-png.mjs
```

### 2.3 输出文件

脚本会生成以下文件到 `public/icons/`：

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `favicon.ico` | 32×32 | 浏览器 tab |
| `apple-touch-icon.png` | 180×180 | iOS 主屏 |
| `icon-72x72.png` | 72×72 | Android |
| `icon-96x96.png` | 96×96 | Android |
| `icon-128x128.png` | 128×128 | Chrome OS |
| `icon-144x144.png` | 144×144 | Windows |
| `icon-152x152.png` | 152×152 | iOS |
| `icon-192x192.png` | 192×192 | Android / manifest |
| `icon-384x384.png` | 384×384 | Android |
| `icon-512x512.png` | 512×512 | manifest |
| `icon-maskable-512x512.png` | 512×512 | Android Adaptive Icons |
| `og-image.png` | 1200×630 | 社交分享卡片 |

## 三、设计师自定义流程

1. 用 Figma / Sketch / Adobe XD 打开 `icon.svg`
2. 替换文字、图标、配色
3. 导出为 SVG（保留矢量）
4. 修改 `og-image.svg` 的文案与配色
5. 运行 `node public/icons/generate-png.mjs` 重新生成所有 PNG
6. 检查 `public/manifest.json` 的 icons 路径是否需要更新

## 四、临时方案（无 sharp 环境）

如开发环境无法安装 sharp（如某些受限 CI），可临时用在线工具：

- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [realfavicongenerator.net](https://realfavicongenerator.net/)

上传 `icon.svg` 或导出的 512×512 PNG，批量生成所有尺寸。

## 五、CI/CD 集成建议

在 `.github/workflows/ci.yml` 的 build job 中加：

```yaml
- name: Generate PWA icons
  run: |
    pnpm add -D sharp
    node public/icons/generate-png.mjs

- name: Build
  run: pnpm build
```

这样每次构建都自动基于最新 `icon.svg` 生成图标。