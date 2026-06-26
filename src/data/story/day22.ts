/**
 * Day 22 剧情：决定
 * 详见 [[../../../05-Day1-30剧情大纲#Day 22：决定]]
 *
 * 确定 Showcase 表演细节（舞台呈现细节，曲目已定）
 */
import type { Scene } from '@/types'

export const day22Scenes: Record<string, Scene> = {
  day22_morning: {
    id: 'day22_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: 'Showcase 的曲目定沈遥那首。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天定走位、舞台效果、互动方式。',
      },
    ],
    autoNext: 'day22_layout',
  },

  day22_layout: {
    id: 'day22_layout',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '韩知恩让你决定自己的舞台位置。',
      },
    ],
    options: [
      {
        id: 'opt_center',
        text: '争取中央位',
        visibleText: '中央位',
        setFlag: 'day22_center',
        effect: { stage: 3, trust: 2 },
        nextScene: 'day22_afternoon',
      },
      {
        id: 'opt_left',
        text: '左侧位，给沈遥和周砚让出空间',
        visibleText: '左侧位',
        effect: { modifyRelationship: { zhou_yan: { affection: 3 }, shen_yao: { affection: 3 } }, stage: 1 },
        nextScene: 'day22_afternoon',
      },
      {
        id: 'opt_creative',
        text: '要求加一段独舞',
        visibleText: '独舞段',
        setFlag: 'day22_creative',
        effect: { stage: 4, dance: 2, mood: 2 },
        nextScene: 'day22_afternoon',
      },
    ],
  },

  day22_afternoon: {
    id: 'day22_afternoon',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午，你和团队一起走位排练。',
      },
      {
        type: 'narration',
        text: '舞台灯光打下来的那一刻，你突然有种不真实感。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：stage 增量 +2→+1（防止过冲）
      modifyStats: { stage: 1, mood: 3 },
    },
    autoNext: 'day22_evening',
  },

  day22_evening: {
    id: 'day22_evening',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，你一个人留在练习室。',
      },
      {
        type: 'narration',
        text: '还有 8 天。你需要更拼。',
      },
    ],
    onEnter: {
      modifyStats: { stage: 1, dance: 1, vocal: 1 },
      setFlags: ['day22_complete'],
    },
    autoNext: 'day23_morning',
  },
}
