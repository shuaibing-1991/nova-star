/**
 * Day 9 剧情：粉丝初现
 * 详见 [[../../../05-Day1-30剧情大纲#Day 9：粉丝初现]]
 *
 * 第一次感受到粉丝的存在
 */
import type { Scene } from '@/types'

export const day9Scenes: Record<string, Scene> = {
  day9_morning: {
    id: 'day9_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '早上，林夏发来一张数据图。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '昨天的花絮带来了 3000 粉。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '记住每一个。',
      },
    ],
    onEnter: {
      modifyStats: { followers: 1500, mood: 3 },
    },
    autoNext: 'day9_noon',
  },

  day9_noon: {
    id: 'day9_noon',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '中午，许嘉树兴奋地冲进来。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '有粉丝给我们建了超话！',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '第一个留言是「希望 LUMINA 出道顺利」。',
      },
    ],
    autoNext: 'day9_fan_msg',
  },

  day9_fan_msg: {
    id: 'day9_fan_msg',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '林夏建议你在评论区回一条。',
      },
    ],
    options: [
      {
        id: 'opt_grateful',
        text: '「谢谢你们，我会努力的。」（礼貌但克制）',
        visibleText: '官方回复',
        setFlag: 'day9_grateful',
        effect: { mood: 2, followers: 80 },
        nextScene: 'day9_afternoon',
      },
      {
        id: 'opt_warm',
        text: '「看到你们的留言，眼睛有点酸。」（情感真实）',
        visibleText: '真实流露',
        setFlag: 'day9_warm',
        effect: { mood: 5, followers: 200 },
        nextScene: 'day9_afternoon',
      },
    ],
  },

  day9_afternoon: {
    id: 'day9_afternoon',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午的训练，你比平时更卖力。',
      },
      {
        type: 'narration',
        text: '周砚看你一眼，没说话，但似乎在打量。',
      },
    ],
    onEnter: {
      modifyStats: { dance: 2, vocal: 1 },
    },
    autoNext: 'day9_night',
  },

  day9_night: {
    id: 'day9_night',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '夜里 11 点，林夏的消息进来。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '突然被关注会让你觉得自己很重要，但要记住：',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '流量是双刃剑。',
      },
    ],
    onEnter: {
      modifyRelationship: { lin_xia: { affection: 2 } },
      setFlags: ['day9_complete'],
    },
    autoNext: 'day10_morning',
  },
}
