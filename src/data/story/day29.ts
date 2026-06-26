/**
 * Day 29 剧情：前夜
 * 详见 [[../../../05-Day1-30剧情大纲#Day 29：前夜]]
 *
 * Showcase 前夜：最后的准备 + 团队聚会
 */
import type { Scene } from '@/types'

export const day29Scenes: Record<string, Scene> = {
  day29_morning: {
    id: 'day29_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天没有任何安排。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '吃好、睡好、别生病。',
      },
    ],
    autoNext: 'day29_morning_choice',
  },

  day29_morning_choice: {
    id: 'day29_morning_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '上午，你要怎么度过？',
      },
    ],
    options: [
      {
        id: 'opt_xu',
        text: '约许嘉树喝咖啡',
        visibleText: '约许嘉树',
        effect: {
          mood: 3,
          modifyRelationship: { xu_jia_shu: { affection: 5 } },
        },
        nextScene: 'day29_afternoon',
      },
      {
        id: 'opt_shen',
        text: '找沈遥听那首 demo',
        visibleText: '找沈遥',
        effect: {
          mood: 3,
          modifyRelationship: { shen_yao: { affection: 5 } },
        },
        nextScene: 'day29_afternoon',
      },
      {
        id: 'opt_zhou',
        text: '跟周砚散散步',
        visibleText: '找周砚',
        effect: {
          mood: 3,
          modifyRelationship: { zhou_yan: { affection: 5 } },
        },
        nextScene: 'day29_afternoon',
      },
      {
        id: 'opt_lin',
        text: '找林夏',
        visibleText: '找林夏',
        effect: {
          mood: 3,
          modifyRelationship: { lin_xia: { affection: 5 } },
        },
        nextScene: 'day29_afternoon',
      },
    ],
  },

  day29_afternoon: {
    id: 'day29_afternoon',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午，许嘉树拉全队去便利店买雪糕。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '这可能是我们最后一次这样玩了。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5 },
    },
    autoNext: 'day29_dinner',
  },

  day29_dinner: {
    id: 'day29_dinner',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '明天 5 点到公司。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '不要迟到。',
      },
    ],
    autoNext: 'day29_night',
  },

  day29_night: {
    id: 'day29_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '深夜，你躺在床上。',
      },
      {
        type: 'narration',
        text: '这 29 天的画面像电影一样在脑中闪过。',
      },
    ],
    onEnter: {
      setFlags: ['day29_complete'],
    },
    autoNext: 'day30_morning',
  },
}
