import { useState } from 'react'
import { Header } from './components/Header'
import { SettingsPanel } from './components/SettingsPanel'
import { useActiveLevel, useSettings } from './state/settings'
import { useHistory } from './state/history'
import type { HistoryRecord } from './state/history'
import { Level1Trainer } from './features/level1/Level1Trainer'
import { Level2Trainer } from './features/level2/Level2Trainer'
import './App.css'

function HistoryList({ records }: { records: HistoryRecord[] }) {
  if (!records.length) {
    return <p className="history__empty">Complete a session to see your progress history.</p>
  }

  return (
    <ul className="history__list">
      {records.slice(0, 8).map((entry) => {
        if (entry.level === 'level1') {
          return (
            <li key={entry.timestamp}>
              <strong>Level 1 · {entry.summary.drillType}</strong>
              <span>
                {entry.summary.accuracy.toFixed(1)}% accuracy · {entry.summary.netWpm.toFixed(1)} WPM
              </span>
              <time dateTime={new Date(entry.timestamp).toISOString()}>
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </li>
          )
        }
        return (
          <li key={entry.timestamp}>
            <strong>Level 2 · {entry.summary.wordPoolId}</strong>
            <span>
              {entry.summary.accuracy.toFixed(1)}% accuracy · {entry.summary.netWpm.toFixed(1)} WPM
            </span>
            <time dateTime={new Date(entry.timestamp).toISOString()}>
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </li>
        )
      })}
    </ul>
  )
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeLevel] = useActiveLevel()
  const {
    history: { sessions },
  } = useHistory()
  const {
    settings: { showVirtualKeyboard },
  } = useSettings()

  return (
    <div className={`app ${showVirtualKeyboard ? '' : 'app--no-keyboard'}`}>
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <div className="app__body">
        <div className="app__primary">
          {activeLevel === 'level1' ? <Level1Trainer /> : <Level2Trainer />}
        </div>
        <aside className="app__history" aria-label="Recent sessions">
          <h2>Recent Sessions</h2>
          <HistoryList records={sessions} />
        </aside>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
