import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { shouldUnlockNext } from '../features/level1/engine'
import { LEVEL1_UNITS } from '../features/level1/units'
import type { DrillSummary } from '../features/level1/engine'
import type { Level2Summary } from '../features/level2/engine'
import { loadJSON, saveJSON } from '../utils/storage'

const STORAGE_KEY = 'typing-trainer::progress'

export interface UnitStats {
  bestAccuracy: number
  bestNetWpm: number
  unlocked: boolean
  lastPlayed: number | null
}

export interface LifetimeStats {
  totalSessions: number
  averageWpm: number
  averageAccuracy: number
}

export interface ProgressState {
  units: Record<string, UnitStats>
  lifetime: LifetimeStats
}

const defaultProgress: ProgressState = {
  units: LEVEL1_UNITS.reduce<Record<string, UnitStats>>((acc, unit, index) => {
    acc[unit.id] = {
      bestAccuracy: 0,
      bestNetWpm: 0,
      unlocked: index === 0,
      lastPlayed: null,
    }
    return acc
  }, {}),
  lifetime: {
    totalSessions: 0,
    averageWpm: 0,
    averageAccuracy: 0,
  },
}

type ProgressContextValue = {
  progress: ProgressState
  recordLevel1(summary: DrillSummary): void
  recordLevel2(summary: Level2Summary): void
  isUnitUnlocked(unitId: string): boolean
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() =>
    loadJSON(STORAGE_KEY, defaultProgress),
  )

  const updateLifetime = (wpm: number, accuracy: number) => {
    setProgress((prev) => {
      const nextSessions = prev.lifetime.totalSessions + 1
      const nextAvgWpm = (prev.lifetime.averageWpm * prev.lifetime.totalSessions + wpm) / nextSessions
      const nextAccuracy =
        (prev.lifetime.averageAccuracy * prev.lifetime.totalSessions + accuracy) / nextSessions
      const next = {
        ...prev,
        lifetime: {
          totalSessions: nextSessions,
          averageWpm: nextAvgWpm,
          averageAccuracy: nextAccuracy,
        },
      }
      saveJSON(STORAGE_KEY, next)
      return next
    })
  }

  const recordLevel1 = (summary: DrillSummary) => {
    setProgress((prev) => {
      const current = prev.units[summary.unitId] ?? {
        bestAccuracy: 0,
        bestNetWpm: 0,
        unlocked: false,
        lastPlayed: null,
      }
      const nextUnit: UnitStats = {
        bestAccuracy: Math.max(current.bestAccuracy, summary.accuracy),
        bestNetWpm: Math.max(current.bestNetWpm, summary.netWpm),
        unlocked: current.unlocked || shouldUnlockNext(summary),
        lastPlayed: Date.now(),
      }
      const nextUnits = {
        ...prev.units,
        [summary.unitId]: nextUnit,
      }

      if (summary.unlockedNext) {
        const unitIndex = LEVEL1_UNITS.findIndex((unit) => unit.id === summary.unitId)
        const nextUnitDef = LEVEL1_UNITS[unitIndex + 1]
        if (nextUnitDef) {
          const existing = nextUnits[nextUnitDef.id]
          nextUnits[nextUnitDef.id] = {
            bestAccuracy: existing?.bestAccuracy ?? 0,
            bestNetWpm: existing?.bestNetWpm ?? 0,
            unlocked: true,
            lastPlayed: existing?.lastPlayed ?? null,
          }
        }
      }

      const next: ProgressState = {
        ...prev,
        units: nextUnits,
      }
      saveJSON(STORAGE_KEY, next)
      return next
    })
    updateLifetime(summary.netWpm, summary.accuracy)
  }

  const recordLevel2 = (summary: Level2Summary) => {
    updateLifetime(summary.netWpm, summary.accuracy)
  }

  const value = useMemo(
    () => ({
      progress,
      recordLevel1,
      recordLevel2,
      isUnitUnlocked: (unitId: string) => progress.units[unitId]?.unlocked ?? false,
    }),
    [progress],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used within ProgressProvider')
  return context
}
