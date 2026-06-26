/**
 * Day 13 剧情：节奏乱了
 * 详见 [[../../../05-Day1-30剧情大纲#Day 13：节奏乱了]]
 *
 * 训练压力的第一次总爆发
 * 触发 flag: self_doubt_2（心理独白）
 */
import type { Scene } from '@/types'

export const day13Scenes: Record<string, Scene> = {
  day13_morning: {
    id: 'day13_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '昨晚的深度对话让你睡眠不足。',
      },
      {
        type: 'narration',
        text: '早上的声乐训练，你的高音开始发虚。',
      },
    ],
    onEnter: {
      modifyStats: { mood: -3 },
    },
    autoNext: 'day13_criticism',
  },

  day13_criticism: {
    id: 'day13_criticism',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '下午合练时，周砚停下了动作。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '你今天怎么回事？',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '节奏一直拖后腿，我们练不下去了。',
      },
    ],
    autoNext: 'day13_choice',
  },

  day13_choice: {
    id: 'day13_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '全队都在看你。',
      },
    ],
    options: [
      {
        id: 'opt_fight',
        text: '「我状态不好，是我的问题。但你也不用这么说。」',
        visibleText: '当面反驳',
        setFlag: 'day13_fight',
        effect: { mood: -2 },
        nextScene: 'day13_alone',
      },
      {
        id: 'opt_silent',
        text: '「……我知道了。」',
        visibleText: '沉默接受',
        setFlag: 'day13_silent',
        effect: { mood: -3 },
        nextScene: 'day13_alone',
      },
      {
        id: 'opt_ask',
        text: '「你能再演示一次吗？我想跟你的节奏。」',
        visibleText: '请求指导',
        effect: { mood: -1, dance: 2 },
        nextScene: 'day13_alone',
      },
    ],
  },

  day13_alone: {
    id: 'day13_alone',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，训练室只剩你一个人。',
      },
      {
        type: 'narration',
        text: '你对着镜子反复练那段舞。',
      },
      {
        type: 'narration',
        text: '「……我真的适合这里吗？」',
      },
    ],
    onEnter: {
      modifyStats: { mood: -2, dance: 1, vocal: 1 },
      setFlags: ['day13_complete', 'self_doubt_2'],
    },
    autoNext: 'day14_morning',
  },
}
