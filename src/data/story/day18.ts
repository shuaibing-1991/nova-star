/**
 * Day 18 剧情：第一次认可
 * 详见 [[../../../05-Day1-30剧情大纲#Day 18：第一次认可]]
 *
 * 被外界认可
 */
import type { Scene } from '@/types'

export const day18Scenes: Record<string, Scene> = {
  day18_morning: {
    id: 'day18_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '早上，一条新闻在练习生群里炸开。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '「NOVA 新人纪录片片段全网播放破 1000 万」',
      },
    ],
    onEnter: {
      modifyStats: { followers: 3000, mood: 8, trust: 2 },
    },
    autoNext: 'day18_noon',
  },

  day18_noon: {
    id: 'day18_noon',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '中午，练习生群里都在传一个截图：',
      },
      {
        type: 'narration',
        text: '「LUMINA 纪录片里的那个女孩是谁？感觉是那种不抢戏但会留住的类型」',
      },
    ],
    autoNext: 'day18_han',
  },

  day18_han: {
    id: 'day18_han',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你今天的状态，比昨天好很多。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '别被数字冲昏头，但今天可以对自己好一点。',
      },
    ],
    onEnter: {
      modifyRelationship: { han_zhi_en: { affection: 3 } },
    },
    autoNext: 'day18_share',
  },

  day18_share: {
    id: 'day18_share',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '晚上，许嘉树拉你一起发一条庆祝的微博。',
      },
    ],
    options: [
      {
        id: 'opt_team',
        text: '「感谢团队，没有他们就没有今天的我。」',
        visibleText: '把功劳给团队',
        setFlag: 'day18_team',
        effect: { mood: 5, followers: 200 },
        nextScene: 'day18_night',
      },
      {
        id: 'opt_humble',
        text: '「继续努力。」',
        visibleText: '低调',
        effect: { mood: 2 },
        nextScene: 'day18_night',
      },
    ],
  },

  day18_night: {
    id: 'day18_night',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '深夜，你对着镜子笑了。',
      },
      {
        type: 'narration',
        text: '这可能是你练习以来最满足的一个晚上。',
      },
    ],
    onEnter: {
      setFlags: ['day18_complete'],
    },
    autoNext: 'day19_morning',
  },
}
