/**
 * useLocalStorage - 同步 localStorage 的 React hook
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { safeJsonParse } from '@/lib/utils'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // 客户端读取
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(safeJsonParse<T>(item, initialValue))
      }
    } catch (error) {
      console.error(`useLocalStorage read error [${key}]:`, error)
    } finally {
      setHydrated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // 写入
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
          return next
        } catch (error) {
          console.error(`useLocalStorage write error [${key}]:`, error)
          // 写入失败时回滚到 prev，保证状态与存储一致
          return prev
        }
      })
    },
    [key]
  )

  // 删除
  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`useLocalStorage remove error [${key}]:`, error)
    }
  }, [key, initialValue])

  // 监听其他 tab 修改
  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        setStoredValue(safeJsonParse<T>(e.newValue, initialValue))
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, hydrated, initialValue])

  return [storedValue, setValue, remove]
}
