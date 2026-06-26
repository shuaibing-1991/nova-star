/**
 * Day 12 剧情：创作的力量
 * 详见 [[../../../05-Day1-30剧情大纲#Day 12：创作的力量]]
 *
 * 沈遥的原创 demo（关键羁绊节点）
 * 触发 flag: praised_shen_yao（隐藏结局必需）
 */
import type { Scene } from '@/types'

export const day12Scenes: Record<string, Scene> = {
  day12_morning: {
    id: 'day12_morning',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '早上 6 点 50，沈遥已经在练习室了。',
      },
      {
        type: 'narration',
        text: '他戴着耳机，没开灯。',
      },
    ],
    autoNext: 'day12_demo',
  },

  day12_demo: {
    id: 'day12_demo',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '你来得挺早。',
      },
      {
        type: 'narration',
        text: '他摘下耳机，把一边递给你。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '这是我写的 demo，还没给别人听过。',
      },
    ],
    autoNext: 'day12_listen',
  },

  day12_listen: {
    id: 'day12_listen',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '耳机里传来一段旋律，比他平时在团里唱的都柔软。',
      },
    ],
    options: [
      {
        id: 'opt_sincere',
        text: '「副歌那段，你是在写自己吧。」',
        visibleText: '真诚地反馈',
        setFlag: 'praised_shen_yao',
        effect: { mood: 3 },
        unlockAchievements: ['shen_yao_song', 'bond_shen_yao'],
        nextScene: 'day12_response',
      },
      {
        id: 'opt_tech',
        text: '「音准很好，但编曲可以更现代一点。」',
        visibleText: '技术反馈',
        effect: { mood: 1 },
        nextScene: 'day12_response',
      },
      {
        id: 'polite',
        text: '「挺好的。」',
        visibleText: '礼貌但空洞',
        effect: { mood: 0 },
        nextScene: 'day12_response',
      },
    ],
  },

  day12_response: {
    id: 'day12_response',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '你是第一个听出来的。',
      },
      {
        type: 'narration',
        text: '他笑了，那种不设防的笑。',
      },
    ],
    onEnter: {
      modifyRelationship: { shen_yao: { affection: 10 } },
    },
    autoNext: 'day12_practice',
  },

  day12_practice: {
    id: 'day12_practice',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '下午，团队开始练新歌。',
      },
      {
        type: 'narration',
        text: '你比平时更卖力，像是想要回应什么。',
      },
    ],
    onEnter: {
      modifyStats: { vocal: 2, dance: 1 },
    },
    autoNext: 'day12_night',
  },

  day12_night: {
    id: 'day12_night',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '深夜，沈遥敲响你的房门。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: '今天的事，谢谢你。',
      },
      {
        type: 'npc_speak',
        npcId: 'shen_yao',
        text: 'Showcase 那天，我想用这首歌。',
      },
    ],
    onEnter: {
      modifyRelationship: { shen_yao: { affection: 5 } },
      setFlags: ['day12_complete'],
    },
    autoNext: 'day13_morning',
  },
}
