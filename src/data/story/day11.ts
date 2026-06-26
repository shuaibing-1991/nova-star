/**
 * Day 11 剧情：风波过后
 * 详见 [[../../../05-Day1-30剧情大纲#Day 11：风波过后]]
 *
 * 学会面对争议
 */
import type { Scene } from '@/types'

export const day11Scenes: Record<string, Scene> = {
  day11_morning: {
    id: 'day11_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '昨天的处理，我给你打 8 分。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '但下次，别给媒体太多"素材"。',
      },
    ],
    onEnter: {
      modifyStats: { trust: 3, mood: 2 },
    },
    autoNext: 'day11_truth',
  },

  day11_truth: {
    id: 'day11_truth',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '韩知恩靠在沙发上，第一次跟你说了一些行业的事。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '这个行业，80% 的练习生撑不过第一年。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '留下来的，要么是真有实力，要么是真的熬得住。',
      },
    ],
    onEnter: {
      modifyRelationship: { han_zhi_en: { affection: 4 } },
    },
    autoNext: 'day11_choice',
  },

  day11_choice: {
    id: 'day11_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '下午，林夏建议你写一条微博给昨天支持你的粉丝。',
      },
    ],
    options: [
      {
        id: 'opt_thanks',
        text: '「谢谢昨天为我说话的人。我会记住的。」',
        visibleText: '简短感谢',
        setFlag: 'day11_thanks',
        effect: { mood: 3, followers: 150 },
        nextScene: 'day11_evening',
      },
      {
        id: 'opt_share',
        text: '「昨天一整天没睡好。流量是把刀，能伤人也保护人。」',
        visibleText: '分享真实感受',
        setFlag: 'day11_share',
        effect: { mood: 4, followers: 300, trust: 1 },
        nextScene: 'day11_evening',
      },
    ],
  },

  day11_evening: {
    id: 'day11_evening',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '傍晚，周砚第一次主动找你说话。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '昨天的事，你处理得不错。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '但下次，先跟我通个气。',
      },
    ],
    onEnter: {
      modifyRelationship: { zhou_yan: { affection: 5 } },
      setFlags: ['day11_complete'],
    },
    autoNext: 'day12_morning',
  },
}
