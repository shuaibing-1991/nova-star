/**
 * Day 25 剧情：真相
 * 详见 [[../../../05-Day1-30剧情大纲#Day 25：真相 ⭐]]
 *
 * 林夏揭示行业真相（隐藏结局关键节点）
 * 触发 flag: deep_listen（隐藏结局必需）
 * 解锁成就: lin_xia_trust, bond_lin_xia
 */
import type { Scene } from '@/types'

export const day25Scenes: Record<string, Scene> = {
  day25_morning: {
    id: 'day25_morning',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '今天下午，公司楼下咖啡馆。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '我想跟你聊聊。',
      },
    ],
    autoNext: 'day25_cafe',
  },

  day25_cafe: {
    id: 'day25_cafe',
    type: 'dialogue',
    content: [
      {
        type: 'narration',
        text: '咖啡馆里人很少。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '我做了 8 年经纪人助理。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '我见过太多人，出道前 3 个月放弃。',
      },
    ],
    autoNext: 'day25_truth',
  },

  day25_truth: {
    id: 'day25_truth',
    type: 'dialogue',
    content: [
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: 'Showcase 不只是公司的考核。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '它是你和自己 25 天前的对话。',
      },
      {
        type: 'npc_speak',
        npcId: 'lin_xia',
        text: '你到底是不是要站在那个地方？',
      },
    ],
    autoNext: 'day25_listen',
  },

  day25_listen: {
    id: 'day25_listen',
    type: 'choice',
    content: [
      {
        type: 'narration',
        text: '林夏看着你，似乎在等你一个回答。',
      },
    ],
    options: [
      {
        id: 'opt_listen',
        text: '「我听懂了。我会站上去。」',
        visibleText: '认真听',
        setFlag: 'deep_listen',
        // 阶段 6 修复：拆分路径到不同的 night 场景，避免 onEnter 无条件 +8 抹平分歧
        effect: { modifyRelationship: { lin_xia: { affection: 15 } }, mood: 8, trust: 3 },
        nextScene: 'day25_night_listen',
      },
      {
        id: 'opt_confused',
        text: '「……我不知道。」',
        visibleText: '迷茫',
        effect: { modifyRelationship: { lin_xia: { affection: -3 } }, mood: -2 },
        nextScene: 'day25_night_confused',
      },
    ],
  },

  /**
   * 阶段 6 修复：opt_listen 后的夜晚
   * - 与林夏的羁绊加深
   * - 解锁 bond_lin_xia
   * - lin_xia_trust 已在 option 内显式触发
   */
  day25_night_listen: {
    id: 'day25_night_listen',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '夜里，你回想林夏的话。',
      },
      {
        type: 'narration',
        text: '你拿出手机，给她发了一条消息：「谢谢你。」',
      },
      {
        type: 'narration',
        text: '她回了一个字：「嗯。」',
      },
      {
        type: 'narration',
        text: '但你懂那个字里所有的重量。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 5 },
      modifyRelationship: { lin_xia: { affection: 6 } },
      setFlags: ['day25_complete'],
      unlockAchievements: ['lin_xia_trust', 'bond_lin_xia'],
    },
    autoNext: 'day26_morning',
  },

  /**
   * 阶段 6 修复：opt_confused 后的夜晚
   * - 林夏知道你的迷茫，没有强求
   * - 不解锁 bond_lin_xia（错过羁绊节点）
   * - 保留 day25_complete 以推进剧情
   */
  day25_night_confused: {
    id: 'day25_night_confused',
    type: 'narration',
    content: [
      {
        type: 'narration',
        text: '夜里，你没睡着。',
      },
      {
        type: 'narration',
        text: '林夏下午的话一直绕在脑子里。',
      },
      {
        type: 'narration',
        text: '你还不知道答案。',
      },
      {
        type: 'narration',
        text: '但还有 5 天。',
      },
    ],
    onEnter: {
      modifyStats: { mood: 2 },
      // 阶段 6 修复：迷茫路径下林夏 +1（不再是 +8），体现「错过羁绊节点」
      modifyRelationship: { lin_xia: { affection: 1 } },
      setFlags: ['day25_complete'],
      // 注意：不解锁 bond_lin_xia，不解锁 lin_xia_trust
    },
    autoNext: 'day26_morning',
  },
}
