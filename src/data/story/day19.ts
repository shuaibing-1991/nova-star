/**
 * Day 19 剧情：暗流涌动
 * 详见 [[../../../05-Day1-30剧情大纲#Day 19：暗流涌动]]
 *
 * 团队关系的暗线：周砚和沈遥
 * 触发 flag: interested_in_zhou_yan（隐藏结局必需）
 */
import type { Scene } from '@/types'

export const day19Scenes: Record<string, Scene> = {
  day19_morning: {
    id: 'day19_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午训练时，你注意到周砚和沈遥之间气氛不对。',
      },
      {
        type: 'narration',
        text: '两人没说话。',
      },
    ],
    autoNext: 'day19_argue',
  },

  day19_argue: {
    id: 'day19_argue',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '中午，你经过练习室，听见里面在吵架。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '你的歌太软了，跟 LUMINA 的方向不符。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '但 Showcase 我想用这首。',
      },
    ],
    autoNext: 'day19_choice',
  },

  day19_choice: {
    id: 'day19_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '你站在门口，犹豫要不要推门。',
      },
    ],
    options: [
      {
        id: 'opt_step_in',
        text: '敲门进去',
        visibleText: '介入',
        setFlag: 'day19_step_in',
        effect: {
          modifyRelationship: {
            zhou_yan: { affection: 3 },
            shen_yao: { affection: 2 },
          },
        },
        nextScene: 'day19_mediate',
      },
      {
        id: 'opt_observe',
        text: '在门口听一会儿',
        visibleText: '观察',
        setFlag: 'day19_observe',
        nextScene: 'day19_mediate',
      },
      {
        id: 'opt_leave',
        text: '不介入，悄悄离开',
        visibleText: '不介入',
        nextScene: 'day19_mediate',
      },
    ],
  },

  day19_mediate: {
    id: 'day19_mediate',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '（发现你）……你怎么在这里？',
      },
    ],
    autoNext: 'day19_talk',
  },

  day19_talk: {
    id: 'day19_talk',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '两个队友都看着你。',
      },
    ],
    options: [
      {
        id: 'opt_curious',
        text: '「周砚，你好像对沈遥的歌很在意？」',
        visibleText: '对周砚好奇',
        setFlag: 'interested_in_zhou_yan',
        effect: {
          modifyRelationship: { zhou_yan: { affection: 5 } },
        },
        unlockAchievements: ['bond_zhou_yan'],
        nextScene: 'day19_night',
      },
      {
        id: 'opt_neutral',
        text: '「你们自己聊，我不打扰了。」',
        visibleText: '中立地离开',
        effect: { mood: -1 },
        nextScene: 'day19_night',
      },
    ],
  },

  day19_night: {
    id: 'day19_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '夜里，你回想白天那一幕。',
      },
      {
        type: 'narration',
        text: '周砚说沈遥的歌"软"——她为什么这么在意？',
      },
    ],
    onEnter: {
      setFlags: ['day19_complete'],
    },
    autoNext: 'day20_morning',
  },
}
