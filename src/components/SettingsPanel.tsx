import { useEffect, useMemo, useState } from 'react'
import { WORD_POOLS } from '../features/level2/words'
import { useSettings } from '../state/settings'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const {
    settings,
    updateSettings,
  } = useSettings()
  const [customWordList, setCustomWordList] = useState(settings.customWordList)

  useEffect(() => {
    if (open) {
      setCustomWordList(settings.customWordList)
    }
  }, [settings.customWordList, open])

  const parsedCustomWords = useMemo(
    () =>
      customWordList
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean),
    [customWordList],
  )

  const handleSave = () => {
    updateSettings({ customWordList })
    onClose()
  }

  if (!open) return null

  return (
    <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-modal__content">
        <header>
          <h2>Settings</h2>
        </header>
        <div className="settings-modal__section">
          <h3>General</h3>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showVirtualKeyboard}
              onChange={(event) => updateSettings({ showVirtualKeyboard: event.target.checked })}
            />
            Show virtual keyboard
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.colorBlindMode}
              onChange={(event) => updateSettings({ colorBlindMode: event.target.checked })}
            />
            Color-blind friendly palette
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.useHaptics}
              onChange={(event) => updateSettings({ useHaptics: event.target.checked })}
            />
            Enable haptics (where supported)
          </label>
        </div>
        <div className="settings-modal__section">
          <h3>Session Timers</h3>
          <label>
            Level 1 Duration (seconds)
            <input
              type="number"
              min={30}
              max={300}
              value={Math.floor(settings.level1Duration / 1000)}
              onChange={(event) =>
                updateSettings({ level1Duration: Number(event.target.value) * 1000 })
              }
            />
          </label>
          <label>
            Level 2 Duration (seconds)
            <input
              type="number"
              min={15}
              max={300}
              value={Math.floor(settings.level2Duration / 1000)}
              onChange={(event) =>
                updateSettings({ level2Duration: Number(event.target.value) * 1000 })
              }
            />
          </label>
          <label>
            Countdown (seconds)
            <input
              type="number"
              min={0}
              max={5}
              value={settings.countdownSeconds}
              onChange={(event) => updateSettings({ countdownSeconds: Number(event.target.value) })}
            />
          </label>
        </div>
        <div className="settings-modal__section">
          <h3>Speed Trainer</h3>
          <label>
            Word pool
            <select
              value={settings.level2WordPool}
              onChange={(event) => updateSettings({ level2WordPool: event.target.value as any })}
            >
              {WORD_POOLS.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.name}
                </option>
              ))}
              <option value="custom">Custom list</option>
            </select>
          </label>
          {settings.level2WordPool === 'custom' ? (
            <label>
              Custom words (space or newline separated)
              <textarea
                value={customWordList}
                onChange={(event) => setCustomWordList(event.target.value)}
              />
              <p className="help-text">{parsedCustomWords.length} words loaded.</p>
            </label>
          ) : null}
          <label>
            Lookahead words
            <input
              type="number"
              min={1}
              max={5}
              value={settings.level2Lookahead}
              onChange={(event) => updateSettings({ level2Lookahead: Number(event.target.value) })}
            />
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.level2RequireSpace}
              onChange={(event) => updateSettings({ level2RequireSpace: event.target.checked })}
            />
            Require space to submit word
          </label>
        </div>
        <footer className="settings-modal__actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" onClick={handleSave}>
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
