/**
 * NPC 对话脚本
 * 详见 [[../../../04-NPC角色设定]]
 *
 * 每个 NPC 至少 5 段对话
 * - effects: 数值变化（mood/trust/affection）
 * - response: NPC 回复文本
 */
import type { Stats, NPCRelationship } from '@/types'

export interface ChatChoice {
  id: string
  text: string
  effects?: {
    affection?: number
    mood?: number
    trust?: number
  }
  response: string
  nextChoices?: ChatChoice[] // 嵌套对话（未来扩展）
}

export const CHAT_SCRIPTS: Record<string, ChatChoice[]> = {
  han_zhi_en: [
    {
      id: 'hze_meeting_1',
      text: '韩总，我会努力的。',
      effects: { mood: 2 },
      response:
        '在这个圈子，努力是最廉价的词。我要看的是结果。下周有 Showcase，准备好了吗？',
    },
    {
      id: 'hze_meeting_2',
      text: '我已经准备好了。',
      effects: { trust: 3, mood: 5 },
      response:
        '好，那我拭目以待。记得，每天早上 5 点的早训不许迟到。',
    },
    {
      id: 'hze_feedback_1',
      text: '请问我有什么不足吗？',
      effects: { trust: 1 },
      response:
        '舞台表现力还不够。镜头感这个东西，练不来，但你可以多观察前辈的表演。',
    },
    {
      id: 'hze_warning_1',
      text: '我有点累了。',
      effects: { mood: -2, trust: -1 },
      response:
        '累是正常的。但如果你现在退，明天就有新人代替你。想清楚。',
    },
    {
      id: 'hze_encourage_1',
      text: '谢谢你，韩总。',
      effects: { affection: 5, mood: 3 },
      response: '……别谢我，用成绩说话。',
    },
  ],

  xu_jia_shu: [
    {
      id: 'xjs_intro_1',
      text: '嘉树哥好！',
      effects: { affection: 2 },
      response:
        '你好啊，新人。第一次见你。LUMINA 是个残酷的地方，加油吧。',
    },
    {
      id: 'xjs_intro_2',
      text: '请多指教。',
      effects: { affection: 1 },
      response:
        '指教谈不上。我也是从新人过来的。记住一件事：舞台上不要相信任何人。',
    },
    {
      id: 'xjs_train_1',
      text: '你的舞台好厉害，怎么做到的？',
      effects: { mood: 3, trust: 1 },
      response:
        '每天 12 小时，连续 5 年。别羡慕我，每个人有自己的路。',
    },
    {
      id: 'xjs_rival_1',
      text: '我以后会成为你的对手。',
      effects: { affection: -2, mood: -3 },
      response: '哈，那就来试试。',
    },
    {
      id: 'xjs_team_1',
      text: 'LUMINA 是个什么样的团体？',
      effects: { affection: 3 },
      response:
        '我们五个人从零开始走到现在。每个人都有自己的故事。但我们有一个共同点——想赢。',
    },
  ],

  zhou_yan: [
    {
      id: 'zy_friendly_1',
      text: '周砚姐~ 我是新人！',
      effects: { affection: 3 },
      response:
        '哎呀你好呀！叫我周砚就好。紧张吗？我刚来的时候紧张得连话都说不利索。',
    },
    {
      id: 'zy_advice_1',
      text: '有什么要注意的吗？',
      effects: { affection: 2, mood: 4 },
      response:
        '少吃夜宵多睡觉。对了，食堂周三的红烧肉超好吃，但别吃太多会被经纪人发现。',
    },
    {
      id: 'zy_emotional_1',
      text: '我有点想家了。',
      effects: { affection: 5, mood: 5 },
      response:
        '（递给你一杯热可可）我也是。哭吧，这里没人笑你。',
    },
    {
      id: 'zy_practice_1',
      text: '可以一起练习吗？',
      effects: { affection: 3, trust: 2 },
      response:
        '当然！明天早上 6 点练功房见。我带你过一遍基础舞蹈。',
    },
    {
      id: 'zy_gossip_1',
      text: '听说你以前得过最佳新人奖？',
      effects: { affection: 1 },
      response:
        '那是过去了。现在每天都是从零开始。你也会的。',
    },
  ],

  shen_yao: [
    {
      id: 'sy_mysterious_1',
      text: '你好，沈遥。',
      effects: { affection: 2 },
      response:
        '……你好。',
    },
    {
      id: 'sy_curious_1',
      text: '你好像很安静？',
      effects: { affection: 3 },
      response:
        '（微微一笑）不是安静，是没有遇到值得说话的人。',
    },
    {
      id: 'sy_close_1',
      text: '你愿意和我做朋友吗？',
      effects: { affection: 5, mood: 3 },
      response:
        '……可以。但你要答应我一件事：不要在任何人面前提起我们的对话。',
    },
    {
      id: 'sy_warning_1',
      text: '你觉得我能成功吗？',
      effects: { mood: -2, affection: -1 },
      response:
        '我不知道。但这不是你应该问我的问题。',
    },
    {
      id: 'sy_deep_1',
      text: '谢谢你陪着我。',
      effects: { affection: 8, mood: 5 },
      response:
        '（沉默片刻）……我也是。',
    },
  ],

  lin_xia: [
    {
      id: 'lx_welcome_1',
      text: '林夏姐好~',
      effects: { affection: 2 },
      response:
        '你好。Welcome 到 NOVA STUDIO。我是林夏，你的经纪人助理。',
    },
    {
      id: 'lx_schedule_1',
      text: '请问今天有什么安排？',
      effects: { trust: 1 },
      response:
        '上午先去练功房报到，下午会有韩总和你面谈。记得带笔记本，韩总喜欢认真的人。',
    },
    {
      id: 'lx_help_1',
      text: '我有点不懂流程。',
      effects: { affection: 3, mood: 3 },
      response:
        '没事，我刚来的时候也是。有什么问题随时微信找我，手机一直开着。',
    },
    {
      id: 'lx_warning_1',
      text: '韩总是不是很严？',
      effects: { mood: -1 },
      response:
        '韩总对事不对人。但如果你踩到她红线……我会尽量帮你说情的。',
    },
    {
      id: 'lx_thanks_1',
      text: '谢谢你，林夏姐。',
      effects: { affection: 5, mood: 3 },
      response:
        '不客气。我看好你哦。',
    },
  ],
}

/** 默认对话（兜底） */
export const DEFAULT_SCRIPT: ChatChoice[] = [
  {
    id: 'default_hello',
    text: '你好',
    response: '嗯，你好。',
  },
  {
    id: 'default_bye',
    text: '下次再聊',
    response: '好。',
  },
]

export function getChatScript(npcId: string): ChatChoice[] {
  return CHAT_SCRIPTS[npcId] ?? DEFAULT_SCRIPT
}