/**
 * 客户配置类型
 * 详见 [[../../../01-产品PRD#6.17 客户定制策略]]
 */
export interface ClientConfig {
  clientId: string
  brand: {
    name: string
    shortName: string
    logo: string
    primaryColor: string
    accentColor: string
    domain: string
  }
  content: {
    companyName: string
    companyShort: string
    groupName: string
    artistName: string
    fanName: string
    fanColor: string
    rivalGroup: string
    industryBackdrop: string
  }
  features: {
    achievements: 'default-40' | 'custom-15'
    endingCount: 3 | 4
    enableScreenshot: boolean
    enableCloudBackup: boolean
    enableMultiDevice: boolean
  }
  theme: {
    presetName: string
    fontPair: 'lXGW + SourceHan' | 'lXGW + Inter'
  }
}
