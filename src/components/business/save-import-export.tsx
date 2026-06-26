/**
 * 存档导入导出组件（弹窗）
 * 用于跨设备分享存档或备份
 */
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { exportSlotAsJSON, importSlotFromJSON } from '@/lib/save-manager'

interface SaveImportExportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: number
  slotLabel?: string
}

export function SaveImportExport({
  open,
  onOpenChange,
  slot,
  slotLabel,
}: SaveImportExportProps) {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const json = exportSlotAsJSON(slot)
    if (!json) {
      setFeedback({ type: 'error', message: '该槽位为空，无可导出内容' })
      return
    }
    try {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      a.href = url
      a.download = `nova-save-slot${slot}-${ts}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setFeedback({ type: 'success', message: '存档已导出为文件' })
    } catch (e) {
      setFeedback({
        type: 'error',
        message: `导出失败：${e instanceof Error ? e.message : String(e)}`,
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const ok = importSlotFromJSON(slot, text)
      if (ok) {
        setFeedback({ type: 'success', message: '存档导入成功' })
      } else {
        setFeedback({ type: 'error', message: '存档格式错误或校验失败' })
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `读取文件失败：${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      // 清空 input 以便下次选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCopyToClipboard = async () => {
    const json = exportSlotAsJSON(slot)
    if (!json) {
      setFeedback({ type: 'error', message: '该槽位为空' })
      return
    }
    try {
      await navigator.clipboard.writeText(json)
      setFeedback({ type: 'success', message: '存档已复制到剪贴板' })
    } catch {
      setFeedback({ type: 'error', message: '复制失败，请使用导出文件' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入/导出存档</DialogTitle>
          <DialogDescription>
            {slotLabel ?? `槽位 ${slot}`}：导出后可在其他设备导入，或备份到本地
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleExport} className="flex-1">
              导出为文件
            </Button>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex-1"
            >
              复制到剪贴板
            </Button>
          </div>

          <div className="border-t pt-3">
            <Button
              onClick={handleImportClick}
              variant="secondary"
              className="w-full"
            >
              从文件导入
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {feedback && (
            <div
              className={
                'rounded-md p-3 text-sm ' +
                (feedback.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300')
              }
            >
              {feedback.message}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}