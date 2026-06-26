/**
 * Day 7 剧情：第一次 Showcase
 * 详见 [[../../../05-Day1-30剧情大纲#Day 7：第一次内部 Showcase]]
 */
import type { Scene } from '@/types'

export const day7Scenes: Record<string, Scene> = {
  day7_morning: {
    id: 'day7_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '今天是内部 Showcase。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '今天的表现，公司高层都会看到。',
      },
    ],
    autoNext: 'day7_rehearsal',
  },

  day7_rehearsal: {
    id: 'day7_rehearsal',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '上午最后一次彩排。',
      },
      {
        type: 'narration',
        text: '你感觉心跳很快，但动作很稳。',
      },
    ],
    autoNext: 'day7_showcase_start',
  },

  day7_showcase_start: {
    id: 'day7_showcase_start',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '下午 5 点，舞台灯光亮起。',
      },
      {
        type: 'narration',
        text: '台下坐着 20 个公司高层和工作人员。',
      },
    ],
    autoNext: 'day7_showcase_perform',
  },

  day7_showcase_perform: {
    id: 'day7_showcase_perform',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '副歌段你有一个独舞的窗口。怎么呈现？',
      },
    ],
    options: [
      {
        id: 'opt_clean',
        text: '干净利落，不出错',
        visibleText: '稳为主',
        effect: { stage: 5, trust: 3 },
        nextScene: 'day7_showcase_finish',
      },
      {
        id: 'opt_risk',
        text: '挑战高难度（难度+30%，效果+30%）',
        visibleText: '高风险高回报',
        effect: { stage: 8, mood: -3 },
        nextScene: 'day7_showcase_finish',
      },
      {
        id: 'opt_emotion',
        text: '主打情感，用表情讲故事',
        visibleText: '扬长避短',
        effect: { stage: 6, mood: 2 },
        setFlag: 'day7_emotional_performance',
        nextScene: 'day7_showcase_finish',
      },
    ],
  },

  day7_showcase_finish: {
    id: 'day7_showcase_finish',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '最后一个音符落下，台下响起了掌声。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '干得不错。先下去休息，等会儿有复盘。',
      },
    ],
    onEnter: {
      modifyStats: { stage: 4, mood: 5 },
    },
    autoNext: 'day7_review',
  },

  day7_review: {
    id: 'day7_review',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '韩知恩把你单独叫到办公室。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '你今天超出了我的预期。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '接下来一个月，是真正的考验。',
      },
    ],
    autoNext: 'day7_celebrate',
  },

  day7_celebrate: {
    id: 'day7_celebrate',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '晚上，许嘉树拉着全队去便利店买雪糕庆祝。',
      },
      {
        type: 'narration',
        text: '周砚难得没板着脸：「这周辛苦了。」',
      },
    ],
    onEnter: {
      modifyStats: { mood: 10 },
      modifyRelationship: { zhou_yan: { affection: 8 }, xu_jia_shu: { affection: 6 } },
    },
    autoNext: 'day7_sleep',
  },

  day7_sleep: {
    id: 'day7_sleep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '你躺在床上，想象着 Day 30 的样子。',
      },
      {
        type: 'narration',
        text: '第一周，结束了。',
      },
    ],
    onEnter: {
      setFlags: ['day7_complete', 'showcase_complete'],
      unlockAchievement: 'first_showcase',
      unlockAchievements: ['week1_survivor'],
    },
    // 阶段 5：Day 7 收尾进入 ending_success（完成 Showcase）
    autoNext: 'ending_success',
  },
}