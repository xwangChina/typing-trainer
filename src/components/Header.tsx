import { useActiveLevel } from '../state/settings'
import { useProgress } from '../state/progress'

interface HeaderProps {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const [activeLevel, setActiveLevel] = useActiveLevel()
  const {
    progress: {
      lifetime: { averageAccuracy, averageWpm, totalSessions },
    },
  } = useProgress()

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <h1>Typing Trainer</h1>
        <span className="app-header__tagline">Build reflexes. Grow speed.</span>
      </div>
      <div className="app-header__controls">
        <div className="app-header__switcher" role="radiogroup" aria-label="Choose training level">
          <button
            type="button"
            role="radio"
            aria-checked={activeLevel === 'level1'}
            className={activeLevel === 'level1' ? 'is-active' : ''}
            onClick={() => setActiveLevel('level1')}
          >
            Finger Reflex
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={activeLevel === 'level2'}
            className={activeLevel === 'level2' ? 'is-active' : ''}
            onClick={() => setActiveLevel('level2')}
          >
            Speed Trainer
          </button>
        </div>
        <div className="app-header__stats" aria-live="polite">
          <div>
            <span className="label">Lifetime WPM</span>
            <span className="value">{averageWpm.toFixed(1)}</span>
          </div>
          <div>
            <span className="label">Accuracy</span>
            <span className="value">{averageAccuracy.toFixed(1)}%</span>
          </div>
          <div>
            <span className="label">Sessions</span>
            <span className="value">{totalSessions}</span>
          </div>
        </div>
        <button type="button" className="settings-button" onClick={onOpenSettings} aria-label="Open settings">
          ⚙️
        </button>
      </div>
    </header>
  )
}
