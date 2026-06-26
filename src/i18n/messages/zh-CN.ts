/**
 * 中文语言包（zh-CN）
 *
 * 阶段 9 Round 1 新增：i18n 框架主语言
 *
 * 范围：
 * - UI 控件（按钮、提示）
 * - 通用文案（错误、成功）
 * - 不含剧情文案（剧情是品牌资产，单独管理）
 *
 * 命名规范：
 * - 点分路径：page.section.key
 * - 全部使用简体中文（不含破折号，符合 CLAUDE.md 全局规则）
 */
export const zhCN = {
  // 全局
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    next: '下一步',
    close: '关闭',
    retry: '重试',
    submit: '提交',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
  },

  // 启动页
  home: {
    title: 'NOVA STAR',
    subtitle: '30 天出道前的虚拟人生',
    startButton: '开始体验',
    continueButton: '继续上次',
    restartButton: '重新开始',
    clickToContinue: '点击继续',
  },

  // 艺人档案
  onboarding: {
    title: '创建你的艺人档案',
    step: '第 {current} 步 / 共 {total} 步',
    name: '你的艺名',
    namePlaceholder: '请输入艺名',
    next: '下一步',
    skip: '跳过',
  },

  // 工作手机
  phone: {
    home: '主页',
    wechat: '微信',
    weibo: '微博',
    schedule: '日程',
    data: '数据',
    notifications: '通知',
    achievements: '成就',
    settings: '设置',
  },

  // 设置
  settings: {
    title: '设置',
    display: '显示',
    fontSize: '字号',
    theme: '主题',
    interaction: '交互',
    motionEnabled: '动效',
    soundEnabled: '音效',
    vibrationEnabled: '触觉反馈',
    reducedMotion: '减少动效',
    language: '语言',
    resetDefaults: '恢复默认设置',
    feedback: '反馈建议',
    about: '关于',
  },

  // 反馈
  feedback: {
    title: '反馈建议',
    type: '反馈类型',
    typeBug: 'Bug 报告',
    typeSuggestion: '产品建议',
    typeContent: '内容反馈',
    content: '详细描述',
    contentPlaceholder: '请输入你的反馈（500 字以内）',
    contact: '联系方式（选填）',
    contactPlaceholder: '邮箱 / 微信',
    submit: '提交反馈',
    successMessage: '感谢你的反馈，我们会认真查看',
    offlineMessage: '当前离线，反馈已暂存',
  },

  // 结局
  ending: {
    success: '成功出道',
    failure: '未能出道',
    hidden: '隐藏结局',
    neutral: '中庸结局',
    restart: '再来一次',
    share: '分享',
    backToMenu: '返回主菜单',
  },

  // 错误
  errors: {
    networkError: '网络错误，请重试',
    saveFailed: '保存失败',
    loadFailed: '加载失败',
    unknownError: '发生未知错误',
  },

  // PWA
  pwa: {
    install: '安装到主屏',
    installNow: '立即安装',
    updateAvailable: '新版本已就绪',
    updateNow: '立即刷新',
    updateLater: '稍后',
    offline: '你已离线',
    offlineRetry: '重新加载',
  },
}

export type Messages = typeof zhCN