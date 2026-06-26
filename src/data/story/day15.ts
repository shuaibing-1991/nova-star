/**
 * Day 15 剧情：行业剧变
 * 详见 [[../../../05-Day1-30剧情大纲#Day 15：行业剧变]]
 *
 * 第一次经历娱乐圈的"地震"
 */
import type { Scene } from '@/types'

export const day15Scenes: Record<string, Scene> = {
  day15_morning: {
    id: 'day15_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '凌晨 3 点，手机震醒你。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '出大事了。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '行业头部经纪公司「星耀」突然宣布破产，旗下 12 个艺人解约。',
      },
    ],
    onEnter: {
      modifyStats: { mood: -5 },
    },
    autoNext: 'day15_chaos',
  },

  day15_chaos: {
    id: 'day15_chaos',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '早上，NOVA STUDIO 紧急停课。',
      },
      {
        type: 'narration',
        text: '练习生群里消息爆了。',
      },
      {
        type: 'narration',
        text: '「我们公司会不会也出事？」',
      },
    ],
    autoNext: 'day15_meeting',
  },

  day15_meeting: {
    id: 'day15_meeting',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '我们的合作方有几个会受影响。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: 'Showcase 会照常准备，但可能延期。',
      },
    ],
    autoNext: 'day15_choice',
  },

  day15_choice: {
    id: 'day15_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '林夏找你私下谈话。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '「这种事，每隔几年就会有一次。你需要学会不被它带着跑。」',
      },
    ],
    options: [
      {
        id: 'opt_focus',
        text: '「Showcase 之前我们能做的只有一件事：练。」',
        visibleText: '保持专注',
        setFlag: 'day15_focus',
        effect: { mood: 3, trust: 2 },
        nextScene: 'day15_evening',
      },
      {
        id: 'opt_anxious',
        text: '「我们真的会没事吗？」',
        visibleText: '表达焦虑',
        effect: { mood: -2 },
        nextScene: 'day15_evening',
      },
    ],
  },

  day15_evening: {
    id: 'day15_evening',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '还有 15 天。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '不管外面怎么变，你只管好你自己的事。',
      },
    ],
    onEnter: {
      modifyRelationship: { lin_xia: { affection: 5 } },
      setFlags: ['day15_complete'],
    },
    autoNext: 'day16_morning',
  },
}
