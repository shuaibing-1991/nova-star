/**
 * Day 24 剧情：意外
 * 详见 [[../../../05-Day1-30剧情大纲#Day 24：意外]]
 *
 * 训练中受伤（轻伤）+ 是否带伤继续的关键选择
 * 触发 flag: sacrifice_thought
 * 解锁成就: sacrifice_choice
 */
import type { Scene } from '@/types'

export const day24Scenes: Record<string, Scene> = {
  day24_morning: {
    id: 'day24_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午合练时，一个高难度动作。',
      },
      {
        type: 'narration',
        text: '落地时你扭到了右脚踝。',
      },
    ],
    onEnter: {
      modifyStats: { mood: -5 },
    },
    autoNext: 'day24_clinic',
  },

  day24_clinic: {
    id: 'day24_clinic',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '医生说韧带轻度拉伤。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '建议休息 3 天。',
      },
    ],
    autoNext: 'day24_choice',
  },

  day24_choice: {
    id: 'day24_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '晚上，韩知恩找你谈选择。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '继续练，可能影响 Showcase 表现。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '休息 3 天，状态可以保证。',
      },
    ],
    options: [
      {
        id: 'opt_rest',
        text: '听医生的话',
        visibleText: '休息',
        effect: { mood: 5, trust: 2 },
        nextScene: 'day24_night',
      },
      {
        id: 'opt_ice',
        text: '冰敷处理后继续轻量训练',
        visibleText: '折中',
        effect: { mood: 2, stage: 1, trust: 1 },
        nextScene: 'day24_night',
      },
      {
        id: 'opt_push',
        text: '带伤继续练',
        visibleText: '带伤继续',
        setFlag: 'sacrifice_thought',
        effect: { mood: -3, stage: 2, trust: 1 },
        unlockAchievements: ['sacrifice_choice'],
        nextScene: 'day24_night',
      },
    ],
  },

  day24_night: {
    id: 'day24_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '夜里，你独自在宿舍。',
      },
      {
        type: 'narration',
        text: '无论选了什么，你都得对自己的选择负责。',
      },
    ],
    onEnter: {
      setFlags: ['day24_complete'],
    },
    autoNext: 'day25_morning',
  },
}
