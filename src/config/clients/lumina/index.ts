/**
 * LUMINA 客户配置（示例）
 * 复制此目录即可创建新客户
 */
import type { ClientConfig } from '../types'

export const luminaClientConfig: ClientConfig = {
  clientId: 'lumina',
  brand: {
    name: 'LUMINA Entertainment',
    shortName: 'LUMINA',
    logo: '/clients/lumina/logo.svg',
    primaryColor: '#C4B5FD', // 紫罗兰
    accentColor: '#FBBF24', // 琥珀
    domain: 'lumina.example.com',
  },
  content: {
    companyName: 'LUMINA Entertainment',
    companyShort: 'LUMINA',
    groupName: 'AURORA',
    artistName: '凌霄',
    fanName: '极光',
    fanColor: '#C4B5FD',
    rivalGroup: 'OBSIDIAN',
    industryBackdrop: '2026 年冬季',
  },
  features: {
    achievements: 'custom-15',
    endingCount: 3,
    enableScreenshot: true,
    enableCloudBackup: true,
    enableMultiDevice: true,
  },
  theme: {
    presetName: 'lumina-night',
    fontPair: 'lXGW + Inter',
  },
}
