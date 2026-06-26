/**
 * Day 6 剧情：团队凝聚
 * 详见 [[../../../05-Day1-30剧情大纲#Day 6：团队凝聚]]
 */
import type { Scene } from '@/types'

export const day6Scenes: Record<string, Scene> = {
  day6_morning: {
    id: 'day6_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '今天是拍摄宣传照的日子。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '团队气质要统一，但每个人都要有自己的特点。',
      },
    ],
    autoNext: 'day6_photoshoot',
  },

  day6_photoshoot: {
    id: 'day6_photoshoot',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '摄影师不停喊："再近一点！对，就这样！"',
      },
      {
        type: 'narration',
        text: '你和许嘉树挨得最近，她的头发蹭到你脸。',
      },
    ],
    autoNext: 'day6_zhou_yan_talk',
  },

  day6_zhou_yan_talk: {
    id: 'day6_zhou_yan_talk',
    type: 'dialogue',
    trigger: {
      day: 6,
      conditions: [
        // 通过活动 event_meetfan 触发
      ],
    },
    content: [
      {
        type: 'narration',
        text: '傍晚，周砚主动找你说话。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '前几天我说话太冲了，对不起。',
      },
      {
        type: 'narration',
        text: '她难得露出一点不好意思的表情。',
      },
    ],
    autoNext: 'day6_zhou_yan_choice',
  },

  day6_zhou_yan_choice: {
    id: 'day6_zhou_yan_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '周砚的道歉有点僵硬，但你感觉到她的诚意。',
      },
    ],
    options: [
      {
        id: 'opt_accept',
        text: '「没事，我们一起努力。」',
        visibleText: '接受并鼓励',
        setFlag: 'day6_zhou_yan_reconcile',
        effect: { mood: 3 },
        nextScene: 'day6_team_dinner',
      },
      {
        id: 'opt_cold',
        text: '「你下次注意一点吧。」',
        visibleText: '保持距离',
        effect: { mood: 1 },
        nextScene: 'day6_team_dinner',
      },
      {
        id: 'opt_joke',
        text: '「你这么一说，我还挺感动的。」',
        visibleText: '用幽默化解',
        setFlag: 'day6_zhou_yan_joke',
        effect: { mood: 4 },
        nextScene: 'day6_team_dinner',
      },
    ],
  },

  day6_team_dinner: {
    id: 'day6_team_dinner',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '晚上，五个人围在一起吃火锅。',
      },
      {
        type: 'narration',
        text: '沈遥讲了一个冷笑话，全桌只有许嘉树笑了。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 8 },
      modifyRelationship: { xu_jia_shu: { affection: 5 }, shen_yao: { affection: 3 } },
    },
    autoNext: 'day6_sleep',
  },

  day6_sleep: {
    id: 'day6_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你突然觉得：原来我们不只是在练习。',
      },
    ],
    onEnter: {
      setFlags: ['day6_complete', 'team_bonded'],
      unlockAchievement: 'first_team_dinner',
    },
    autoNext: 'day7_morning',
  },
}