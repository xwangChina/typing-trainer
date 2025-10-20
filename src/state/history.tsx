import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { DrillSummary } from '../features/level1/engine'
import type { Level2Summary } from '../features/level2/engine'
import { loadJSON, saveJSON } from '../utils/storage'

const STORAGE_KEY = 'typing-trainer::history'
const MAX_HISTORY = 200

export type HistoryRecord =
  | { level: 'level1'; timestamp: number; summary: DrillSummary }
  | { level: 'level2'; timestamp: number; summary: Level2Summary }

interface HistoryState {
  sessions: HistoryRecord[]
}

const defaultHistory: HistoryState = {
  sessions: [],
}

type HistoryContextValue = {
  history: HistoryState
  push(record: HistoryRecord): void
  clear(): void
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryState>(() => loadJSON(STORAGE_KEY, defaultHistory))

  const push = (record: HistoryRecord) => {
    setHistory((prev) => {
      const nextSessions = [record, ...prev.sessions].slice(0, MAX_HISTORY)
      const next = { sessions: nextSessions }
      saveJSON(STORAGE_KEY, next)
      return next
    })
  }

  const clear = () => {
    setHistory(defaultHistory)
    saveJSON(STORAGE_KEY, defaultHistory)
  }

  const value = useMemo(() => ({ history, push, clear }), [history])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory(): HistoryContextValue {
  const context = useContext(HistoryContext)
  if (!context) throw new Error('useHistory must be used within HistoryProvider')
  return context
}
