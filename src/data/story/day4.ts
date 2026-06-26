/**
 * Day 4 剧情：第一次被看到
 * 详见 [[../../../05-Day1-30剧情大纲#Day 4：第一次被看到]]
 */
import type { Scene } from '@/types'

export const day4Scenes: Record<string, Scene> = {
  day4_morning: {
    id: 'day4_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '今天天气不错，练习室透进阳光。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天 CEO 会来观察你们训练。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '不要刻意，正常发挥。',
      },
    ],
    autoNext: 'day4_ceo_observation',
  },

  day4_ceo_observation: {
    id: 'day4_ceo_observation',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午 10 点，一位西装革履的中年男人走进练习室。',
      },
      {
        type: 'narration',
        text: '他叫陈致远，是公司的 CEO。',
      },
      {
        type: 'narration',
        text: '他没有说话，只是在角落坐着看。',
      },
    ],
    autoNext: 'day4_ceo_choice',
  },

  day4_ceo_choice: {
    id: 'day4_ceo_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: 'CEO 的目光扫过你。你选择怎么表现？',
      },
    ],
    options: [
      {
        id: 'opt_smile',
        text: '微笑点头，继续练',
        visibleText: '自信但不张扬',
        effect: { mood: 2, trust: 2 },
        setFlag: 'day4_ceo_calm',
        nextScene: 'day4_after_training',
      },
      {
        id: 'opt_extra',
        text: '更努力地练习（加难度动作）',
        visibleText: '抓住机会表现',
        effect: { dance: 3, mood: -2 },
        setFlag: 'day4_ceo_extra',
        nextScene: 'day4_after_training',
      },
      {
        id: 'opt_steady',
        text: '保持平日水平',
        visibleText: '稳健但不出彩',
        setFlag: 'day4_ceo_steady',
        effect: { trust: 1 },
        nextScene: 'day4_after_training',
      },
    ],
  },

  day4_after_training: {
    id: 'day4_after_training',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '训练结束，CEO 走过来和韩知恩低声交谈。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '他对你印象不错，说你"眼里有光"。',
      },
    ],
    onEnter: {
      modifyStats: { trust: 5, mood: 5 },
    },
    autoNext: 'day4_evening',
  },

  day4_evening: {
    id: 'day4_evening',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '傍晚，韩知恩找你单独复盘。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你今天的节奏控制得很稳。要继续。',
      },
    ],
    autoNext: 'day4_sleep',
  },

  day4_sleep: {
    id: 'day4_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你第一次觉得，也许努力真的会被看到。',
      },
    ],
    onEnter: {
      setFlags: ['day4_complete', 'ceo_impressed'],
      unlockAchievement: 'noticed_by_ceo',
    },
    autoNext: 'day5_morning',
  },
}