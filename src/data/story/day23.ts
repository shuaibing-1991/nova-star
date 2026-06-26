/**
 * Day 23 剧情：极限训练
 * 详见 [[../../../05-Day1-30剧情大纲#Day 23：极限训练]]
 *
 * 体力与意志的极限
 */
import type { Scene } from '@/types'

export const day23Scenes: Record<string, Scene> = {
  day23_morning: {
    id: 'day23_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天开始，全天合练。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '体力不行的就申请退出。',
      },
    ],
    autoNext: 'day23_train',
  },

  day23_train: {
    id: 'day23_train',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午 6 点到中午 12 点，下午 2 点到晚上 8 点。',
      },
      {
        type: 'narration',
        text: '中间只休息两次。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：stage 增量 +3→+2
      modifyStats: { stage: 2, dance: 2, vocal: 2, mood: -8 },
    },
    autoNext: 'day23_choice',
  },

  day23_choice: {
    id: 'day23_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '晚上 8 点半，你的腿已经发软。',
      },
      {
        type: 'narration',
        text: '但你还有一段没练熟。',
      },
    ],
    options: [
      {
        id: 'opt_persist',
        text: '咬牙继续',
        visibleText: '坚持',
        setFlag: 'day23_persist',
        effect: { stage: 2, mood: -3 },
        nextScene: 'day23_night',
      },
      {
        id: 'opt_rest',
        text: '回去休息',
        visibleText: '休息',
        effect: { stage: 1, mood: 2 },
        nextScene: 'day23_night',
      },
    ],
  },

  day23_night: {
    id: 'day23_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你回到宿舍，瘫在床上。',
      },
      {
        type: 'narration',
        text: '还有 7 天。你能撑住。',
      },
    ],
    onEnter: {
      setFlags: ['day23_complete'],
    },
    autoNext: 'day24_morning',
  },
}
