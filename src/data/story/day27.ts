/**
 * Day 27 剧情：最后的合练
 * 详见 [[../../../05-Day1-30剧情大纲#Day 27：最后的合练]]
 *
 * 决战前的最后一次完整排练
 * 触发 flag: confidence_built
 * 解锁成就: confidence_built
 */
import type { Scene } from '@/types'

export const day27Scenes: Record<string, Scene> = {
  day27_morning: {
    id: 'day27_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天完整走一遍带妆彩排。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '从开场到谢幕，一次不停。',
      },
    ],
    autoNext: 'day27_rehearsal',
  },

  day27_rehearsal: {
    id: 'day27_rehearsal',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午 10 点，彩排开始。',
      },
      {
        type: 'narration',
        text: '灯光、音乐、走位。',
      },
      {
        type: 'narration',
        text: '你和队友们第一次完整地呈现 Showcase。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：stage 增量 +4→+3
      modifyStats: { stage: 3, mood: 5 },
    },
    autoNext: 'day27_awakening',
  },

  day27_awakening: {
    id: 'day27_awakening',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '彩排结束的那一刻，你站在舞台中央，灯光还亮着。',
      },
      {
        type: 'narration',
        text: '你突然意识到：',
      },
      {
        type: 'narration',
        text: '我好像真的可以。',
      },
    ],
    onEnter: {
      setFlag: 'confidence_built',
    },
    autoNext: 'day27_feedback',
  },

  day27_feedback: {
    id: 'day27_feedback',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '这是你们这一个月最好的一次。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: 'Showcase 当天，就按这个状态来。',
      },
    ],
    autoNext: 'day27_night',
  },

  day27_night: {
    id: 'day27_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '夜里，你回想着今天。',
      },
      {
        type: 'narration',
        text: '27 天前的自己，绝对不会相信能站在这个位置。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 10 },
      setFlags: ['day27_complete'],
      unlockAchievements: ['confidence_built'],
    },
    autoNext: 'day28_morning',
  },
}
