/**
 * DebugPanel - 调试面板（仅开发模式）
 */
'use client'

import { useEngineStore } from '@/stores/engine'
import { useGameStore } from '@/stores/game'
import { Button } from '@/components/ui/button'

export function DebugPanel() {
  if (process.env.NODE_ENV === 'production') return null

  const {
    currentSceneId,
    history,
    decisions,
    reset: resetEngine,
  } = useEngineStore()
  const {
    progress,
    stats,
    relationships,
    achievements,
    setProgress,
    addFlag,
    modifyStats,
    reset: resetGame,
  } = useGameStore()

  const handleJumpToDay = (day: number) => {
    setProgress({ currentDay: day })
  }

  const handleAddFlag = () => {
    const flag = prompt('输入 flag:')
    if (flag) addFlag(flag)
  }

  const handleModMood = () => {
    modifyStats({ mood: 10 })
  }

  const handleReset = () => {
    if (confirm('确认重置所有状态？')) {
      resetGame()
      resetEngine()
    }
  }

  return (
    <div className="border-t border-yellow-300/50 bg-yellow-100/90 px-4 py-2 font-mono text-xs dark:bg-yellow-900/50">
      <div className="mb-1 font-bold">🔧 Debug Panel</div>
      <div className="grid grid-cols-2 gap-1">
        <div>Scene: {currentSceneId ?? 'null'}</div>
        <div>Day: {progress.currentDay}</div>
        <div>Mood: {stats.mood}</div>
        <div>Trust: {stats.trust}</div>
        <div>Flags: {progress.storyFlags.length}</div>
        <div>History: {history.length}</div>
        <div>Decisions: {decisions.length}</div>
        <div>Achievements: {achievements.length}</div>
        <div className="col-span-2 truncate">
          NPCs: {Object.keys(relationships).join(', ')}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <Button size="sm" variant="outline" onClick={() => handleJumpToDay(1)}>
          Day 1
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleJumpToDay(15)}>
          Day 15
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleJumpToDay(30)}>
          Day 30
        </Button>
        <Button size="sm" variant="outline" onClick={handleAddFlag}>
          +Flag
        </Button>
        <Button size="sm" variant="outline" onClick={handleModMood}>
          +Mood
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}