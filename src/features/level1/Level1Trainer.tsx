import { useEffect, useMemo, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import { Footer } from '../../components/Footer'
import { VirtualKeyboard } from '../../components/VirtualKeyboard'
import { useHistory } from '../../state/history'
import { useProgress } from '../../state/progress'
import { useSettings } from '../../state/settings'
import { normalizeKey } from '../../utils/keyboard'
import { createDrill, summarizeDrill } from './engine'
import type { DrillSummary, Keystroke, Level1Drill } from './engine'
import { LEVEL1_UNITS } from './units'
import type { DrillType, Level1Unit } from './units'

interface TypingBufferEntry {
  expected: string
  actual: string
  corrected: boolean
}

const UNIT_DURATION_OPTIONS: Array<{ label: string; type: DrillType }> = [
  { label: 'Single letters', type: 'single' },
  { label: 'Row run', type: 'row' },
  { label: 'Pairs', type: 'pair' },
  { label: 'Mixed', type: 'mixed' },
]

export function Level1Trainer() {
  const {
    settings: { countdownSeconds, level1Duration, showVirtualKeyboard, colorBlindMode },
  } = useSettings()
  const { progress, recordLevel1, isUnitUnlocked } = useProgress()
  const { push } = useHistory()

  const [phase, setPhase] = useState<'idle' | 'countdown' | 'active' | 'summary'>('idle')
  const [selectedUnit, setSelectedUnit] = useState<Level1Unit>(LEVEL1_UNITS[0])
  const [drillType, setDrillType] = useState<DrillType>('single')
  const [drill, setDrill] = useState<Level1Drill | null>(null)
  const [summary, setSummary] = useState<DrillSummary | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [capsLock, setCapsLock] = useState(false)
  const [errorKeys, setErrorKeys] = useState<string[]>([])

  const keystrokes = useRef<Keystroke[]>([])
  const buffer = useRef<TypingBufferEntry[]>([])
  const frame = useRef<number | null>(null)
  const startTime = useRef<number>(0)
  const expectedIndex = useRef(0)

  const activeToken = drill?.tokens[expectedIndex.current] ?? ''

  const availableUnits = useMemo(
    () => LEVEL1_UNITS.filter((unit) => isUnitUnlocked(unit.id)),
    [progress.units, isUnitUnlocked],
  )

  useEffect(() => {
    const unlocked = availableUnits.find((unit) => unit.id === selectedUnit.id)
    if (!unlocked && availableUnits.length > 0) {
      setSelectedUnit(availableUnits[availableUnits.length - 1])
    }
  }, [availableUnits, selectedUnit.id])

  useEffect(() => {
    if (!selectedUnit.recommendedTypes.includes(drillType)) {
      setDrillType(selectedUnit.recommendedTypes[0] ?? 'single')
    }
  }, [selectedUnit, drillType])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (phase !== 'active' || !drill) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'CapsLock') {
        setCapsLock(event.getModifierState('CapsLock'))
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        handleBackspace()
        return
      }

      if (event.key.length > 1 && event.key !== ' ') return
      event.preventDefault()
      handleInput(event.key)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, drill])

  useEffect(() => {
    if (phase !== 'active') {
      if (frame.current) cancelAnimationFrame(frame.current)
      return
    }
    const tick = () => {
      setElapsedMs(performance.now() - startTime.current)
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'active' || !drill) return
    if (elapsedMs >= drill.durationMs) {
      finishDrill()
    }
  }, [elapsedMs, phase, drill])

  const resetDrill = (nextDrill: Level1Drill) => {
    keystrokes.current = []
    buffer.current = []
    expectedIndex.current = 0
    setErrorKeys([])
    setElapsedMs(0)
    setSummary(null)
    setDrill(nextDrill)
  }

  const startCountdown = () => {
    if (!drill) return
    setPhase('countdown')
  }

  const beginDrill = () => {
    if (!drill) return
    keystrokes.current = []
    buffer.current = []
    expectedIndex.current = 0
    setErrorKeys([])
    setSummary(null)
    startTime.current = performance.now()
    setElapsedMs(0)
    setPhase('active')
  }

  const handleBackspace = () => {
    if (!drill) return
    const last = buffer.current.pop()
    if (!last) return
    expectedIndex.current = Math.max(expectedIndex.current - 1, 0)
    keystrokes.current.push({
      expected: last.expected,
      actual: last.actual,
      corrected: true,
      timestamp: performance.now(),
    })
    setErrorKeys((keys) => keys.filter((key) => key !== normalizeKey(last.expected)))
  }

  const handleInput = (input: string) => {
    if (!drill) return
    const expected = drill.tokens[expectedIndex.current]
    if (expected === undefined) {
      finishDrill()
      return
    }

    const normalizedInput = normalizeKey(input)
    const normalizedExpected = normalizeKey(expected)

    buffer.current.push({ expected: normalizedExpected, actual: normalizedInput, corrected: false })
    keystrokes.current.push({
      expected: normalizedExpected,
      actual: normalizedInput,
      corrected: false,
      timestamp: performance.now(),
    })

    if (normalizedInput !== normalizedExpected) {
      setErrorKeys((keys) => Array.from(new Set([...keys, normalizedExpected])))
    } else {
      setErrorKeys((keys) => keys.filter((key) => key !== normalizedExpected))
    }

    expectedIndex.current += 1

    if (expectedIndex.current >= drill.tokens.length) {
      finishDrill()
    }
  }

  const finishDrill = () => {
    if (!drill) return
    setPhase('summary')
    if (frame.current) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
    const summaryResult = summarizeDrill(
      drill.unitId,
      drillType,
      keystrokes.current,
      drill.durationMs,
      drill.tokens.length,
    )
    setSummary(summaryResult)
    recordLevel1(summaryResult)
    push({ level: 'level1', timestamp: Date.now(), summary: summaryResult })
  }

  const startNewDrill = (unit: Level1Unit, type: DrillType) => {
    const nextDrill = createDrill({
      unitId: unit.id,
      type,
      durationMs: level1Duration,
      countdownSeconds,
    })
    resetDrill(nextDrill)
    setSelectedUnit(unit)
    setDrillType(type)
    startCountdown()
  }

  const handleStart = () => {
    if (!drill || drill.unitId !== selectedUnit.id || drillType !== drill.type) {
      startNewDrill(selectedUnit, drillType)
    } else {
      resetDrill({ ...drill, id: `${drill.unitId}-${drill.type}-${Date.now()}` })
      startCountdown()
    }
  }

  const highlightedKeys = activeToken ? [activeToken] : []
  const incorrectCount = buffer.current.filter((entry) => entry.actual !== entry.expected).length
  const correctCount = buffer.current.length - incorrectCount
  const currentAccuracy = correctCount > 0 ? (correctCount / buffer.current.length) * 100 : 0
  const currentWpm = elapsedMs > 0 ? (correctCount / 5) / (elapsedMs / 60000) : 0

  return (
    <div className="level level--one">
      <aside className="level__sidebar">
        <h2>Curriculum</h2>
        <ul className="unit-list">
          {LEVEL1_UNITS.map((unit) => {
            const unlocked = isUnitUnlocked(unit.id)
            return (
              <li key={unit.id} className={!unlocked ? 'locked' : ''}>
                <button
                  type="button"
                  disabled={!unlocked}
                  className={selectedUnit.id === unit.id ? 'is-active' : ''}
                  onClick={() => unlocked && setSelectedUnit(unit)}
                >
                  <span>{unit.name}</span>
                  <small>{unit.description}</small>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="unit-drill-types">
          <h3>Drill Style</h3>
          {UNIT_DURATION_OPTIONS.filter(({ type }) => selectedUnit.recommendedTypes.includes(type)).map(({ label, type }) => (
            <button
              key={type}
              type="button"
              className={drillType === type ? 'is-active' : ''}
              onClick={() => setDrillType(type)}
            >
              {label}
            </button>
          ))}
        </div>
      </aside>
      <main className="level__main">
        <section className="drill-display">
          <header>
            <h2>{selectedUnit.name}</h2>
            <p>{selectedUnit.description}</p>
          </header>
          <div className="drill-text" aria-live="polite">
            {!drill && <span className="drill-placeholder">Press start to begin your drill.</span>}
            {drill?.tokens.map((token, index) => {
              const isCurrent = index === expectedIndex.current
              const typed = buffer.current[index]
              const status = typed
                ? typed.actual === typed.expected
                  ? 'correct'
                  : 'incorrect'
                : 'pending'
              return (
                <span key={`${token}-${index}`} className={`drill-token drill-token--${status} ${isCurrent ? 'is-current' : ''}`}>
                  {token === ' ' ? '\u00B7' : token}
                </span>
              )
            })}
          </div>
          <div className="drill-actions">
            {phase === 'idle' || phase === 'summary' ? (
              <button type="button" onClick={handleStart}>
                Start Drill
              </button>
            ) : null}
            {phase === 'countdown' ? (
              <Countdown seconds={countdownSeconds} onComplete={beginDrill} />
            ) : null}
            {phase === 'summary' && summary ? (
              <div className="drill-summary">
                <h3>Drill Summary</h3>
                <ul>
                  <li>
                    Accuracy: <strong>{summary.accuracy.toFixed(1)}%</strong>
                  </li>
                  <li>
                    Net WPM: <strong>{summary.netWpm.toFixed(1)}</strong>
                  </li>
                  <li>
                    Errors: <strong>{summary.incorrectEntries}</strong>
                  </li>
                  <li>
                    {summary.unlockedNext ? 'Next unit unlocked!' : 'Keep practicing to unlock the next unit.'}
                  </li>
                </ul>
                <button type="button" onClick={() => startNewDrill(selectedUnit, drillType)}>
                  Retry Drill
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      {showVirtualKeyboard ? (
        <aside className="level__keyboard">
          <VirtualKeyboard
            highlightedKeys={highlightedKeys}
            errorKeys={errorKeys}
            capsLock={capsLock}
            colorBlindMode={colorBlindMode}
          />
        </aside>
      ) : null}
      <Footer
        elapsedMs={elapsedMs}
        durationMs={drill?.durationMs ?? level1Duration}
        wpm={currentWpm}
        accuracy={currentAccuracy}
        errors={incorrectCount}
      />
    </div>
  )
}
