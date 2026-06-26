/**
 * 英文语言包（en-US）
 *
 * 阶段 9 Round 1 新增：i18n 框架示例语言
 *
 * 目的：
 * - 验证框架可工作
 * - 为未来多语言扩展提供样例
 *
 * 注意：
 * - 仅翻译 UI 文本
 * - 剧情内容、客户配置不翻译（品牌资产）
 */
import type { Messages } from './zh-CN'

export const enUS: Messages = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    retry: 'Retry',
    submit: 'Submit',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
  },

  home: {
    title: 'NOVA STAR',
    subtitle: 'A 30-day pre-debut virtual life',
    startButton: 'Start',
    continueButton: 'Continue',
    restartButton: 'Restart',
    clickToContinue: 'Tap to continue',
  },

  onboarding: {
    title: 'Create Your Artist Profile',
    step: 'Step {current} / {total}',
    name: 'Your Stage Name',
    namePlaceholder: 'Enter your stage name',
    next: 'Next',
    skip: 'Skip',
  },

  phone: {
    home: 'Home',
    wechat: 'Chat',
    weibo: 'Weibo',
    schedule: 'Schedule',
    data: 'Stats',
    notifications: 'Inbox',
    achievements: 'Awards',
    settings: 'Settings',
  },

  settings: {
    title: 'Settings',
    display: 'Display',
    fontSize: 'Font Size',
    theme: 'Theme',
    interaction: 'Interaction',
    motionEnabled: 'Animations',
    soundEnabled: 'Sound',
    vibrationEnabled: 'Haptics',
    reducedMotion: 'Reduce Motion',
    language: 'Language',
    resetDefaults: 'Reset to Default',
    feedback: 'Send Feedback',
    about: 'About',
  },

  feedback: {
    title: 'Send Feedback',
    type: 'Type',
    typeBug: 'Bug Report',
    typeSuggestion: 'Suggestion',
    typeContent: 'Content Feedback',
    content: 'Details',
    contentPlaceholder: 'Tell us what you think (max 500 chars)',
    contact: 'Contact (optional)',
    contactPlaceholder: 'Email / WeChat',
    submit: 'Submit',
    successMessage: 'Thanks for your feedback!',
    offlineMessage: 'Offline. Feedback will be sent when online.',
  },

  ending: {
    success: 'Successful Debut',
    failure: 'Did Not Debut',
    hidden: 'Hidden Ending',
    neutral: 'Neutral Ending',
    restart: 'Play Again',
    share: 'Share',
    backToMenu: 'Back to Menu',
  },

  errors: {
    networkError: 'Network error, please retry',
    saveFailed: 'Save failed',
    loadFailed: 'Load failed',
    unknownError: 'Unknown error',
  },

  pwa: {
    install: 'Install to Home Screen',
    installNow: 'Install Now',
    updateAvailable: 'New Version Available',
    updateNow: 'Refresh Now',
    updateLater: 'Later',
    offline: 'You are offline',
    offlineRetry: 'Reload',
  },
}