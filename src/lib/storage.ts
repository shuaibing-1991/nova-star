/**
 * LocalStorage 封装（带防篡改校验，详见 PRD 6.7）
 */
import { sha256 } from 'js-sha256'
import { safeJsonParse } from './utils'
import { SAVE_VERSION } from '@/config/version'

const STORAGE_KEY = 'nova_save'
const STORAGE_VERSION = SAVE_VERSION

export interface SaveState<T = unknown> {
  version: string
  timestamp: number
  data: T
  checksum: string
}

/**
 * 生成 SHA-256 校验和
 */
function generateChecksum(payload: object): string {
  // 按 key 排序后序列化（确保顺序一致）
  const sortedKeys = Object.keys(payload).sort()
  const text = sortedKeys
    .map((k) => `${k}:${JSON.stringify((payload as Record<string, unknown>)[k])}`)
    .join('|')
  return sha256(text)
}

/**
 * 保存到 LocalStorage
 */
export function saveToStorage<T>(data: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    const payload = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data,
    }
    const checksum = generateChecksum(payload)
    const finalState: SaveState<T> = { ...payload, checksum }

    // 估算大小
    const serialized = JSON.stringify(finalState)
    if (serialized.length > 4.5 * 1024 * 1024) {
      console.warn('存档超过 4.5MB，请考虑裁剪')
    }

    window.localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch (e) {
    console.error('保存失败', e)
    return false
  }
}

/**
 * 从 LocalStorage 读取
 */
export function loadFromStorage<T>(): SaveState<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const state = safeJsonParse<SaveState<T> | null>(raw, null)
    if (!state || !state.checksum) return null

    // 校验
    const { checksum, ...payload } = state
    const expected = generateChecksum(payload as object)

    if (checksum !== expected) {
      console.error('存档校验失败（可能被篡改）')
      return null
    }

    return state
  } catch (e) {
    console.error('读取失败', e)
    return null
  }
}

/**
 * 清除存档
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

/**
 * 检查是否有存档
 */
export function hasStorage(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(STORAGE_KEY) !== null
}

/**
 * 字符串转 base64（安全 UTF-8 编码）
 */
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * base64 转字符串（安全 UTF-8 解码）
 */
function decodeBase64(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

/**
 * 导出为 base64
 */
export function exportToBase64(): string {
  if (typeof window === 'undefined') return ''
  const raw = window.localStorage.getItem(STORAGE_KEY) || ''
  return encodeBase64(raw)
}

/**
 * 从 base64 导入
 */
export function importFromBase64(base64: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = decodeBase64(base64)
    const state = safeJsonParse<SaveState | null>(raw, null)
    if (!state || !state.checksum) {
      console.error('存档数据格式错误')
      return false
    }
    const { checksum, ...payload } = state
    const expected = generateChecksum(payload as object)
    if (checksum !== expected) {
      console.error('存档校验失败')
      return false
    }
    window.localStorage.setItem(STORAGE_KEY, raw)
    return true
  } catch (e) {
    console.error('导入失败', e)
    return false
  }
}

/**
 * 获取存档时间戳
 */
export function getStorageTimestamp(): number | null {
  const state = loadFromStorage()
  return state?.timestamp ?? null
}
