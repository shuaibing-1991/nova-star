/**
 * Day 1 剧情数据（开场日）
 * 详见 [[../../../05-Day1-30剧情大纲#Day 1：开机日]]
 */
import type { Scene } from '@/types'

export const day1Scenes: Record<string, Scene> = {
  opening_intro: {
    id: 'opening_intro',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '世界上有一种幻象，叫做「那个闪着光的人」。',
        duration: 2000,
      },
      {
        type: 'narration',
        text: '你，曾经以为自己永远站在台下。',
        duration: 2000,
      },
    ],
    autoNext: 'opening_phone_unbox',
  },

  opening_phone_unbox: {
    id: 'opening_phone_unbox',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '直到今天，你拿到了一部白色的工作手机。',
        duration: 2500,
      },
      {
        type: 'narration',
        text: '手机壳背面印着「NOVA STUDIO」的字样。',
        duration: 2000,
      },
      {
        type: 'narration',
        text: '屏幕亮起——',
        duration: 1500,
      },
    ],
    autoNext: 'opening_first_message',
  },

  opening_first_message: {
    id: 'opening_first_message',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '你好，我是林夏，你的新经纪人助理。',
        duration: 1000,
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '从今天起，由我负责对接你练习期间的日常事务。',
        duration: 1500,
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '有任何问题都可以直接微信找我。',
        duration: 1200,
      },
    ],
    autoNext: 'opening_first_choice',
  },

  opening_first_choice: {
    id: 'opening_first_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '林夏的态度很温和，但你能感觉到她的试探。',
      },
    ],
    options: [
      {
        id: 'opt_polite',
        text: '好的，谢谢林夏姐。',
        visibleText: '对方温柔但保持职业距离',
        setFlag: 'opening_polite',
        effect: { mood: 3, trust: 2 },
        nextScene: 'opening_response_polite',
      },
      {
        id: 'opt_warm',
        text: '叫我小名就好~',
        visibleText: '快速建立亲近感',
        setFlag: 'opening_warm',
        effect: { mood: 5, trust: 1 },
        nextScene: 'opening_response_warm',
      },
      {
        id: 'opt_curious',
        text: '我什么时候能见到其他人？',
        visibleText: '展现出对外界的兴趣',
        setFlag: 'opening_curious',
        effect: { mood: 2, trust: 3 },
        nextScene: 'opening_response_curious',
      },
    ],
  },

  opening_response_polite: {
    id: 'opening_response_polite',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '嗯，是个懂礼貌的孩子。',
      },
      {
        type: 'narration',
        text: '林夏的语气里多了一分认可。',
      },
    ],
    autoNext: 'opening_to_dorm',
  },

  opening_response_warm: {
    id: 'opening_response_warm',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '哎？那我可就当真了。',
      },
      {
        type: 'narration',
        text: '林夏笑了，气氛轻松了一些。',
      },
    ],
    autoNext: 'opening_to_dorm',
  },

  opening_response_curious: {
    id: 'opening_response_curious',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '很快，明天就能见到你的导师了。',
      },
      {
        type: 'narration',
        text: '你的心跳加快了一拍。',
      },
    ],
    autoNext: 'opening_to_dorm',
  },

  opening_to_dorm: {
    id: 'opening_to_dorm',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你提着行李来到 NOVA STUDIO 的练习生宿舍。',
      },
      {
        type: 'narration',
        text: '房间不大，但五脏俱全。窗外是城市的夜景。',
      },
    ],
    autoNext: 'day1_evening_msg',
  },

  day1_evening_msg: {
    id: 'day1_evening_msg',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '明天早上 9 点来三楼练习室。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '我是韩知恩，会负责你的声乐和舞台基础训练。',
      },
    ],
    autoNext: 'day1_sleep',
  },

  day1_sleep: {
    id: 'day1_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你关掉手机，躺在陌生的床上。',
      },
      {
        type: 'narration',
        text: '明天，就是新的开始。',
      },
    ],
    onEnter: {
      setFlags: ['day1_complete', 'nervous_first_meeting'],
      unlockAchievement: 'first_day',
      unlockAchievements: ['bond_han_zhi_en'],
    },
    autoNext: 'day2_morning',
  },

  // Day 2 开始（占位）
  day2_morning: {
    id: 'day2_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: 'Day 2 的剧情将在阶段 5 完整填充。',
      },
    ],
  },
}