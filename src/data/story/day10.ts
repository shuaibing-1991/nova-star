/**
 * Day 10 剧情：第一次争议
 * 详见 [[../../../05-Day1-30剧情大纲#Day 10：第一次争议]]
 *
 * 第一次被误解：练习生第一次危机
 * 触发 flag: controversy_survivor（化解争议）
 */
import type { Scene } from '@/types'

export const day10Scenes: Record<string, Scene> = {
  day10_morning: {
    id: 'day10_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '早上 8 点，手机被震醒。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你昨天的采访被人断章取义了。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '热搜第 9：LUMINA 成员疑似"卖惨"。',
      },
    ],
    onEnter: {
      modifyStats: { mood: -10, followers: -300 },
    },
    autoNext: 'day10_panic',
  },

  day10_panic: {
    id: 'day10_panic',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你点开微博：',
      },
      {
        type: 'narration',
        text: '「还没出道就卖惨？内娱真的够了」',
      },
      {
        type: 'narration',
        text: '「这种没作品的练习生凭什么红」',
      },
    ],
    autoNext: 'day10_emergency',
  },

  day10_emergency: {
    id: 'day10_emergency',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '下午 3 点，紧急会议。一楼会议室。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '无论他们怎么吵，你都不能下场。',
      },
    ],
    autoNext: 'day10_meeting',
  },

  day10_meeting: {
    id: 'day10_meeting',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '会议室里气氛很沉。韩知恩、林夏、周砚、许嘉树都在。',
      },
      {
        type: 'narration',
        text: '韩知恩：「现在有三个方案。说说你的想法。」',
      },
    ],
    options: [
      {
        id: 'opt_silent',
        text: '「我听公司的。」',
        visibleText: '完全沉默',
        setFlag: 'day10_silent',
        effect: { mood: -2, trust: 2 },
        nextScene: 'day10_response',
      },
      {
        id: 'opt_apologize',
        text: '「发一条道歉微博，是我说得不够好。」',
        visibleText: '主动承担责任',
        setFlag: 'day10_apologize',
        effect: { mood: -1, trust: 3 },
        nextScene: 'day10_response',
      },
      {
        id: 'opt_truth',
        text: '「能不能放出完整采访视频，让大家看到原话？」',
        visibleText: '用事实说话',
        setFlag: 'day10_truth',
        effect: { mood: 1, trust: 4, followers: 200 },
        nextScene: 'day10_response',
      },
    ],
  },

  day10_response: {
    id: 'day10_response',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '好，按你说的做。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '24 小时之内会有结果。',
      },
    ],
    autoNext: 'day10_evening',
  },

  day10_evening: {
    id: 'day10_evening',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，微博发酵。',
      },
      {
        type: 'narration',
        text: '但完整视频出来后，舆论开始反转。',
      },
      {
        type: 'narration',
        text: '你看到一句话：「这姑娘说话挺真的，路转粉。」',
      },
    ],
    onEnter: {
      modifyStats: { mood: 6, followers: 800, trust: 3 },
      modifyRelationship: { han_zhi_en: { affection: 5 } },
      setFlags: ['day10_complete', 'controversy_survived'],
      unlockAchievements: ['controversy_survivor'],
    },
    autoNext: 'day11_morning',
  },
}
