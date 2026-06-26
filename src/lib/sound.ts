/**
 * 音效引擎（Web Audio API 合成）
 *
 * 阶段 9 Round 1 新增：补完阶段 6+ 标注的"音效占位"
 *
 * 设计原则：
 * - 不依赖外部 .mp3 资源（零成本、零版权风险）
 * - 用 OscillatorNode + GainNode 合成轻量音效
 * - 与设置系统的 soundEnabled 联动
 * - 尊重 useReducedMotion / vibrationEnabled
 *
 * 音效分类：
 * - tap：轻触反馈（点击决策）
 * - chime：成就解锁
 * - bell：日切换
 * - reveal：结局揭示
 * - error：错误提示
 */

export type SoundType = 'tap' | 'chime' | 'bell' | 'reveal' | 'error'

interface SoundConfig {
  // 频率（Hz）
  frequency: number | number[]
  // 持续时间（ms）
  duration: number
  // 音量（0-1）
  volume: number
  // 音色类型
  type: OscillatorType
  // 包络曲线
  envelope?: {
    attack: number
    decay: number
    sustain: number
    release: number
  }
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  tap: {
    frequency: 800,
    duration: 50,
    volume: 0.15,
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.04, sustain: 0, release: 0 },
  },
  chime: {
    frequency: [523.25, 659.25, 783.99], // C5 E5 G5（小三和弦）
    duration: 600,
    volume: 0.2,
    type: 'sine',
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 },
  },
  bell: {
    frequency: 880, // A5
    duration: 400,
    volume: 0.18,
    type: 'sine',
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.4 },
  },
  reveal: {
    frequency: [261.63, 329.63, 392.0, 523.25], // C4 E4 G4 C5
    duration: 1200,
    volume: 0.22,
    type: 'triangle',
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 1.0 },
  },
  error: {
    frequency: 220,
    duration: 200,
    volume: 0.18,
    type: 'square',
    envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.15 },
  },
}

class SoundEngine {
  private context: AudioContext | null = null
  private enabled = true
  private initialized = false

  /**
   * 初始化 AudioContext（必须在用户交互后调用）
   */
  init() {
    if (this.initialized) return
    if (typeof window === 'undefined') return
    try {
      // 兼容旧浏览器
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (AudioContextClass) {
        this.context = new AudioContextClass()
        this.initialized = true
      }
    } catch (err) {
      // AudioContext 不可用（非 HTTPS、隐私模式等）
      // eslint-disable-next-line no-console
      console.warn('[sound] AudioContext init failed', err)
    }
  }

  /**
   * 设置启用状态（与设置系统联动）
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  /**
   * 播放音效
   */
  play(type: SoundType) {
    if (!this.enabled) return
    if (!this.context) {
      // 未初始化：尝试懒初始化（首次用户交互后）
      this.init()
      if (!this.context) return
    }

    // Safari 等需要 resume
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {})
    }

    const config = SOUND_CONFIGS[type]
    const frequencies = Array.isArray(config.frequency)
      ? config.frequency
      : [config.frequency]

    frequencies.forEach((freq, idx) => {
      this.playTone(freq, config, idx * 30) // 错开多音
    })
  }

  /**
   * 播放单个音
   */
  private playTone(
    frequency: number,
    config: SoundConfig,
    delayMs: number = 0
  ) {
    if (!this.context) return
    const ctx = this.context
    const now = ctx.currentTime + delayMs / 1000
    const duration = config.duration / 1000

    // 创建节点
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = config.type
    oscillator.frequency.value = frequency

    // 包络
    const env = config.envelope || {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2,
    }
    const peakVolume = config.volume

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(peakVolume, now + env.attack)
    gainNode.gain.linearRampToValueAtTime(
      peakVolume * env.sustain,
      now + env.attack + env.decay
    )
    gainNode.gain.linearRampToValueAtTime(0, now + duration + env.release)

    // 连接
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 起止
    oscillator.start(now)
    oscillator.stop(now + duration + env.release + 0.05)
  }

  /**
   * 释放资源
   */
  destroy() {
    if (this.context) {
      this.context.close().catch(() => {})
      this.context = null
      this.initialized = false
    }
  }
}

// 单例
let engineInstance: SoundEngine | null = null

/**
 * 获取音效引擎实例
 */
export function getSoundEngine(): SoundEngine {
  if (typeof window === 'undefined') {
    // SSR：返回无操作实例
    return {
      init: () => {},
      setEnabled: () => {},
      play: () => {},
      destroy: () => {},
    } as SoundEngine
  }
  if (!engineInstance) {
    engineInstance = new SoundEngine()
  }
  return engineInstance
}

/**
 * 便捷播放函数
 */
export function playSound(type: SoundType) {
  getSoundEngine().play(type)
}

/**
 * 便捷设置启用
 */
export function setSoundEnabled(enabled: boolean) {
  getSoundEngine().setEnabled(enabled)
}