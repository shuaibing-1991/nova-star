/**
 * Day 8 剧情：第一次出镜
 * 详见 [[../../../05-Day1-30剧情大纲#Day 8：第一次出镜]]
 *
 * 第二周开始：练习生第一次被外界看到
 */
import type { Scene } from '@/types'

export const day8Scenes: Record<string, Scene> = {
  day8_morning: {
    id: 'day8_morning',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '第二周。',
      },
      {
        type: 'narration',
        text: '今天，练习生纪录片摄制组要来了。',
      },
      {
        type: 'npc_speak',
        npcId: 'han_zhi_en',
        text: '记住，镜头前的你和练习室里的你，要一样。',
      },
    ],
    autoNext: 'day8_doc_prep',
  },

  day8_doc_prep: {
    id: 'day8_doc_prep',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '化妆师在你的眼角扫上淡淡的亮片。',
      },
      {
        type: 'narration',
        text: '你看着镜子里的自己：这就是我以后的样子吗？',
      },
    ],
    autoNext: 'day8_doc_shoot',
  },

  day8_doc_shoot: {
    id: 'day8_doc_shoot',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '导演让你对着镜头说一段"为什么想成为偶像"。',
      },
    ],
    options: [
      {
        id: 'opt_passion',
        text: '「因为我想被看见，也想看见更远的世界。」',
        visibleText: '表达热爱',
        setFlag: 'day8_passion',
        effect: { mood: 4, trust: 2 },
        nextScene: 'day8_doc_finish',
      },
      {
        id: 'opt_real',
        text: '「因为……我也说不清，我只是想试试。」',
        visibleText: '真实但缺乏表达',
        effect: { mood: 1 },
        nextScene: 'day8_doc_finish',
      },
      {
        id: 'opt_others',
        text: '「因为站在舞台上的那一刻，我感觉活着。」',
        visibleText: '突出个人感受',
        setFlag: 'day8_others',
        effect: { mood: 5, trust: 1 },
        nextScene: 'day8_doc_finish',
      },
    ],
  },

  day8_doc_finish: {
    id: 'day8_doc_finish',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '导演喊卡。「很好，收工。」',
      },
      {
        type: 'npc_speak',
        npcId: 'xu_jia_shu',
        text: '你刚才那个眼神，超有感觉的。',
      },
    ],
    onEnter: {
      modifyRelationship: { xu_jia_shu: { affection: 3 } },
    },
    autoNext: 'day8_interview',
  },

  day8_interview: {
    id: 'day8_interview',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '下午，娱乐记者来采访。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '提前准备几个故事点，别说太满。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 2 },
    },
    autoNext: 'day8_interview_q',
  },

  day8_interview_q: {
    id: 'day8_interview_q',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '记者问：「你觉得练习生最难的瞬间是什么？」',
      },
    ],
    options: [
      {
        id: 'opt_struggle',
        text: '「看不清自己还能不能继续的时候。」',
        visibleText: '说出真心话',
        setFlag: 'day8_struggle',
        effect: { mood: 3, trust: 3 },
        nextScene: 'day8_evening',
      },
      {
        id: 'opt_positive',
        text: '「每一次想放弃的时候。」',
        visibleText: '展示坚韧',
        effect: { mood: 1, trust: 1 },
        nextScene: 'day8_evening',
      },
    ],
  },

  day8_evening: {
    id: 'day8_evening',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '晚上，你打开 NOVA 的内部账号。',
      },
      {
        type: 'narration',
        text: '纪录片的花絮图已经发出去了。',
      },
      {
        type: 'narration',
        text: '评论区 23 条留言。这是第一次有人在不认识你的情况下，看到你。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5, followers: 50 },
      modifyRelationship: { lin_xia: { affection: 2 } },
      setFlags: ['day8_complete'],
    },
    autoNext: 'day9_morning',
  },
}
