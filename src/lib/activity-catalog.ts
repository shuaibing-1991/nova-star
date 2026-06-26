/**
 * 活动目录（9 个活动）
 * 详见 [[../../../01-产品PRD#6.5 数值系统]]
 */

export type ActivityCategory = 'training' | 'appearance' | 'rest'

export interface Activity {
  id: string
  category: ActivityCategory
  name: string
  desc: string
  icon: string
  /** 持续时长（半天 = 0.5，全天 = 1） */
  duration: number
  /** 体力消耗（正数消耗，负数恢复） */
  energyDelta: number
  /** 数值影响 */
  effects: {
    mood?: number
    vocal?: number
    dance?: number
    stage?: number
    trust?: number
    followers?: number
  }
  /** 前置条件（不符合则不可选） */
  requirements?: {
    minEnergy?: number
    minTrust?: number
    minMood?: number
  }
  /** 触发的 flag */
  riskFlag?: string
  /** 提示文案（带 emoji） */
  hint: string
}

/** 训练类（4 项） */
const TRAINING: Activity[] = [
  {
    id: 'train_vocal',
    category: 'training',
    name: '声乐练习',
    desc: '在练房反复练同一首主打歌',
    icon: '🎤',
    duration: 0.5,
    energyDelta: -20,
    effects: { vocal: 3, mood: -2 },
    hint: '提升声乐，但心情会下降',
  },
  {
    id: 'train_dance',
    category: 'training',
    name: '舞蹈练习',
    desc: '和编舞老师抠动作细节',
    icon: '💃',
    duration: 0.5,
    energyDelta: -25,
    effects: { dance: 3, mood: -3 },
    hint: '提升舞蹈，但体力消耗大',
  },
  {
    id: 'train_stage',
    category: 'training',
    name: '舞台演练',
    desc: '模拟演出，反复打磨镜头感',
    icon: '🎭',
    duration: 1,
    energyDelta: -30,
    effects: { stage: 4, mood: -4 },
    requirements: { minEnergy: 30 },
    hint: '高强度训练，需要足够体力',
  },
  {
    id: 'train_fitness',
    category: 'training',
    name: '体能训练',
    desc: '跑步 + 核心 + 拉伸',
    icon: '🏃',
    duration: 0.5,
    energyDelta: -20,
    effects: { dance: 1, stage: 1, mood: -1 },
    hint: '基础训练，消耗适中',
  },
]

/** 通告类（3 项） */
const APPEARANCE: Activity[] = [
  {
    id: 'event_photoshoot',
    category: 'appearance',
    name: '拍摄物料',
    desc: '为公司拍宣传照 / 概念视频',
    icon: '📷',
    duration: 0.5,
    energyDelta: -15,
    effects: { followers: 200, trust: 2 },
    hint: '增加粉丝与公司信任',
  },
  {
    id: 'event_interview',
    category: 'appearance',
    name: '媒体采访',
    desc: '接受娱乐记者专访',
    icon: '🎙️',
    duration: 0.5,
    energyDelta: -10,
    effects: { followers: 100, trust: 3 },
    hint: '低消耗，公司信任提升',
  },
  {
    id: 'event_meetfan',
    category: 'appearance',
    name: '粉丝见面',
    desc: '小型粉丝握手会',
    icon: '🤝',
    duration: 1,
    energyDelta: -25,
    effects: { followers: 500, mood: -5, trust: 1 },
    requirements: { minMood: 30 },
    hint: '高粉丝增长，但需要好心情',
  },
]

/** 休息类（2 项） */
const REST: Activity[] = [
  {
    id: 'rest_sleep',
    category: 'rest',
    name: '早睡早起',
    desc: '10 点睡，6 点起',
    icon: '😴',
    duration: 0,
    energyDelta: 30,
    effects: { mood: 5 },
    hint: '恢复体力，心情也会好',
  },
  {
    id: 'rest_fun',
    category: 'rest',
    name: '放松娱乐',
    desc: '刷短视频、吃零食、和队友聊天',
    icon: '🎮',
    duration: 0,
    energyDelta: 20,
    effects: { mood: 10 },
    hint: '快速恢复心情',
  },
]

/** 所有活动 */
export const ACTIVITIES: Activity[] = [
  ...TRAINING,
  ...APPEARANCE,
  ...REST,
]

/** 按 ID 查找 */
export function getActivity(id: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.id === id)
}

/** 按 category 分组 */
export function getActivitiesByCategory(): Record<ActivityCategory, Activity[]> {
  return {
    training: TRAINING,
    appearance: APPEARANCE,
    rest: REST,
  }
}

export const CATEGORY_META: Record<
  ActivityCategory,
  { label: string; desc: string; icon: string; color: string }
> = {
  training: {
    label: '训练',
    desc: '提升专业能力',
    icon: '💪',
    color: 'text-blue-500',
  },
  appearance: {
    label: '通告',
    desc: '曝光与收益',
    icon: '📺',
    color: 'text-orange-500',
  },
  rest: {
    label: '休息',
    desc: '恢复状态',
    icon: '☕',
    color: 'text-green-500',
  },
}
