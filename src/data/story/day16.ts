/**
 * Day 16 剧情：低谷
 * 详见 [[../../../05-Day1-30剧情大纲#Day 16：低谷]]
 *
 * 第一次真正的低谷
 */
import type { Scene } from '@/types'

export const day16Scenes: Record<string, Scene> = {
  day16_morning: {
    id: 'day16_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '昨晚的焦虑让你没睡好。',
      },
      {
        type: 'narration',
        text: '声乐训练时连续破音。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：morning -5（−8→−5），vocal -1（−2→−1）
      modifyStats: { mood: -5, vocal: -1 },
    },
    autoNext: 'day16_critic',
  },

  day16_critic: {
    id: 'day16_critic',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你的状态不对。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '如果 Showcase 前一直这样，公司需要考虑 B 方案。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：critic -3 mood（−5→−3），trust -2（−3→−2）
      modifyStats: { mood: -3, trust: -2 },
    },
    autoNext: 'day16_evening',
  },

  day16_evening: {
    id: 'day16_evening',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你回到宿舍，躲进被子里。',
      },
      {
        type: 'narration',
        text: '「B 方案」。',
      },
      {
        type: 'narration',
        text: '那意味着你可能上不了 Showcase。',
      },
    ],
    onEnter: {
      // 阶段 6 修复：evening mood -5（−10→−5）
      modifyStats: { mood: -5 },
    },
    autoNext: 'day16_choice',
  },

  day16_choice: {
    id: 'day16_choice',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '你盯着手机，犹豫着要不要找人说话。',
      },
    ],
    options: [
      {
        id: 'opt_xu',
        text: '给许嘉树发消息',
        visibleText: '找许嘉树',
        // 阶段 6 修复：bond_xu_jia_shu 只在选择此路径时解锁
        effect: {
          mood: 3,
          modifyRelationship: { xu_jia_shu: { affection: 5 } },
        },
        unlockAchievements: ['bond_xu_jia_shu'],
        nextScene: 'day17_morning',
      },
      {
        id: 'opt_alone',
        text: '自己消化',
        visibleText: '一个人扛',
        setFlag: 'day16_alone',
        effect: { mood: -3 },
        nextScene: 'day17_morning',
      },
      {
        id: 'opt_shen',
        text: '去练习室找沈遥',
        visibleText: '找沈遥',
        effect: {
          mood: 5,
          modifyRelationship: { shen_yao: { affection: 3 } },
        },
        nextScene: 'day17_morning',
      },
    ],
  },
}
