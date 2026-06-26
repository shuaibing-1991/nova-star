/**
 * Day 14 剧情：第二周结束
 * 详见 [[../../../05-Day1-30剧情大纲#Day 14：第二周结束]]
 *
 * 第二次内部 Showcase + 团队聚餐
 */
import type { Scene } from '@/types'

export const day14Scenes: Record<string, Scene> = {
  day14_morning: {
    id: 'day14_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天下午，第二次内部 Showcase。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '上一周的争议已经过去了。这一次，让他们看看真正的你。',
      },
    ],
    autoNext: 'day14_rehearsal',
  },

  day14_rehearsal: {
    id: 'day14_rehearsal',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午最后一次彩排。',
      },
      {
        type: 'narration',
        text: '你深呼吸，让自己进入状态。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5 },
    },
    autoNext: 'day14_showcase',
  },

  day14_showcase: {
    id: 'day14_showcase',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '下午 3 点，舞台灯光亮起。',
      },
      {
        type: 'narration',
        text: '这一次你选择——',
      },
    ],
    options: [
      {
        id: 'opt_burst',
        text: '把这一周的所有情绪都放进去',
        visibleText: '爆发',
        setFlag: 'day14_burst',
        effect: { stage: 6, mood: 3, trust: 3 },
        nextScene: 'day14_review',
      },
      {
        id: 'opt_clean',
        text: '稳扎稳打，每一个动作都到位',
        visibleText: '稳',
        effect: { stage: 4, mood: 1, trust: 2 },
        nextScene: 'day14_review',
      },
    ],
  },

  day14_review: {
    id: 'day14_review',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '结束后，韩知恩把你叫到一边。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你回来了。',
      },
    ],
    onEnter: {
      modifyRelationship: { han_zhi_en: { affection: 3 } },
    },
    autoNext: 'day14_dinner',
  },

  day14_dinner: {
    id: 'day14_dinner',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，许嘉树组织全队去吃烤肉。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '第二周辛苦了！',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '……还差两周。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 10 },
      modifyRelationship: {
        xu_jia_shu: { affection: 5 },
        zhou_yan: { affection: 3 },
        shen_yao: { affection: 2 },
      },
      setFlags: ['day14_complete', 'showcase2_complete'],
    },
    autoNext: 'day15_morning',
  },
}
