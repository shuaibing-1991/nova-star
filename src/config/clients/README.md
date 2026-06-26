# 客户配置手册

本文档说明如何为新客户（B 端）创建独立的品牌定制配置。

## 一、配置结构

每个客户独占一个目录，目录名即为 `clientId`：

```
src/config/clients/
├── default/           # 默认客户（demo）
│   └── index.ts
├── lumina/            # 示例客户
│   └── index.ts
├── types.ts           # ClientConfig 类型定义
└── README.md          # 本文件
```

## 二、新增客户步骤

### 步骤 1：复制默认配置

```bash
cp -r src/config/clients/default src/config/clients/<client-id>
```

### 步骤 2：修改配置

打开 `src/config/clients/<client-id>/index.ts`，按需修改：

```ts
export const xxxClientConfig: ClientConfig = {
  clientId: '<client-id>',
  brand: {
    name: '客户品牌全名',
    shortName: '简称',
    logo: '/clients/<client-id>/logo.svg',
    primaryColor: '#HEX',
    accentColor: '#HEX',
    domain: 'customer-domain.com',
  },
  // ... 其他字段
}
```

### 步骤 3：注册到 REGISTRY

打开 `src/config/client.ts`，将新客户加入注册表：

```ts
import { xxxClientConfig } from './clients/xxx'

const REGISTRY: Record<string, ClientConfig> = {
  default: defaultClientConfig,
  lumina: luminaClientConfig,
  '<client-id>': xxxClientConfig,  // 新增
}
```

### 步骤 4：配置环境变量

在客户的 `.env.local` 中设置：

```bash
NEXT_PUBLIC_CLIENT_ID=<client-id>
```

## 三、字段说明（ClientConfig）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `clientId` | string | ✅ | 唯一标识，必须与目录名一致 |
| `brand.name` | string | ✅ | 品牌全称（用于页面标题） |
| `brand.shortName` | string | ✅ | 简称（用于小尺寸空间） |
| `brand.logo` | string | ✅ | Logo 路径（相对 public/） |
| `brand.primaryColor` | string | ✅ | 主题色 HEX |
| `brand.accentColor` | string | ✅ | 强调色 HEX |
| `brand.domain` | string | ✅ | 客户业务域名（用于 SEO） |
| `content.companyName` | string | ✅ | 公司全称 |
| `content.companyShort` | string | ✅ | 公司简称 |
| `content.groupName` | string | ✅ | 团体名（如 LUMINA） |
| `content.artistName` | string | ✅ | 默认艺名 |
| `content.fanName` | string | ✅ | 粉丝团名 |
| `content.fanColor` | string | ✅ | 粉丝应援色 |
| `content.rivalGroup` | string | ✅ | 剧情中的对手团 |
| `content.industryBackdrop` | string | ✅ | 行业背景描述 |
| `features.achievements` | enum | ✅ | `default-40` 或 `custom-15` |
| `features.endingCount` | enum | ✅ | 结局数量 `3` 或 `4` |
| `features.enableScreenshot` | boolean | ✅ | 是否允许截图 |
| `features.enableCloudBackup` | boolean | ✅ | 是否启用云备份 |
| `features.enableMultiDevice` | boolean | ✅ | 是否多设备同步 |
| `theme.presetName` | string | ✅ | 主题预设名 |
| `theme.fontPair` | enum | ✅ | `lXGW + SourceHan` 或 `lXGW + Inter` |

## 四、配套资源（按需）

新增客户通常需要替换以下文件：

| 文件 | 说明 |
|------|------|
| `public/clients/<id>/logo.svg` | Logo |
| `public/clients/<id>/favicon.ico` | 浏览器图标 |
| `public/clients/<id>/og-image.png` | 社交分享卡 |
| `public/clients/<id>/backgrounds/` | 主题背景图 |
| `public/clients/<id>/npc-avatars/` | NPC 头像 |

## 五、测试清单

新增客户后请验证：

- [ ] `NEXT_PUBLIC_CLIENT_ID=<id> pnpm dev` 启动后页面 Logo/品牌名正确
- [ ] 默认艺名、粉丝团名、应援色正确显示
- [ ] 主题色生效（按钮、链接、强调元素）
- [ ] 剧情中出现的团名、公司名与配置一致
- [ ] `pnpm build` 构建成功，无缺失资源 404
- [ ] 移动端 PWA manifest 显示正确的应用名和图标

## 六、回滚预案

如果新客户配置导致严重问题，可以临时回退：

```bash
# 方法 1：环境变量切回 default
unset NEXT_PUBLIC_CLIENT_ID

# 方法 2：构建时强制 default
NEXT_PUBLIC_CLIENT_ID=default pnpm build
```