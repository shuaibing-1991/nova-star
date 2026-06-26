/**
 * UI 临时状态（Zustand）- 不持久化
 */
import { create } from 'zustand'

export type ScenePhase =
  | 'idle'
  | 'narrating'
  | 'dialoguing'
  | 'choosing'
  | 'transitioning'
  | 'event'
  | 'ending'

export interface UIState {
  // 当前阶段
  scenePhase: ScenePhase
  // 是否显示状态栏
  showStatusBar: boolean
  // 当前选中的 NPC
  activeNpcId: string | null
  // 是否有未读对话
  hasUnreadMessages: boolean
  // 当前模态框
  activeModal: 'settings' | 'achievements' | 'saves' | 'help' | null
  // 沉浸模式
  immersiveMode: boolean
  // 打字机速度
  typewriterSpeed: number

  // Actions
  setScenePhase: (phase: ScenePhase) => void
  setShowStatusBar: (show: boolean) => void
  setActiveNpc: (npcId: string | null) => void
  setHasUnreadMessages: (has: boolean) => void
  setActiveModal: (modal: UIState['activeModal']) => void
  setImmersiveMode: (enabled: boolean) => void
  setTypewriterSpeed: (speed: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  scenePhase: 'idle',
  showStatusBar: true,
  activeNpcId: null,
  hasUnreadMessages: false,
  activeModal: null,
  immersiveMode: false,
  typewriterSpeed: 30,
  setScenePhase: (scenePhase) => set({ scenePhase }),
  setShowStatusBar: (showStatusBar) => set({ showStatusBar }),
  setActiveNpc: (activeNpcId) => set({ activeNpcId }),
  setHasUnreadMessages: (hasUnreadMessages) => set({ hasUnreadMessages }),
  setActiveModal: (activeModal) => set({ activeModal }),
  setImmersiveMode: (immersiveMode) => set({ immersiveMode }),
  setTypewriterSpeed: (typewriterSpeed) => set({ typewriterSpeed }),
}))
