/**
 * Day 26 剧情：和解
 * 详见 [[../../../05-Day1-30剧情大纲#Day 26：和解]]
 *
 * 周砚和沈遥的冲突 + 团队和解
 */
import type { Scene } from '@/types'

export const day26Scenes: Record<string, Scene> = {
  day26_morning: {
    id: 'day26_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午，你经过练习室，听见周砚和沈遥又在争执。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '你以为我反对是因为不喜欢你的歌？',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '我是怕你唱这首歌，会把自己撕开。',
      },
    ],
    autoNext: 'day26_choice',
  },

  day26_choice: {
    id: 'day26_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '门突然被推开。',
      },
    ],
    options: [
      {
        id: 'opt_truth',
        text: '「你们两个都关心对方，为什么不直说？」',
        visibleText: '说出真相',
        setFlag: 'day26_truth',
        effect: { modifyRelationship: { zhou_yan: { affection: 8 }, shen_yao: { affection: 8 } }, mood: 5 },
        nextScene: 'day26_team',
      },
      {
        id: 'opt_calm',
        text: '「我们 4 天后就要 Showcase 了。」',
        visibleText: '冷静提醒',
        effect: { modifyRelationship: { zhou_yan: { affection: 2 }, shen_yao: { affection: 2 } } },
        nextScene: 'day26_team',
      },
    ],
  },

  day26_team: {
    id: 'day26_team',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '周砚和沈遥对视。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '……我以为你不喜欢我。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '……我以为你不在乎团。',
      },
    ],
    onEnter: {
      modifyRelationship: {
        zhou_yan: { affection: 5 },
        shen_yao: { affection: 5 },
      },
    },
    autoNext: 'day26_dinner',
  },

  day26_dinner: {
    id: 'day26_dinner',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，五个人围在一起吃饭。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '这次我们真的要一起上去了。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 10 },
      modifyRelationship: { xu_jia_shu: { affection: 3 } },
      setFlags: ['day26_complete', 'team_reconciled'],
    },
    autoNext: 'day27_morning',
  },
}
