import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { WordPoolId } from '../features/level2/words'
import { loadJSON, saveJSON } from '../utils/storage'

export type LevelId = 'level1' | 'level2'

export interface SettingsState {
  activeLevel: LevelId
  showVirtualKeyboard: boolean
  colorBlindMode: boolean
  countdownSeconds: number
  level1Duration: number
  level2Duration: number
  level2WordPool: WordPoolId
  level2Lookahead: number
  level2RequireSpace: boolean
  useHaptics: boolean
  customWordList: string
}

const STORAGE_KEY = 'typing-trainer::settings'

const defaultSettings: SettingsState = {
  activeLevel: 'level1',
  showVirtualKeyboard: true,
  colorBlindMode: false,
  countdownSeconds: 3,
  level1Duration: 60000,
  level2Duration: 60000,
  level2WordPool: 'core',
  level2Lookahead: 2,
  level2RequireSpace: true,
  useHaptics: false,
  customWordList: '',
}

type SettingsContextValue = {
  settings: SettingsState
  updateSettings: (changes: Partial<SettingsState>) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() =>
    loadJSON<SettingsState>(STORAGE_KEY, defaultSettings),
  )

  const updateSettings = (changes: Partial<SettingsState>) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes }
      saveJSON(STORAGE_KEY, next)
      return next
    })
  }

  const value = useMemo(() => ({ settings, updateSettings }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}

export function useActiveLevel(): [LevelId, (next: LevelId) => void] {
  const {
    settings: { activeLevel },
    updateSettings,
  } = useSettings()
  return [activeLevel, (next) => updateSettings({ activeLevel: next })]
}
