/**
 * Day 28 剧情：决战前夜
 * 详见 [[../../../05-Day1-30剧情大纲#Day 28：决战前夜]]
 *
 * Showcase 前一天
 */
import type { Scene } from '@/types'

export const day28Scenes: Record<string, Scene> = {
  day28_morning: {
    id: 'day28_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '明天就是 Showcase。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天最后一次彩排。不要练坏。',
      },
    ],
    autoNext: 'day28_rehearsal',
  },

  day28_rehearsal: {
    id: 'day28_rehearsal',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午，你们只走了一遍。',
      },
      {
        type: 'narration',
        text: '下午，去 NOVA 造型室。',
      },
    ],
    onEnter: {
      modifyStats: { stage: 2 },
    },
    autoNext: 'day28_styling',
  },

  day28_styling: {
    id: 'day28_styling',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '造型师把头发一缕一缕地烫。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '明天这个时候，我们就在舞台上了。',
      },
    ],
    autoNext: 'day28_evening',
  },

  day28_evening: {
    id: 'day28_evening',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '晚上你回到宿舍。',
      },
      {
        type: 'narration',
        text: '怎么度过这最后几个小时？',
      },
    ],
    options: [
      {
        id: 'opt_alone',
        text: '一个人静一静',
        visibleText: '独处',
        setFlag: 'day28_alone',
        effect: { mood: 5 },
        nextScene: 'day28_sleep',
      },
      {
        id: 'opt_friend',
        text: '找队友聊聊天',
        visibleText: '找队友',
        effect: { modifyRelationship: { xu_jia_shu: { affection: 3 } }, mood: 5 },
        nextScene: 'day28_sleep',
      },
    ],
  },

  day28_sleep: {
    id: 'day28_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你闭上眼睛。',
      },
      {
        type: 'narration',
        text: '明天，就是揭晓的时刻。',
      },
    ],
    onEnter: {
      setFlags: ['day28_complete'],
    },
    autoNext: 'day29_morning',
  },
}
