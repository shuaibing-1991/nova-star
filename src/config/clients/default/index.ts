/**
 * Default 客户配置
 * 详见 [[../../../01-产品PRD#6.17 客户定制策略]]
 */
import type { ClientConfig } from '../types'

export const defaultClientConfig: ClientConfig = {
  clientId: 'nova-star-default',
  brand: {
    name: 'NOVA STUDIO',
    shortName: 'NOVA',
    logo: '/clients/default/logo.svg',
    primaryColor: '#FFB6C1',
    accentColor: '#B8C5D6',
    domain: 'nova-star.example.com',
  },
  content: {
    companyName: 'NOVA STUDIO',
    companyShort: 'NOVA',
    groupName: 'LUMINA',
    artistName: '123',
    fanName: '星光',
    fanColor: '#FFB6C1',
    rivalGroup: 'ECLIPSE',
    industryBackdrop: '2026 年夏季',
  },
  features: {
    achievements: 'default-40',
    endingCount: 4,
    enableScreenshot: true,
    enableCloudBackup: false,
    enableMultiDevice: true,
  },
  theme: {
    presetName: 'nova-cool',
    fontPair: 'lXGW + SourceHan',
  },
}
