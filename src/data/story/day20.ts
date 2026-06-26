/**
 * Day 20 剧情：沈遥的歌
 * 详见 [[../../../05-Day1-30剧情大纲#Day 20：沈遥的歌]]
 *
 * 沈遥请你当 Showcase 选曲的第一个听众
 * 关键羁绊节点：真诚的反馈
 */
import type { Scene } from '@/types'

export const day20Scenes: Record<string, Scene> = {
  day20_morning: {
    id: 'day20_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: 'Showcase 选曲，我想用我那首。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '但你是第一个听我完整唱完的人。我想再唱给你听。',
      },
    ],
    autoNext: 'day20_sing',
  },

  day20_sing: {
    id: 'day20_sing',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '沈遥关掉所有灯，只留一盏小台灯。',
      },
      {
        type: 'narration',
        text: '他坐在练习室中央，闭着眼唱。',
      },
      {
        type: 'narration',
        text: '你从来没听过他这么认真地唱一首歌。',
      },
    ],
    autoNext: 'day20_choice',
  },

  day20_choice: {
    id: 'day20_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '他唱完后，睁开眼看着你。',
      },
    ],
    options: [
      {
        id: 'opt_sincere',
        text: '「这是写给一直在等的那个人的吧。」',
        visibleText: '说出你的理解',
        setFlag: 'day20_sincere',
        effect: { modifyRelationship: { shen_yao: { affection: 10 } }, mood: 5 },
        nextScene: 'day20_night',
      },
      {
        id: 'opt_praise',
        text: '「比上次那个版本更好。」',
        visibleText: '赞美',
        setFlag: 'day20_praise',
        effect: { modifyRelationship: { shen_yao: { affection: 5 } }, mood: 3 },
        nextScene: 'day20_night',
      },
      {
        id: 'opt_tech',
        text: '「副歌的转调再考虑一下。」',
        visibleText: '技术反馈',
        effect: { modifyRelationship: { shen_yao: { affection: 2 } } },
        nextScene: 'day20_night',
      },
    ],
  },

  day20_night: {
    id: 'day20_night',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: 'Showcase 那一天，',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '这首歌只为你唱。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 8 },
      modifyRelationship: { shen_yao: { affection: 8 } },
      setFlags: ['day20_complete'],
    },
    autoNext: 'day21_morning',
  },
}
