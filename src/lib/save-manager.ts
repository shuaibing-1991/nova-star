/**
 * 存档管理器（多存档位 + 自动存档 + 导入导出）
 * 详见 [[../../../01-产品PRD#6.9 模块 9：存档系统]]
 */
import { sha256 } from 'js-sha256'
import type { SaveData } from '@/types'
import { SAVE_VERSION } from '@/config/version'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useEngineStore } from '@/stores/engine'

const SLOT_KEY_PREFIX = 'nova_save_slot_'
const META_KEY = 'nova_save_meta'
export const AUTO_SAVE_SLOT = 0
const TOTAL_SLOTS = 5

/** 存档错误类型 */
export type SaveError =
  | { type: 'serialize'; message: string }
  | { type: 'quota_exceeded'; message: string }
  | { type: 'parse'; message: string }
  | { type: 'checksum_mismatch'; slot: number }
  | { type: 'not_found'; slot: number }
  | { type: 'migrate_failed'; from: string; to: string }
  | { type: 'missing_fields'; message: string }
  | { type: 'scene_missing'; sceneId: string }

/** 存档结果（带错误信息） */
export type SaveResult =
  | { success: true }
  | { success: false; error: SaveError }

/** 读档结果（区分 4 类失败根因） */
export type RestoreResult =
  | { success: true }
  | { success: false; error: SaveError }

/** 存档元数据（轻量级，仅展示用） */
export interface SaveSlotMeta {
  slot: number
  exists: boolean
  timestamp: number | null
  day: number | null
  sceneId: string | null
  artistName: string | null
  isAutoSave: boolean
}

/** 内部存档包装 */
interface WrappedSave {
  version: string
  timestamp: number
  data: SaveData
  checksum: string
}

/** 元数据缓存 */
interface MetaCache {
  slots: Record<number, SaveSlotMeta>
  updatedAt: number
}

/* ============================================================================
 * 元数据缓存（性能优化）
 * ========================================================================== */

/**
 * 读取元数据缓存
 */
function readMetaCache(): MetaCache {
  if (typeof window === 'undefined') {
    return { slots: {}, updatedAt: 0 }
  }
  try {
    const raw = window.localStorage.getItem(META_KEY)
    if (!raw) return { slots: {}, updatedAt: 0 }
    return JSON.parse(raw)
  } catch {
    return { slots: {}, updatedAt: 0 }
  }
}

/**
 * 写入元数据缓存
 */
function writeMetaCache(cache: MetaCache): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(cache))
  } catch {
    // 元数据缓存写入失败不影响主流程
  }
}

/**
 * 失效元数据缓存（指定槽位或全部）
 */
function invalidateMetaCache(slot?: number): void {
  const cache = readMetaCache()
  if (slot !== undefined) {
    delete cache.slots[slot]
  } else {
    cache.slots = {}
  }
  cache.updatedAt = Date.now()
  writeMetaCache(cache)
}

/* ============================================================================
 * 槽位元数据
 * ========================================================================== */

/**
 * 获取所有存档槽位元数据（带缓存）
 */
export function listSaveSlots(): SaveSlotMeta[] {
  if (typeof window === 'undefined') return []
  const cache = readMetaCache()
  const slots: SaveSlotMeta[] = []

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    // 缓存命中
    if (cache.slots[i] && cache.slots[i].exists) {
      slots.push(cache.slots[i])
      continue
    }
    // 缓存未命中，解析存档
    const meta = readSlotMeta(i)
    slots.push(meta)
    // 只缓存存在的槽位（避免无意义的写）
    if (meta.exists) {
      cache.slots[i] = meta
    }
  }
  writeMetaCache(cache)
  return slots
}

/**
 * 读取单个槽位元数据（不解析完整存档）
 */
function readSlotMeta(slot: number): SaveSlotMeta {
  if (typeof window === 'undefined') {
    return emptySlotMeta(slot)
  }
  const raw = window.localStorage.getItem(SLOT_KEY_PREFIX + slot)
  if (!raw) return emptySlotMeta(slot)

  try {
    const wrapped = JSON.parse(raw) as WrappedSave
    if (!wrapped || !wrapped.checksum) return emptySlotMeta(slot)
    return {
      slot,
      exists: true,
      timestamp: wrapped.timestamp ?? null,
      day: wrapped.data?.progress?.currentDay ?? null,
      sceneId: wrapped.data?.progress?.currentScene ?? null,
      artistName: wrapped.data?.artist?.name ?? null,
      isAutoSave: slot === AUTO_SAVE_SLOT,
    }
  } catch {
    return emptySlotMeta(slot)
  }
}

function emptySlotMeta(slot: number): SaveSlotMeta {
  return {
    slot,
    exists: false,
    timestamp: null,
    day: null,
    sceneId: null,
    artistName: null,
    isAutoSave: slot === AUTO_SAVE_SLOT,
  }
}

/* ============================================================================
 * 保存与读取（核心）
 * ========================================================================== */

/**
 * 保存到指定槽位（带错误细分）
 */
export function saveToSlot(slot: number, data: SaveData): SaveResult {
  if (typeof window === 'undefined') {
    return { success: false, error: { type: 'parse', message: 'SSR 环境' } }
  }
  const checksum = computeChecksum(data)
  const wrapped: WrappedSave = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    data,
    checksum,
  }

  let serialized: string
  try {
    serialized = JSON.stringify(wrapped)
  } catch (e) {
    return {
      success: false,
      error: {
        type: 'serialize',
        message: e instanceof Error ? e.message : String(e),
      },
    }
  }

  try {
    window.localStorage.setItem(SLOT_KEY_PREFIX + slot, serialized)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    const isQuota =
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('exceeded')
    return {
      success: false,
      error: isQuota
        ? { type: 'quota_exceeded', message }
        : { type: 'parse', message },
    }
  }

  // 失效缓存，强制下次重新解析
  invalidateMetaCache(slot)
  return { success: true }
}

/**
 * 从指定槽位读取（带校验和迁移）
 *
 * 阶段 6 修复：返回带错误信息的 RestoreResult，区分 4 类失败根因
 * - not_found：槽位不存在
 * - parse：JSON 解析失败
 * - checksum_mismatch：存档被改过或跨设备读档
 * - 成功：返回迁移后的 SaveData
 */
export function loadFromSlot(slot: number): RestoreResult {
  if (typeof window === 'undefined') {
    return { success: false, error: { type: 'not_found', slot } }
  }
  const raw = window.localStorage.getItem(SLOT_KEY_PREFIX + slot)
  if (!raw) {
    return { success: false, error: { type: 'not_found', slot } }
  }

  let wrapped: WrappedSave
  try {
    wrapped = JSON.parse(raw) as WrappedSave
  } catch (e) {
    console.error(`[save-manager] Slot ${slot} JSON parse failed`, e)
    return {
      success: false,
      error: { type: 'parse', message: e instanceof Error ? e.message : String(e) },
    }
  }

  if (!wrapped || !wrapped.checksum || !wrapped.data) {
    return { success: false, error: { type: 'parse', message: '存档格式损坏' } }
  }

  // 校验和验证
  const expected = computeChecksum(wrapped.data)
  if (wrapped.checksum !== expected) {
    console.error(`[save-manager] Slot ${slot} checksum mismatch`)
    return { success: false, error: { type: 'checksum_mismatch', slot } }
  }

  // 版本迁移
  return { success: true, data: migrate(wrapped.data, wrapped.version) } as any
}

/**
 * 删除指定槽位
 */
export function deleteSlot(slot: number): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(SLOT_KEY_PREFIX + slot)
  invalidateMetaCache(slot)
}

/* ============================================================================
 * 自动存档与手动存档
 * ========================================================================== */

/**
 * 自动存档（覆盖 0 号槽位）
 */
export function autoSave(reason: string = 'auto'): boolean {
  const data = useGameStore.getState().exportSave()
  const result = saveToSlot(AUTO_SAVE_SLOT, data)
  if (result.success && process.env.NODE_ENV === 'development') {
    console.info('[auto-save]', reason, 'day', data.progress.currentDay)
  }
  if (!result.success) {
    console.warn('[auto-save] failed', (result as any).error)
  }
  return result.success
}

/**
 * 手动存档
 */
export function manualSave(slot: number): boolean {
  const data = useGameStore.getState().exportSave()
  const result = saveToSlot(slot, data)
  if (!result.success) {
    console.error('[manual-save] failed', (result as any).error)
  }
  return result.success
}

/* ============================================================================
 * 加载到 stores
 * ========================================================================== */

/**
 * 加载指定槽位到 stores（先校验后写入，避免部分写入导致状态不一致）
 *
 * 阶段 6 修复：返回 RestoreResult，区分 4 类失败根因
 * - 调用方拿到 error.type 可给玩家针对性提示：
 *   - not_found → 「存档已删除」
 *   - parse → 「存档格式损坏」
 *   - checksum_mismatch → 「存档已损坏（可能被修改）」
 *   - missing_fields → 「存档不完整」
 *   - scene_missing → 引擎层面处理（loadError UI）
 */
export function restoreFromSlot(slot: number): RestoreResult {
  // 1. 先读取并校验存档完整性
  const result = loadFromSlot(slot)
  if (!result.success) return result
  const data = (result as any).data

  // 2. 校验存档中的关键字段
  if (!data.artist || !data.stats || !data.progress) {
    console.error('[restore] Save data missing required fields')
    return {
      success: false,
      error: { type: 'missing_fields', message: '存档缺少 artist/stats/progress 字段' },
    }
  }

  // 3. 写入 gameStore（原子替换）
  useGameStore.getState().importSave(data)

  // 4. 写入 settingsStore（先尝试 setState，失败时不 reset）
  if (data.preferences) {
    useSettingsStore.setState({
      skipOpening: data.preferences.skipOpening,
      defaultDecisionStyle: data.preferences.defaultDecisionStyle,
      autoSkipReadConversations: data.preferences.autoSkipReadConversations,
      decisionDelay: data.preferences.decisionDelay,
      theme: data.preferences.theme,
      fontSize: data.preferences.fontSize,
    })
  }

  // 5. 重置引擎并加载场景
  useEngineStore.getState().reset()
  const loaded = useEngineStore.getState().loadScene(data.progress.currentScene)
  if (!loaded) {
    return {
      success: false,
      error: { type: 'scene_missing', sceneId: data.progress.currentScene },
    }
  }
  return { success: true }
}

/* ============================================================================
 * 导入导出
 * ========================================================================== */

/**
 * 导出为 JSON 字符串（用于文件下载）
 */
export function exportSlotAsJSON(slot: number): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(SLOT_KEY_PREFIX + slot) ?? ''
}

/**
 * 导出为 base64（向后兼容）
 */
export function exportSlotAsBase64(slot: number): string {
  const json = exportSlotAsJSON(slot)
  if (!json) return ''
  return encodeBase64(json)
}

/**
 * 从 JSON 字符串导入到指定槽位
 */
export function importSlotFromJSON(slot: number, json: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const wrapped = JSON.parse(json) as WrappedSave
    if (!wrapped || !wrapped.checksum || !wrapped.data) {
      console.error('[import] Invalid save format')
      return false
    }
    const expected = computeChecksum(wrapped.data)
    if (wrapped.checksum !== expected) {
      console.error('[import] Checksum mismatch (data corrupted)')
      return false
    }
    window.localStorage.setItem(SLOT_KEY_PREFIX + slot, json)
    invalidateMetaCache(slot)
    return true
  } catch (e) {
    console.error('[import] failed', e)
    return false
  }
}

/**
 * 从 base64 导入到指定槽位（向后兼容）
 */
export function importSlotFromBase64(slot: number, base64: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const json = decodeBase64(base64)
    return importSlotFromJSON(slot, json)
  } catch (e) {
    console.error('[import-base64] failed', e)
    return false
  }
}

/* ============================================================================
 * 旧存档迁移（从单槽位 nova_save 迁移到多槽位）
 * ========================================================================== */

const LEGACY_KEY = 'nova_save'
const LEGACY_MIGRATED_FLAG = 'nova_legacy_migrated'

/**
 * 兼容旧存档：原 `nova_save` 单槽位 → 自动迁移到 slot 1
 *
 * 原子流程：
 * 1. 检查是否已迁移
 * 2. 读取旧存档 + 校验
 * 3. 检查 slot 1 是否已占用
 * 4. 写入 slot 1（同时保留旧 key 作为备份）
 * 5. 删除旧 key + 标记已迁移
 */
export function migrateLegacySave(): boolean {
  if (typeof window === 'undefined') return false

  // 已迁移过则跳过
  if (window.localStorage.getItem(LEGACY_MIGRATED_FLAG) === '1') {
    return false
  }

  const raw = window.localStorage.getItem(LEGACY_KEY)
  if (!raw) {
    // 没有旧存档，标记为已迁移以避免下次再检查
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    return false
  }

  // slot 1 已有数据（用户已经在新版本游戏过），跳过迁移
  if (window.localStorage.getItem(SLOT_KEY_PREFIX + 1)) {
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    return false
  }

  // 验证旧存档格式（包含 checksum）
  let wrapped: WrappedSave
  try {
    wrapped = JSON.parse(raw) as WrappedSave
  } catch {
    console.warn('[migrate-legacy] Legacy save parse failed, deleting')
    window.localStorage.removeItem(LEGACY_KEY)
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    return false
  }

  if (!wrapped || !wrapped.checksum || !wrapped.data) {
    console.warn('[migrate-legacy] Legacy save invalid format, deleting')
    window.localStorage.removeItem(LEGACY_KEY)
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    return false
  }

  // 校验旧存档的 checksum
  const expected = computeChecksum(wrapped.data)
  if (wrapped.checksum !== expected) {
    console.warn('[migrate-legacy] Legacy save checksum mismatch, deleting')
    window.localStorage.removeItem(LEGACY_KEY)
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    return false
  }

  // 迁移到 slot 1（升级版本号 + 应用迁移）
  const migratedData = migrate(wrapped.data, wrapped.version)
  const newWrapped: WrappedSave = {
    version: SAVE_VERSION,
    timestamp: wrapped.timestamp ?? Date.now(),
    data: migratedData,
    checksum: computeChecksum(migratedData),
  }

  try {
    // 先写新位置
    window.localStorage.setItem(
      SLOT_KEY_PREFIX + 1,
      JSON.stringify(newWrapped)
    )
    // 再删除旧 key
    window.localStorage.removeItem(LEGACY_KEY)
    // 标记完成
    window.localStorage.setItem(LEGACY_MIGRATED_FLAG, '1')
    // 失效缓存
    invalidateMetaCache(1)
    console.info('[migrate-legacy] Success: nova_save → slot 1')
    return true
  } catch (e) {
    console.error('[migrate-legacy] Migration failed', e)
    // 失败时旧 key 保留，不破坏用户数据
    return false
  }
}

/* ============================================================================
 * 校验和与迁移
 * ========================================================================== */

/**
 * 计算校验和（key 排序后拼接 + SHA-256）
 *
 * 阶段 6 修复：使用稳定序列化器
 * - 之前：JSON.stringify 在不同 V8 版本对 undefined/NaN/BigInt 输出有差异
 *   （NaN → null，但顺序不一定一致）
 * - 跨设备读档会被判损坏
 * - 修复：手写递归 + 显式处理 undefined/skip function + 数组保留顺序
 */
function stableStringify(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '"__NaN__"'
    if (!Number.isFinite(value)) return `"__${value > 0 ? 'Infinity' : '-Infinity'}__"`
    return String(value)
  }
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'boolean') return String(value)
  if (typeof value === 'bigint') return `"__bigint__${value.toString()}"`
  if (typeof value === 'function') return '"__function__"'
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']'
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    return (
      '{' +
      keys
        .map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]))
        .join(',') +
      '}'
    )
  }
  return '"__unknown__"'
}

function computeChecksum(data: unknown): string {
  return sha256(stableStringify(data))
}

/**
 * 版本迁移：将任意版本的数据迁移到当前版本
 *
 * 当前只有一个版本（1.0.0），但已实现迁移链式结构以备未来扩展
 */
function migrate(data: SaveData, version: string): SaveData {
  // 已经是当前版本
  if (version === SAVE_VERSION) return data

  // 版本链：从 oldVersion 一路迁移到 SAVE_VERSION
  let current: SaveData = data
  let currentVersion = version

  // 迁移历史示例（未来扩展）：
  // if (currentVersion === '0.9.0') {
  //   current = migrate_0_9_to_1_0(current)
  //   currentVersion = '1.0.0'
  // }

  // 字段补全：即使版本号匹配，也补全可能缺失的字段（向前兼容）
  current = fillMissingFields(current)

  if (currentVersion !== SAVE_VERSION) {
    console.warn(
      `[migrate] Unknown version ${version}, returning best-effort data`
    )
  }

  return current
}

/**
 * 字段补全：确保所有新字段都有默认值
 * 即使存档来自未知版本，也能安全加载
 */
function fillMissingFields(data: SaveData): SaveData {
  return {
    ...data,
    version: SAVE_VERSION,
    artist: data.artist ?? {
      name: '新人偶像',
      vibe: 'fresh',
      height: 168,
      position: 'vocal',
      persona: 'gentle',
      romance: 'none',
      fanName: '粉丝',
      fanColor: '#FFB6C1',
      route: 'girl-group',
    },
    stats: data.stats ?? {
      followers: 1000,
      mood: 75,
      vocal: 50,
      dance: 50,
      stage: 50,
      trust: 60,
      screenPresence: 'medium',
    },
    progress: data.progress ?? {
      currentDay: 1,
      currentScene: 'opening_intro',
      storyFlags: [],
    },
    relationships: data.relationships ?? {},
    conversations: data.conversations ?? {},
    achievements: data.achievements ?? [],
    // 阶段 4-5 新增：业务持久 UI 状态
    notificationLastReadAt: data.notificationLastReadAt ?? 0,
    weiboLiked: data.weiboLiked ?? false,
    chatScriptIndex: data.chatScriptIndex ?? {},
    // 阶段 4：日程系统
    energy: data.energy ?? 80,
    dayActivities: data.dayActivities ?? [],
    preferences: data.preferences ?? {
      skipOpening: false,
      defaultDecisionStyle: 'neutral',
      autoSkipReadConversations: false,
      decisionDelay: 1500,
      theme: 'auto',
      fontSize: 'medium',
    },
  }
}

/* ============================================================================
 * Base64 编码（UTF-8 安全）
 * ========================================================================== */

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function decodeBase64(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}