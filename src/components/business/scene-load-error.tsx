/**
 * 场景加载错误页
 *
 * 阶段 6 修复：当 engine.loadScene 失败时显示
 * 触发场景：
 * - 跨版本读档：老存档指向已删场景（如 Round 1-3 重命名/删除的场景）
 * - 跨日回档：Day 30 读 Day 10 档，但 Day 10 存档被旧版本污染
 * - 结局后回读：reset 后再读 Day 25 档，scene 不存在
 *
 * 用户选项：
 * - 重新开始：重置 gameStore 回到 onboarding
 * - 返回主菜单：保留存档，跳到 /phone
 */
'use client'

import * as React from 'react'
import { PhoneShell } from './phone-shell'
import { Button } from '@/components/ui/button'

interface SceneLoadErrorProps {
  sceneId: string
  onRestart: () => void
  onMenu: () => void
}

export const SceneLoadError: React.FC<SceneLoadErrorProps> = ({
  sceneId,
  onRestart,
  onMenu,
}) => {
  return (
    <PhoneShell background="gradient">
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-6 text-6xl">😢</div>
        <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">
          剧情场景无法加载
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          存档指向的场景「{sceneId}」不存在
          <br />
          可能是因为游戏版本不兼容或存档已损坏
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={onRestart} className="w-full">
            重新开始
          </Button>
          <Button variant="outline" onClick={onMenu} className="w-full">
            返回主菜单
          </Button>
        </div>
      </div>
    </PhoneShell>
  )
}
