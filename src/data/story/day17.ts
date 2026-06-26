/**
 * Day 17 剧情：治愈
 * 详见 [[../../../05-Day1-30剧情大纲#Day 17：治愈]]
 *
 * 团队的温暖（关键羁绊节点）
 * 触发 flag: warm_with_xu_jiashu（隐藏结局必需）
 * 解锁成就: healing_journey
 */
import type { Scene } from '@/types'

export const day17Scenes: Record<string, Scene> = {
  day17_morning: {
    id: 'day17_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '早上 7 点，你的门被轻轻推开。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '起来啦，我给你带了早餐。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '今天不练了，我陪你出去走走。',
      },
    ],
    autoNext: 'day17_walk',
  },

  day17_walk: {
    id: 'day17_walk',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '许嘉树带你去了公司附近的小公园。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '我刚进公司的时候，有一次连着哭了一周。',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '但你看，我现在还在。',
      },
    ],
    onEnter: {
      modifyRelationship: { xu_jia_shu: { affection: 8 } },
      setFlag: 'warm_with_xu_jiashu',
      // 阶段 6 修复：bond_xu_jia_shu 已在 day16 opt_xu 解锁
    },
    autoNext: 'day17_demo',
  },

  day17_demo: {
    id: 'day17_demo',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '下午，沈遥把他正在打磨的 demo 分享给你听。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '上次你说得对，副歌是写给自己的。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '这一版我加了一段，希望你能听出来。',
      },
    ],
    onEnter: {
      modifyRelationship: { shen_yao: { affection: 5 } },
      modifyStats: { mood: 5 },
    },
    autoNext: 'day17_movie',
  },

  day17_movie: {
    id: 'day17_movie',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，全队窝在宿舍客厅看老电影。',
      },
      {
        type: 'npc_speak',
        npcId: 'zhou_yan',
        text: '……',
      },
      {
        type: 'narration',
        text: '她没说别的，但给你递了杯热可可。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 8 },
      modifyRelationship: { zhou_yan: { affection: 4 } },
      setFlags: ['day17_complete', 'healed'],
      unlockAchievements: ['healing_journey'],
    },
    autoNext: 'day18_morning',
  },
}
