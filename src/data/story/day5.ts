/**
 * Day 5 剧情：场外指导
 * 详见 [[../../../05-Day1-30剧情大纲#Day 5：场外指导]]
 */
import type { Scene } from '@/types'

export const day5Scenes: Record<string, Scene> = {
  day5_morning: {
    id: 'day5_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '林夏约你下午 3 点到附近的咖啡馆。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '想跟你聊聊，不带工作目的。',
      },
    ],
    autoNext: 'day5_cafe',
  },

  day5_cafe: {
    id: 'day5_cafe',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '咖啡馆很安静，林夏点了两杯美式。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '你知道吗，我当年也是练习生。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '最后因为伤病，没能站上舞台。',
      },
    ],
    autoNext: 'day5_lin_xia_choice',
  },

  day5_lin_xia_choice: {
    id: 'day5_lin_xia_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '林夏看着你的眼睛，等待你的反应。',
      },
    ],
    options: [
      {
        id: 'opt_ask',
        text: '「那你为什么还留在这个行业？」',
        visibleText: '真诚提问',
        setFlag: 'day5_curious',
        effect: { mood: 2 },
        nextScene: 'day5_lin_xia_response',
      },
      {
        id: 'opt_comfort',
        text: '「抱歉……那一定很难受。」',
        visibleText: '表达共情',
        setFlag: 'day5_empathy',
        effect: { mood: 3 },
        nextScene: 'day5_lin_xia_response',
      },
      {
        id: 'opt_silent',
        text: '沉默，等她继续说',
        visibleText: '倾听优先',
        setFlag: 'day5_listener',
        effect: { mood: 1 },
        nextScene: 'day5_lin_xia_response',
      },
    ],
  },

  day5_lin_xia_response: {
    id: 'day5_lin_xia_response',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '因为站在边上，看着别人发光，也很美好。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '而且，我想保护那个还在坚持的自己。',
      },
    ],
    onEnter: {
      modifyRelationship: { lin_xia: { affection: 8, affinity: 5 } },
    },
    autoNext: 'day5_back_dorm',
  },

  day5_back_dorm: {
    id: 'day5_back_dorm',
    type: 'narration',
    trigger: {
      day: 5,
      conditions: [
        // 通过活动 train_vocal 触发
      ],
    },
    content: [
      {
        type: 'narration',
        text: '晚上回到宿舍，你把林夏的话分享给了沈遥。',
      },
      {
        type: 'narration',
        text: '沈遥沉默了一会：「我想把它写成歌词。」',
      },
    ],
    onEnter: {
      // 阶段 6 修复：移除错位的 deep_listen
      // 隐藏结局所需的 deep_listen 必须在 day25 才能解锁（详见 day25.ts）
      setFlags: ['day5_complete', 'lin_xia_chat'],
    },
    autoNext: 'day6_morning',
  },
}