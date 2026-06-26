/**
 * Day 3 剧情：第一次冲突
 * 详见 [[../../../05-Day1-30剧情大纲#Day 3：第一次冲突]]
 */
import type { Scene } from '@/types'

export const day3Scenes: Record<string, Scene> = {
  day3_morning: {
    id: 'day3_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '早上 7 点，周砚已经在练习室了。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '这个动作你昨天做错了 5 次，今天应该会了吧？',
      },
    ],
    autoNext: 'day3_conflict_choice',
  },

  day3_conflict_choice: {
    id: 'day3_conflict_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '你能感觉到周砚在故意挑刺。',
      },
    ],
    options: [
      {
        id: 'opt_confront',
        text: '直视她：「我会做好的，请看。」',
        visibleText: '直接对抗，展示决心',
        setFlag: 'day3_confront_zhou_yan',
        effect: { mood: -2 },
        nextScene: 'day3_practice',
      },
      {
        id: 'opt_stepback',
        text: '深呼吸，继续练习',
        visibleText: '以退为进',
        setFlag: 'day3_calm_response',
        effect: { mood: 1 },
        nextScene: 'day3_practice',
      },
      {
        id: 'opt_help',
        text: '「你能示范一下吗？」',
        visibleText: '化解为请教',
        setFlag: 'day3_ask_for_help',
        effect: { mood: 3 },
        nextScene: 'day3_practice',
      },
    ],
  },

  day3_practice: {
    id: 'day3_practice',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '你咬着牙，又练了 20 遍。',
      },
      {
        type: 'narration',
        text: '结束时，你的额头全是汗。',
      },
    ],
    onEnter: {
      modifyStats: { dance: 3, mood: -1 },
    },
    autoNext: 'day3_ceo_talk',
  },

  day3_ceo_talk: {
    id: 'day3_ceo_talk',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '下午，韩知恩叫你去走廊。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你和周砚的关系，怎么看？',
      },
    ],
    autoNext: 'day3_ceo_choice',
  },

  day3_ceo_choice: {
    id: 'day3_ceo_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '这是个微妙的提问。',
      },
    ],
    options: [
      {
        id: 'opt_complaint',
        text: '她总是针对我，有点受不了',
        visibleText: '发泄情绪',
        effect: { trust: -2 },
        nextScene: 'day3_ceo_response',
      },
      {
        id: 'opt_neutral',
        text: '还在磨合期，互相了解',
        visibleText: '成熟稳重',
        effect: { trust: 3 },
        setFlag: 'day3_mature_response',
        nextScene: 'day3_ceo_response',
      },
      {
        id: 'opt_reflect',
        text: '也许我也有让她不舒服的地方',
        visibleText: '深度反思',
        effect: { trust: 5 },
        setFlag: 'day3_self_reflection',
        nextScene: 'day3_ceo_response',
      },
    ],
  },

  day3_ceo_response: {
    id: 'day3_ceo_response',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '记住，出道不是一个人的事。',
      },
    ],
    autoNext: 'day3_night_shen_yao',
  },

  day3_night_shen_yao: {
    id: 'day3_night_shen_yao',
    type: 'dialogue',
    trigger: {
      day: 3,
      conditions: [
        // 通过活动 rest_fun 触发，无需额外条件
      ],
    },
    content: [
      {
        type: 'narration',
        text: '深夜 11 点，沈遥抱着笔记本坐到你旁边。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '我看你今天很拼。要不要听一首我刚写的歌？',
      },
    ],
    onEnter: {
      modifyRelationship: { shen_yao: { affection: 5 } },
    },
    autoNext: 'day3_sleep',
  },

  day3_sleep: {
    id: 'day3_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你躺在床上想：也许我真的不适合这里。',
      },
      {
        type: 'narration',
        text: '但沈遥的歌还在脑海里回响。',
      },
    ],
    onEnter: {
      setFlags: ['day3_complete', 'self_doubt_1'],
    },
    autoNext: 'day4_morning',
  },
}