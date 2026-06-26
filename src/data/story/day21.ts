/**
 * Day 21 剧情：第三周结束
 * 详见 [[../../../05-Day1-30剧情大纲#Day 21：第三周结束]]
 *
 * 第三次内部 Showcase + 韩知恩深度谈话
 */
import type { Scene } from '@/types'

export const day21Scenes: Record<string, Scene> = {
  day21_morning: {
    id: 'day21_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天下午 Showcase 后，我会单独跟你谈。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '关于你的未来。',
      },
    ],
    autoNext: 'day21_showcase',
  },

  day21_showcase: {
    id: 'day21_showcase',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '下午 Showcase，沈遥的那首歌第一次被公司高层完整听到。',
      },
    ],
    options: [
      {
        id: 'opt_support',
        text: '在副歌部分主动给沈遥和声',
        visibleText: '支持沈遥',
        setFlag: 'day21_support',
        effect: { modifyRelationship: { shen_yao: { affection: 5 } }, stage: 5, mood: 3 },
        nextScene: 'day21_review',
      },
      {
        id: 'opt_self',
        text: '把注意力放在自己的段落',
        visibleText: '专注自己',
        effect: { stage: 4, trust: 1 },
        nextScene: 'day21_review',
      },
    ],
  },

  day21_review: {
    id: 'day21_review',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你在变。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '不是变强，是变稳。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5, trust: 2 },
      modifyRelationship: { han_zhi_en: { affection: 4 } },
    },
    autoNext: 'day21_share',
  },

  day21_share: {
    id: 'day21_share',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，全队聚在客厅分享这一周的感受。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '还剩 9 天！我能感觉到我们要成。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5 },
      modifyRelationship: {
        xu_jia_shu: { affection: 3 },
        zhou_yan: { affection: 2 },
        shen_yao: { affection: 2 },
      },
      setFlags: ['day21_complete', 'showcase3_complete'],
    },
    autoNext: 'day22_morning',
  },
}
