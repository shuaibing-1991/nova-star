/**
 * Day 2 剧情：合练第一天
 * 详见 [[../../../05-Day1-30剧情大纲#Day 2：合练第一天]]
 */
import type { Scene } from '@/types'

export const day2Scenes: Record<string, Scene> = {
  day2_morning_choice: {
    id: 'day2_morning_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '闹钟响了。新人第一天，你打算怎么去练习室？',
      },
    ],
    options: [
      {
        id: 'opt_early',
        text: '早到 30 分钟，熟悉环境',
        visibleText: '给自己缓冲，表现得从容',
        setFlag: 'day2_early',
        effect: { mood: 5, trust: 2 },
        nextScene: 'day2_rehearsal_start',
      },
      {
        id: 'opt_ontime',
        text: '准时 9 点到',
        visibleText: '不早不晚，稳妥',
        setFlag: 'day2_ontime',
        effect: { mood: 2 },
        nextScene: 'day2_rehearsal_start',
      },
      {
        id: 'opt_late',
        text: '睡过头，迟到了 10 分钟',
        visibleText: '昨晚太紧张没睡好',
        setFlag: 'day2_late',
        effect: { mood: -3, trust: -2 },
        nextScene: 'day2_rehearsal_start',
      },
    ],
  },

  day2_rehearsal_start: {
    id: 'day2_rehearsal_start',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '各位，今天开始合练。先跑一遍主题曲《Luminous》。',
      },
      {
        type: 'narration',
        text: '四个人站成一排，你悄悄打量队友。',
      },
    ],
    autoNext: 'day2_meet_zhou_yan',
  },

  day2_meet_zhou_yan: {
    id: 'day2_meet_zhou_yan',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '周砚站在你右边。她扫了你一眼，眼神有点冷。',
      },
    ],
    options: [
      {
        id: 'opt_greet',
        text: '主动打招呼「你好，我是……」（微笑）',
        visibleText: '展现主动性，可能被冷淡',
        setFlag: 'day2_warm_approach',
        effect: { mood: 1 },
        nextScene: 'day2_rehearsal_action',
      },
      {
        id: 'opt_smile',
        text: '点头示意但不说话',
        visibleText: '保持职业距离',
        nextScene: 'day2_rehearsal_action',
      },
      {
        id: 'opt_ignore',
        text: '假装没看见',
        visibleText: '避免尴尬',
        effect: { mood: -1 },
        nextScene: 'day2_rehearsal_action',
      },
    ],
  },

  day2_rehearsal_action: {
    id: 'day2_rehearsal_action',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '音乐响起，你跟了第一组动作。',
      },
      {
        type: 'narration',
        text: '副歌段你慢了半拍，但咬字还算清晰。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '停一下。副歌再来一遍，注意气息。',
      },
    ],
    onEnter: {
      modifyStats: { vocal: 2, dance: 2 },
    },
    autoNext: 'day2_lunch_break',
  },

  day2_lunch_break: {
    id: 'day2_lunch_break',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '中午休息，许嘉树端着饭坐到你旁边。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '你昨晚睡得好吗？我紧张到 3 点才睡着。',
      },
      {
        type: 'narration',
        text: '你笑了笑，气氛轻松了一点。',
      },
    ],
    onEnter: {
      modifyRelationship: { xu_jia_shu: { affection: 3 } },
    },
    autoNext: 'day2_meet_shen_yao',
  },

  day2_meet_shen_yao: {
    id: 'day2_meet_shen_yao',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '傍晚训练结束，你在练习室门口撞见了沈遥。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '你也是偷偷加练的吧？',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '我练了半小时，再累也要把基础打牢。',
      },
    ],
    onEnter: {
      modifyRelationship: { shen_yao: { affection: 2 } },
    },
    autoNext: 'day2_sleep',
  },

  day2_sleep: {
    id: 'day2_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你带着酸痛的肌肉躺回床上。',
      },
      {
        type: 'narration',
        text: '手机屏幕亮了一下——林夏发来一句：明天加油。',
      },
    ],
    onEnter: {
      setFlags: ['day2_complete'],
      unlockAchievement: 'first_rehearsal',
    },
    autoNext: 'day3_morning',
  },
}