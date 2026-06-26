/**
 * 成就系统元数据
 * 详见 PRD 6.8 模块 8：成就系统
 *
 * 阶段 5：从 5 个扩展到 22 个
 * 类型分布：
 * - 剧情成就 7 个
 * - 数值成就 6 个
 * - 关系成就 6 个
 * - 探索成就 3 个
 */
import type { Stats } from '@/types'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  reward?: { stat: keyof Stats; value: number }
  rarity: AchievementRarity
  /** 隐藏成就：达成前不显示在列表中 */
  hidden?: boolean
}

/** 完整成就列表（22 个，覆盖 4 种稀有度） */
export const ACHIEVEMENTS: Achievement[] = [
  // ========== 剧情成就（7 个） ==========
  {
    id: 'first_day',
    name: '新人报道',
    description: '完成 Day 1 的一切',
    icon: 'sparkles',
    rarity: 'common',
  },
  {
    id: 'first_rehearsal',
    name: '练习生',
    description: '完成第一次合练',
    icon: 'dumbbell',
    rarity: 'common',
  },
  {
    id: 'first_showcase',
    name: '初登舞台',
    description: '完成 Day 7 第一次内部 Showcase',
    icon: 'star',
    rarity: 'rare',
    reward: { stat: 'mood', value: 5 },
  },
  {
    id: 'noticed_by_ceo',
    name: '老板目光',
    description: '在 CEO 观察日表现良好',
    icon: 'eye',
    rarity: 'rare',
  },
  {
    id: 'first_team_dinner',
    name: '团队聚餐',
    description: '与全队完成第一次聚餐',
    icon: 'utensils',
    rarity: 'common',
  },
  {
    id: 'week1_survivor',
    name: '一周生存',
    description: '完成 Day 7 第一周',
    icon: 'flame',
    rarity: 'rare',
    reward: { stat: 'mood', value: 10 },
  },
  {
    id: 'first_choice',
    name: '第一步',
    description: '完成第一次关键决策',
    icon: 'footprints',
    rarity: 'common',
  },

  // ========== 数值成就（6 个） ==========
  {
    id: 'first_fan',
    name: '第一颗星',
    description: '粉丝数突破 1,000',
    icon: 'star',
    rarity: 'common',
  },
  {
    id: 'rising_star',
    name: '冉冉新星',
    description: '粉丝数突破 10,000',
    icon: 'rocket',
    rarity: 'rare',
    reward: { stat: 'followers', value: 1000 },
  },
  {
    id: 'all_rounder',
    name: '全能艺人',
    description: '声乐、舞蹈、舞台三项全部达到 80',
    icon: 'trophy',
    rarity: 'epic',
  },
  {
    id: 'high_mood',
    name: '心情正好',
    description: '心情值达到 95',
    icon: 'heart',
    rarity: 'common',
  },
  {
    id: 'trust_partner',
    name: '公司红人',
    description: '公司信任值达到 90',
    icon: 'briefcase',
    rarity: 'rare',
  },
  {
    id: 'legendary_performer',
    name: '传说级表演',
    description: '舞台值达到 95',
    icon: 'crown',
    rarity: 'legendary',
    reward: { stat: 'mood', value: 20 },
  },

  // ========== 关系成就（6 个） ==========
  {
    id: 'first_friend',
    name: '初识',
    description: '与第一位 NPC 好感度达到 50',
    icon: 'heart',
    rarity: 'common',
  },
  {
    id: 'team_bond',
    name: '团队默契',
    description: '与所有 NPC 好感度均达到 50',
    icon: 'users',
    rarity: 'epic',
    reward: { stat: 'mood', value: 15 },
  },
  {
    id: 'bestie',
    name: '知己',
    description: '与任一 NPC 好感度达到 90',
    icon: 'hand-heart',
    rarity: 'rare',
  },
  {
    id: 'zhou_yan_thaw',
    name: '解冻周砚',
    description: '与周砚好感度从冷淡到 70',
    icon: 'snowflake',
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'shen_yao_song',
    name: '为你写歌',
    description: '触发沈遥为你写歌的剧情',
    icon: 'music',
    rarity: 'epic',
    hidden: true,
  },
  {
    id: 'lin_xia_trust',
    name: '林夏的信任',
    description: '与林夏好感度达到 80',
    icon: 'key',
    rarity: 'rare',
  },

  // ========== 探索成就（3 个） ==========
  {
    id: 'early_bird',
    name: '早起的鸟儿',
    description: 'Day 2 选择「早到 30 分钟」',
    icon: 'sunrise',
    rarity: 'common',
  },
  {
    id: 'self_reflector',
    name: '深度反思',
    description: '在 Day 3 CEO 对话中选择「反思自己」',
    icon: 'thinking',
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'flag_collector',
    name: 'Flag 收集者',
    description: '一周内解锁 10 个剧情 flag',
    icon: 'flag',
    rarity: 'epic',
  },

  // ========== 阶段 6：羁绊成就（5 个，对应 5 个核心 NPC 关系节点）==========
  {
    id: 'bond_han_zhi_en',
    name: '知恩之心',
    description: '触发与韩知恩的「第一次见面」羁绊',
    icon: 'star',
    rarity: 'rare',
  },
  {
    id: 'bond_xu_jia_shu',
    name: '嘉树的温暖',
    description: '触发与许嘉树的「温暖瞬间」羁绊',
    icon: 'star',
    rarity: 'rare',
  },
  {
    id: 'bond_zhou_yan',
    name: '对周砚好奇',
    description: '触发与周砚的「开始感兴趣」羁绊',
    icon: 'star',
    rarity: 'rare',
  },
  {
    id: 'bond_shen_yao',
    name: '懂沈遥的歌',
    description: '真诚地反馈沈遥的原创 demo',
    icon: 'star',
    rarity: 'rare',
  },
  {
    id: 'bond_lin_xia',
    name: '林夏的深度对话',
    description: 'Day 25 与林夏深度交流',
    icon: 'star',
    rarity: 'epic',
  },

  // ========== 阶段 6：结局成就（4 个）==========
  {
    id: 'ending_success',
    name: '正式出道',
    description: '达成 LUMINA 正式出道结局',
    icon: 'crown',
    rarity: 'legendary',
    reward: { stat: 'mood', value: 30 },
  },
  {
    id: 'ending_neutral',
    name: '预备艺人',
    description: '成为预备艺人，还有下一次机会',
    icon: 'hourglass',
    rarity: 'rare',
  },
  {
    id: 'ending_failure',
    name: '错过了这次',
    description: '与这次机会擦肩而过',
    icon: 'cloud-off',
    rarity: 'common',
  },
  {
    id: 'ending_hidden',
    name: '另一个开始',
    description: '解锁隐藏结局「另一个开始」',
    icon: 'sparkles',
    rarity: 'legendary',
    reward: { stat: 'mood', value: 50 },
  },

  // ========== 阶段 6：Day 8-30 剧情节点成就（4 个）==========
  {
    id: 'controversy_survivor',
    name: '争议中挺住',
    description: 'Day 10 第一次争议中化解危机',
    icon: 'shield',
    rarity: 'rare',
  },
  {
    id: 'healing_journey',
    name: '治愈之旅',
    description: 'Day 17 接受团队的温暖',
    icon: 'heart',
    rarity: 'rare',
  },
  {
    id: 'sacrifice_choice',
    name: '身体的代价',
    description: 'Day 24 带伤继续训练',
    icon: 'droplet',
    rarity: 'epic',
    hidden: true,
  },
  {
    id: 'confidence_built',
    name: '我好像真的可以',
    description: 'Day 27 最后合练后的觉醒',
    icon: 'flame',
    rarity: 'epic',
  },
]

/** 索引 */
export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
)

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENT_MAP[id]
}

export function getAchievementsByRarity(
  rarity: AchievementRarity
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity)
}

/** 已解锁的成就（含隐藏成就） */
export function getAllUnlocked(unlockedIds: string[]): Achievement[] {
  return unlockedIds
    .map((id) => ACHIEVEMENT_MAP[id])
    .filter(Boolean)
}

/** 未解锁的可见成就 */
export function getLockedButVisible(
  unlockedIds: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !unlockedIds.includes(a.id) && !a.hidden
  )
}

/** 总成就数（含隐藏） */
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length

/** 按稀有度统计 */
export function getRarityCounts(): Record<AchievementRarity, number> {
  return ACHIEVEMENTS.reduce(
    (acc, a) => {
      acc[a.rarity]++
      return acc
    },
    { common: 0, rare: 0, epic: 0, legendary: 0 } as Record<
      AchievementRarity,
      number
    >
  )
}