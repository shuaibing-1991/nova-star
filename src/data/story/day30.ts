/**
 * Day 30 剧情：出道 Showcase
 * 详见 [[../../../05-Day1-30剧情大纲#Day 30：出道 Showcase]]
 *
 * 30 天的总高潮
 *
 * 关键：
 * - day30_ending 是结局评估器入口（详见 engine.ts）
 * - 根据 stats + relationships + flags 动态判断 4 个结局之一
 */
import type { Scene } from '@/types'

export const day30Scenes: Record<string, Scene> = {
  day30_morning: {
    id: 'day30_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天，你的舞台。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5 },
    },
    autoNext: 'day30_styling',
  },

  day30_styling: {
    id: 'day30_styling',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午 3 点，最后的造型。',
      },
      {
        type: 'narration',
        text: '化妆师的手很稳，但你的心跳在加速。',
      },
    ],
    autoNext: 'day30_rehearsal',
  },

  day30_rehearsal: {
    id: 'day30_rehearsal',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午 4 点，彩排。',
      },
      {
        type: 'narration',
        text: '你和队友站在舞台中央，看着空荡的观众席。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 3 },
    },
    autoNext: 'day30_fans',
  },

  day30_fans: {
    id: 'day30_fans',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '粉丝入场了。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '微博直播同时 12 万人在线。',
      },
    ],
    autoNext: 'day30_backstage',
  },

  day30_backstage: {
    id: 'day30_backstage',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '后台，灯光师喊：5 分钟。',
      },
    ],
    options: [
      {
        id: 'opt_alone',
        text: '独处 1 分钟',
        visibleText: '独处',
        setFlag: 'day30_alone',
        effect: { mood: 5, stage: 2 },
        nextScene: 'day30_perform',
      },
      {
        id: 'opt_team',
        text: '跟队友一起',
        visibleText: '跟队友',
        effect: {
          mood: 5,
          modifyRelationship: {
            xu_jia_shu: { affection: 3 },
            zhou_yan: { affection: 3 },
            shen_yao: { affection: 3 },
          },
        },
        nextScene: 'day30_perform',
      },
    ],
  },

  day30_perform: {
    id: 'day30_perform',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你听见台下的欢呼声。',
      },
      {
        type: 'narration',
        text: '舞台灯光亮起。',
      },
      {
        type: 'narration',
        text: '你迈出第一步。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：Showcase 现场粉丝暴涨 +10,000；stage 降为 +3
      modifyStats: { stage: 3, mood: 10, followers: 10000 },
    },
    autoNext: 'day30_climax',
  },

  day30_climax: {
    id: 'day30_climax',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '副歌段，沈遥的声音从话筒里出来。',
      },
      {
        type: 'narration',
        text: '你需要在那一刻做最后的呈现——',
      },
    ],
    options: [
      {
        id: 'opt_emotion',
        text: '把所有的情绪都唱出来',
        // 阶段 6 第 5 轮：visibleText 加 emoji + 副标题，区分度更高
        visibleText: '🎤 情绪爆发 / 让 30 天的心声共振',
        setFlag: 'day30_emotion',
        // 阶段 6 修复：粉丝暴涨 +20,000；stage 降为 +3
        effect: {
          modifyRelationship: { shen_yao: { affection: 5 } },
          stage: 3,
          mood: 5,
          followers: 20000,
        },
        nextScene: 'day30_ending',
      },
      {
        id: 'opt_clean',
        text: '保持稳定，一个音都不掉',
        // 阶段 6 第 5 轮：visibleText 加 emoji + 副标题
        visibleText: '🎯 稳定呈现 / 用专业回应 30 天的打磨',
        // 阶段 6 修复：稳定型同样有粉丝增量 +12,000；stage 降为 +2
        effect: { stage: 2, trust: 2, followers: 12000 },
        nextScene: 'day30_ending',
      },
    ],
  },

  day30_ending: {
    id: 'day30_ending',
    // 阶段 6 修复：type 改为 'ending'，由 engine 的 !nextId 分支触发
    // navigateToEnding('day30_ending')，evaluateEnding() 动态评估
    type: 'ending',
    content: [
      {
        type: 'narration',
        text: '最后一个音符落下。',
      },
      {
        type: 'narration',
        text: '台下响起了掌声。',
      },
      // 阶段 6 第 5 轮：增加过渡块（灯光渐暗 + 林夏递花），增强 30 天总高潮的仪式感
      {
        type: 'narration',
        text: '灯光渐暗，队友的喘息声还没平复。',
      },
      {
        type: 'narration',
        text: '林夏在侧台朝你笑了笑，手里捧着一束花。',
      },
      {
        type: 'narration',
        text: '30 天，结束了。',
      },
    ],
    onEnter: {
      setFlags: ['day30_complete', 'showcase_final_complete'],
    },
    // 阶段 6 修复：不再 autoNext 到 day30_final；用户点完 5 个文段后，
    // engine 的 advanceToNextScene 走到 !nextId 分支，调用 navigateToEnding
  },
}
