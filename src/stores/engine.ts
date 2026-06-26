/**
 * 场景引擎 Store（剧情运行时）
 * 详见 [[../../../01-产品PRD#6.3 剧本引擎]]
 */
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Scene, SceneOption } from '@/types'
import { ALL_SCENES, getScene, isLateScenesLoaded, preloadLateScenes } from '@/data/story/story'
import { applyDecision, applySceneEnter, type DecisionResult } from '@/lib/decision'
import { useGameStore } from './game'
import { useSettingsStore } from './settings'
import { useUIStore, type ScenePhase } from './ui'
import { autoSave } from '@/lib/save-manager'
import { getAchievement } from '@/data/achievements'
import { evaluateEnding, getEndingAchievementId } from '@/lib/ending-evaluator'

/**
 * 阶段 6 修复：SceneType → ScenePhase 显式映射
 *
 * Scene.type ('narration' | 'dialogue' | 'choice' | 'event' | 'transition' | 'ending')
 * 与 ScenePhase ('idle' | 'narrating' | 'dialoguing' | 'choosing' | 'transitioning' | 'event' | 'ending')
 * 是不同的枚举。之前用 `scene.type as any` 强制转换，导致 'narration' 写入 scenePhase
 * （实际应该是 'narrating'），未来消费方会读不到。
 */
const SCENE_TYPE_TO_PHASE: Record<Scene['type'], ScenePhase> = {
  narration: 'narrating',
  dialogue: 'dialoguing',
  choice: 'choosing',
  event: 'event',
  transition: 'transitioning',
  ending: 'ending',
}

/** 引擎依赖（可被测试替换） */
interface EngineDeps {
  game: typeof useGameStore
  settings: typeof useSettingsStore
  ui: typeof useUIStore
  autoSave: typeof autoSave
}

let __engineDeps: EngineDeps = {
  game: useGameStore,
  settings: useSettingsStore,
  ui: useUIStore,
  autoSave,
}

/** 测试钩子：注入 mock 依赖 */
export function setEngineDeps(deps: Partial<EngineDeps>) {
  __engineDeps = { ...__engineDeps, ...deps }
}

export interface EngineState {
  // 当前场景 ID
  currentSceneId: string | null
  // 当前场景（冗余存储，避免重复查表）
  currentScene: Scene | null
  // 当前内容块索引（多块场景的进度）
  currentBlockIndex: number
  // 是否正在打字机动画中
  isTyping: boolean
  // 当前块是否已完整展示（打字机完成）
  blockReady: boolean
  // 是否等待用户点击继续
  awaitingInput: boolean
  // 历史记录（用于回溯/调试）
  history: string[]
  // 历史决策记录
  decisions: Array<{ sceneId: string; optionId: string; timestamp: number }>
  // Generation counter（用于防止竞态）
  generation: number
  // 阶段 6 修复：场景加载错误（用于跨版本/跨日回档时显示错误页，避免卡死）
  loadError: { sceneId: string; timestamp: number } | null

  // Actions
  loadScene: (sceneId: string) => boolean
  advanceBlock: () => void
  makeChoice: (option: SceneOption) => void
  skipCurrent: () => void
  notifyBlockShown: () => void // 通知：当前块已完整展示（打字机完成）
  reset: () => void
  goBack: () => boolean
  clearLoadError: () => void
}

export const useEngineStore = create<EngineState>()(
  subscribeWithSelector((set, get) => ({
    currentSceneId: null,
    currentScene: null,
    currentBlockIndex: 0,
    isTyping: false,
    blockReady: false,
    awaitingInput: false,
    history: [],
    decisions: [],
    generation: 0,
    loadError: null,

    loadScene: (sceneId) => {
      const scene = getScene(sceneId)
      // 阶段 7 Round 4 优化：当用户进入 day 7 晚上时预加载 day 8-30
      // - day 7 晚上通常是 day 8 的入口
      // - 此时用户空闲，提前异步加载下一个 day 的剧情
      if (scene && /^day[5-7]_night/.test(sceneId) && !isLateScenesLoaded()) {
        preloadLateScenes()
      }
      if (!scene) {
        // 阶段 6 修复：不再静默 console.error，设置 loadError 让 UI 显示错误页
        // 避免跨版本/跨日回档/结局后读档时永远卡在「剧情加载中…」
        console.error(`[engine] Scene not found: ${sceneId}`)
        set({
          loadError: { sceneId, timestamp: Date.now() },
          currentSceneId: null,
          currentScene: null,
        })
        return false
      }

      // 阶段 6 修复：幂等保护
      // 如果已经在该场景（如 reset 后重新 loadScene、goBack 重复调用），
      // 跳过 applySceneEnter，避免重复累加 reward
      const { currentSceneId } = get()
      if (currentSceneId === sceneId) {
        return true
      }

      // 阶段 6 修复：成功加载时清掉旧 error
      set({ loadError: null })

      // 应用场景进入效果
      const enterFx = applySceneEnter(scene.onEnter)
      const gameStore = __engineDeps.game.getState()

      enterFx.setFlags.forEach((f) => gameStore.addFlag(f))
      if (Object.keys(enterFx.modifiedStats).length > 0) {
        gameStore.modifyStats(enterFx.modifiedStats)
      }
      // 阶段 6 修复：apply onEnter.modifyRelationship
      Object.entries(enterFx.modifyRelationships).forEach(
        ([npcId, delta]) => {
          if (delta && Object.keys(delta).length > 0) {
            gameStore.modifyRelationship(npcId, delta)
          }
        }
      )
      enterFx.unlockedAchievements.forEach((id) =>
        gameStore.unlockAchievement(id)
      )

      set((state) => ({
        currentSceneId: sceneId,
        currentScene: scene,
        currentBlockIndex: 0,
        awaitingInput: scene.type !== 'choice',
        blockReady: false, // 新场景需等打字机完成
        history: [...state.history, sceneId],
        generation: state.generation + 1,
      }))

      // 同步到 gameStore 的进度
      gameStore.setProgress({ currentScene: sceneId })

      // 阶段 6 修复：用 SCENE_TYPE_TO_PHASE 显式映射，避免 `as any` cast
      __engineDeps.ui.getState().setScenePhase(SCENE_TYPE_TO_PHASE[scene.type])

      return true
    },

    advanceBlock: () => {
      const { currentScene, currentBlockIndex } = get()
      if (!currentScene) return

      // 选项场景：等待用户点击，不自动前进
      if (currentScene.type === 'choice') return

      const nextIndex = currentBlockIndex + 1
      if (nextIndex >= currentScene.content.length) {
        // 全部内容播完，进入下一个场景
        advanceToNextScene(get, set)
        return
      }

      set((state) => ({
        currentBlockIndex: nextIndex,
        awaitingInput: true,
        blockReady: false, // 重置：等待新块的 typewriter 完成
        generation: state.generation + 1,
      }))
    },

    makeChoice: (option) => {
      const { currentSceneId, currentBlockIndex, decisions } = get()
      if (!currentSceneId) return

      // 阶段 9 Round 1：决策点击音效（轻快短促的 tap）
      // 动态 import 避免 SSR 时拉入 Web Audio API 代码
      if (typeof window !== 'undefined') {
        import('@/lib/sound').then(({ playSound }) => {
          playSound('tap')
        })
      }

      const gameStore = __engineDeps.game.getState()
      const result: DecisionResult = applyDecision(option, {
        stats: gameStore.stats,
        progress: gameStore.progress,
        relationships: gameStore.relationships,
      })

      // 阶段 5：第一次做选择时解锁 first_choice 成就
      if (decisions.length === 0) {
        gameStore.unlockAchievement('first_choice')
      }

      // 记录决策
      set((state) => ({
        decisions: [
          ...state.decisions,
          {
            sceneId: currentSceneId,
            optionId: option.id,
            timestamp: Date.now(),
          },
        ],
        currentBlockIndex: currentBlockIndex + 1,
        generation: state.generation + 1,
      }))

      // 应用决策效果
      result.setFlags.forEach((f) => gameStore.addFlag(f))
      if (Object.keys(result.modifiedStats).length > 0) {
        gameStore.modifyStats(result.modifiedStats)
      }
      // 处理选项中的 modifyRelationship（如对韩知恩好感+5）
      if (option.effect?.modifyRelationship) {
        Object.entries(option.effect.modifyRelationship).forEach(
          ([npcId, delta]) => {
            gameStore.modifyRelationship(npcId, delta)
          }
        )
      }
      result.unlockedAchievements.forEach((id) =>
        gameStore.unlockAchievement(id)
      )

      // 跳转到下一个场景
      advanceToNextScene(get, set, result.nextScene)
    },

    skipCurrent: () => {
      const { currentScene } = get()
      if (!currentScene) return
      // 直接跳到下一场景
      advanceToNextScene(get, set)
    },

    notifyBlockShown: () => {
      set({ blockReady: true })
    },

    reset: () =>
      set({
        currentSceneId: null,
        currentScene: null,
        currentBlockIndex: 0,
        isTyping: false,
        blockReady: false,
        awaitingInput: false,
        history: [],
        decisions: [],
        generation: 0,
        loadError: null,
      }),

    goBack: () => {
      const { history } = get()
      if (history.length < 2) return false
      const newHistory = history.slice(0, -1)
      const previousSceneId = newHistory[newHistory.length - 1]
      set({ history: newHistory })
      get().loadScene(previousSceneId)
      return true
    },

    clearLoadError: () => set({ loadError: null }),
  }))
)

// 订阅：sceneId 变化时自动存档
if (typeof window !== 'undefined') {
  // 阶段 6 修复：autoSave debounce + 30s 节流
  // 之前每次 scene advance 都同步触发全量 JSON.stringify + localStorage.setItem
  // 30 天约 250 次 serialize，序列化会卡主线程 50-200ms
  // 改为：30s 内合并为一次写入，避免低端机帧卡顿
  let lastAutoSaveAt = 0
  let pendingAutoSaveTimer: ReturnType<typeof setTimeout> | null = null
  const AUTOSAVE_THROTTLE_MS = 30_000
  const scheduleAutoSave = (reason: string) => {
    if (pendingAutoSaveTimer) {
      // 已有 pending：合并到下一次
      return
    }
    const elapsed = Date.now() - lastAutoSaveAt
    if (elapsed >= AUTOSAVE_THROTTLE_MS) {
      // 距上次已超过 30s：立即写入
      lastAutoSaveAt = Date.now()
      __engineDeps.autoSave(reason)
    } else {
      // 30s 内：延迟写入
      pendingAutoSaveTimer = setTimeout(() => {
        lastAutoSaveAt = Date.now()
        pendingAutoSaveTimer = null
        __engineDeps.autoSave(reason)
      }, AUTOSAVE_THROTTLE_MS - elapsed)
    }
  }

  useEngineStore.subscribe(
    (state) => state.currentSceneId,
    (sceneId, prevSceneId) => {
      if (sceneId && sceneId !== prevSceneId) {
        scheduleAutoSave('scene_advance')
      }
    }
  )

  // 阶段 6 修复：页面卸载时强制 flush pending autoSave
  // 避免玩家点完场景后立即关页面，丢失最近 30s 内的进度
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (pendingAutoSaveTimer) {
        clearTimeout(pendingAutoSaveTimer)
        pendingAutoSaveTimer = null
        lastAutoSaveAt = Date.now()
        __engineDeps.autoSave('beforeunload')
      }
    })
  }

  // 订阅：成就解锁时弹出 toast + 震动
  useGameStore.subscribe(
    (state) => state.achievements,
    (current, previous) => {
      const newOnes = current.filter((id) => !previous.includes(id))
      if (newOnes.length === 0) return

      // 动态导入以避免在 SSR 时加载 toast/haptic
      Promise.all([
        import('@/components/ui/toast'),
        import('@/hooks/use-haptic'),
      ]).then(([{ toast }, { haptic }]) => {
        newOnes.forEach((id) => {
          const ach = getAchievement(id)
          if (!ach) {
            toast.success(id, '解锁新成就')
            haptic.medium()
            return
          }
          // 按稀有度区分 toast 等级
          const title = `解锁成就：${ach.name}`
          switch (ach.rarity) {
            case 'common':
              toast.info(ach.description, title)
              haptic.light()
              break
            case 'rare':
              toast.success(ach.description, title)
              haptic.medium()
              break
            case 'epic':
              toast.success(`🏆 ${ach.description}`, `✨ ${title}`)
              haptic.heavy()
              break
            case 'legendary':
              toast.success(`👑 ${ach.description}`, `🌟 ${title}`)
              haptic.heavy()
              break
          }
        })
      })
    }
  )
}

/**
 * 跳转到下一个场景（autoNext / nextScene）
 */
function advanceToNextScene(
  get: () => EngineState,
  set: (
    fn: (state: EngineState) => Partial<EngineState>
  ) => void,
  explicitNextScene?: string
) {
  const { currentScene } = get()
  if (!currentScene) return

  const nextId =
    explicitNextScene ?? currentScene.autoNext ?? currentScene.options?.[0]?.nextScene

  if (!nextId) {
    // 剧情结束
    __engineDeps.ui.getState().setScenePhase('ending')
    set({ currentSceneId: null, currentScene: null })
    navigateToEnding(currentScene.id)
    return
  }

  // 触达 ending 场景
  const nextScene = getScene(nextId)
  if (nextScene?.type === 'ending') {
    __engineDeps.ui.getState().setScenePhase('ending')
    // 加载 ending 场景以便 applySceneEnter 执行
    get().loadScene(nextId)
    // 跳转到结局页
    navigateToEnding(nextId)
    return
  }

  get().loadScene(nextId)
}

/**
 * 跳转到结局页
 *
 * 两种场景：
 * 1. Day 30 收尾场景（id 为 `day30_ending`）→ 调用 evaluateEnding() 动态判定
 * 2. 显式结局场景（id 形如 `ending_success`）→ 直接从 id 解析
 *
 * 阶段 7 Round 5 修复：不再 setTimeout 后直接跳转。
 * - 显示 EndingTransition 全屏 overlay，让用户清楚等待中
 * - 同时给用户 ESC / "立即查看结局" 主动权
 * - 阶段 6 修的 3000ms 时序问题由 overlay 的 setInterval 倒计时承担
 */
function navigateToEnding(sceneId: string): void {
  if (typeof window === 'undefined') return

  // 阶段 9 Round 1：进入结局时播放 reveal（递进的揭示音）
  // 动态 import 避免 SSR 时拉入 Web Audio API 代码
  import('@/lib/sound').then(({ playSound }) => {
    playSound('reveal')
  })

  let type: 'success' | 'neutral' | 'failure' | 'hidden'
  let achievementName: string | undefined

  if (sceneId === 'day30_ending' || sceneId === 'day30_final') {
    // 阶段 6：Day 30 收尾，动态评估结局
    const state = __engineDeps.game.getState()
    type = evaluateEnding(state)
    // 同步解锁对应结局成就（subscriber 立即触发 toast 渲染）
    state.unlockAchievement(getEndingAchievementId(type))
    // 阶段 7 Round 5：从成就数据查 name 给 overlay 显示
    const achId = getEndingAchievementId(type)
    achievementName = getAchievement(achId)?.name
  } else {
    // 显式结局场景（兼容旧路由）
    const match = sceneId.match(/ending_(\w+)/)
    type = (match?.[1] as any) ?? 'success'
  }

  // 阶段 7 Round 5：调用 overlay 显示过渡
  // overlay 内部 setInterval 倒计时 3 秒后自动跳转，并提供 ESC / 按钮立即跳过
  // 同步动态 import，避免 layout 中静态引入造成首屏开销
  Promise.all([import('@/components/system/ending-transition')]).then(
    ([{ showEndingTransition }]) => {
      showEndingTransition({
        type,
        achievementName,
        duration: 3000,
      })
    }
  )
}

/** 估算单块时长（毫秒）：中文约 50 字/秒 = 20ms/字 */
export function estimateBlockDuration(text: string): number {
  if (!text) return 0
  // 中文 50 字/秒 = 20ms/字；英文按 5 字符/词、200 词/分 ≈ 60ms/字符
  const chineseChars = (text.match(/[一-龥]/g) || []).length
  const otherChars = text.length - chineseChars
  return chineseChars * 20 + otherChars * 60
}