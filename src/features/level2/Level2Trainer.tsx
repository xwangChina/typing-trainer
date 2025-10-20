import { type ClipboardEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Countdown } from '../../components/Countdown'
import { Footer } from '../../components/Footer'
import { useHistory } from '../../state/history'
import { useProgress } from '../../state/progress'
import { useSettings } from '../../state/settings'
import { normalizeKey } from '../../utils/keyboard'
import { createRun, summarizeRun } from './engine'
import type { Level2Run, Level2Summary, WordResult } from './engine'
import { WORD_POOLS } from './words'

export function Level2Trainer() {
  const {
    settings: {
      countdownSeconds,
      level2Duration,
      level2WordPool,
      level2Lookahead,
      level2RequireSpace,
      customWordList,
    },
  } = useSettings()
  const { recordLevel2 } = useProgress()
  const { push } = useHistory()

  const [phase, setPhase] = useState<'idle' | 'countdown' | 'active' | 'summary'>('idle')
  const [run, setRun] = useState<Level2Run | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [summary, setSummary] = useState<Level2Summary | null>(null)
  const [completedWords, setCompletedWords] = useState<WordResult[]>([])

  const resultsRef = useRef<WordResult[]>([])
  const correctionsRef = useRef(0)
  const currentBufferRef = useRef<Array<{ expected: string; actual: string }>>([])
  const startTimeRef = useRef(0)
  const wordStartRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeWord = run?.words[wordIndex] ?? ''

  useEffect(() => {
    if (phase === 'active') {
      inputRef.current?.focus()
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'active') {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      return
    }
    const tick = () => {
      setElapsedMs(performance.now() - startTimeRef.current)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'active' || !run) return
    if (elapsedMs >= run.durationMs) {
      finishRun()
    }
  }, [elapsedMs, phase, run])

  const resetRunState = (nextRun: Level2Run) => {
    resultsRef.current = []
    correctionsRef.current = 0
    currentBufferRef.current = []
    setCompletedWords([])
    setInputValue('')
    setWordIndex(0)
    setElapsedMs(0)
    setSummary(null)
    setRun(nextRun)
  }

  const startCountdown = () => {
    if (!run) return
    setPhase('countdown')
  }

  const beginRun = () => {
    if (!run) return
    resultsRef.current = []
    correctionsRef.current = 0
    currentBufferRef.current = []
    setCompletedWords([])
    setInputValue('')
    setWordIndex(0)
    setSummary(null)
    startTimeRef.current = performance.now()
    wordStartRef.current = startTimeRef.current
    setElapsedMs(0)
    setPhase('active')
  }

  const handleStart = () => {
    try {
      const nextRun = createRun({
        durationMs: level2Duration,
        countdownSeconds,
        wordPoolId: level2WordPool,
        lookahead: level2Lookahead,
        customWords: customWordList.split(/\s+/).filter(Boolean),
      })
      resetRunState(nextRun)
      startCountdown()
    } catch (error) {
      console.error(error)
      alert('Unable to start run. Please check that your word list is not empty.')
    }
  }

  const addCharacter = (char: string) => {
    if (!run) return
    const expectedChar = activeWord[currentBufferRef.current.length] ?? ''
    currentBufferRef.current.push({ expected: normalizeKey(expectedChar), actual: normalizeKey(char) })
    setInputValue((value) => {
      const nextValue = value + char
      if (!level2RequireSpace) {
        const expected = activeWord
        const nextLength = currentBufferRef.current.length
        const lastExpected = expected[expected.length - 1] ?? ''
        if (nextLength > expected.length || normalizeKey(char) === normalizeKey(lastExpected)) {
          finalizeWord(nextValue)
        }
      }
      return nextValue
    })
  }

  const removeCharacter = () => {
    const removed = currentBufferRef.current.pop()
    setInputValue((value) => value.slice(0, -1))
    if (removed && removed.actual !== removed.expected) {
      correctionsRef.current += 1
    }
  }

  const finalizeWord = (typedOverride?: string) => {
    if (!run) return
    const typed = typedOverride ?? inputValue
    const normalizedTyped = typed.trim()
    const normalizedExpected = activeWord.trim()
    const incorrectInBuffer = currentBufferRef.current.filter((entry) => entry.actual !== entry.expected).length
    const uncorrectedErrors = Math.max(incorrectInBuffer, 0)
    const wordResult: WordResult = {
      expected: activeWord,
      typed,
      correct: normalizedTyped === normalizedExpected,
      correctedErrors: correctionsRef.current,
      uncorrectedErrors,
      latencyMs: performance.now() - wordStartRef.current,
    }
    resultsRef.current = [...resultsRef.current, wordResult]
    setCompletedWords(resultsRef.current)
    correctionsRef.current = 0
    currentBufferRef.current = []
    setInputValue('')
    const nextIndex = wordIndex + 1
    setWordIndex(nextIndex)
    wordStartRef.current = performance.now()
    if (nextIndex >= run.words.length) {
      finishRun()
    }
  }

  const finishRun = () => {
    if (!run) return
    if (inputValue.length > 0 && currentBufferRef.current.length > 0) {
      const incorrectInBuffer = currentBufferRef.current.filter((entry) => entry.actual !== entry.expected).length
      const partialResult: WordResult = {
        expected: activeWord,
        typed: inputValue,
        correct: false,
        correctedErrors: correctionsRef.current,
        uncorrectedErrors: Math.max(incorrectInBuffer, 0),
        latencyMs: performance.now() - wordStartRef.current,
      }
      resultsRef.current = [...resultsRef.current, partialResult]
      setCompletedWords(resultsRef.current)
    }
    setPhase('summary')
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    const summaryResult = summarizeRun(resultsRef.current, run.durationMs, run.wordPoolId)
    setSummary(summaryResult)
    recordLevel2(summaryResult)
    push({ level: 'level2', timestamp: Date.now(), summary: summaryResult })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'active') return
    if (event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === 'Backspace') {
      event.preventDefault()
      if (inputValue.length > 0) {
        removeCharacter()
      }
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      finalizeWord()
      return
    }

    if (event.key === ' ') {
      event.preventDefault()
      finalizeWord()
      return
    }

    if (event.key.length === 1) {
      event.preventDefault()
      addCharacter(event.key)
      if (!level2RequireSpace) {
        const expected = activeWord
        const nextLength = currentBufferRef.current.length
        if (nextLength >= expected.length && normalizeKey(event.key) === normalizeKey(expected[expected.length - 1] ?? '')) {
          finalizeWord()
        }
      }
    }
  }

  const preventPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
  }

  const wordsToDisplay = useMemo(() => {
    if (!run) return []
    return run.words.slice(wordIndex, wordIndex + run.lookahead + 1)
  }, [run, wordIndex])

  const totalCharactersTyped = useMemo(() => {
    const completedChars = resultsRef.current.reduce((sum, word) => sum + word.typed.length, 0)
    return completedChars + inputValue.length
  }, [completedWords, inputValue])

  const totalUncorrectedErrors = useMemo(() => {
    const completedErrors = resultsRef.current.reduce((sum, word) => sum + word.uncorrectedErrors, 0)
    const currentErrors = currentBufferRef.current.filter((entry) => entry.actual !== entry.expected).length
    return completedErrors + currentErrors
  }, [completedWords, activeWord])

  const completedCount = resultsRef.current.length
  const correctCount = resultsRef.current.filter((word) => word.correct).length
  const accuracy = completedCount > 0 ? (correctCount / completedCount) * 100 : 0
  const liveNetWpm = elapsedMs > 0 ? ((totalCharactersTyped / 5 - totalUncorrectedErrors) / (elapsedMs / 60000)) : 0

  return (
    <div className="level level--two">
      <aside className="level__sidebar">
        <h2>Speed Trainer</h2>
        <p>Run timed sprints to grow fluency. Choose your word pool in settings.</p>
        <div className="run-stats">
          <div>
            <span className="label">Completed</span>
            <span className="value">{completedCount}</span>
          </div>
          <div>
            <span className="label">Correct</span>
            <span className="value">{correctCount}</span>
          </div>
          <div>
            <span className="label">Lookahead</span>
            <span className="value">{level2Lookahead}</span>
          </div>
        </div>
        <div className="word-pool-list">
          <h3>Word Pools</h3>
          <ul>
            {WORD_POOLS.map((pool) => (
              <li key={pool.id} className={pool.id === level2WordPool ? 'is-active' : ''}>
                <span>{pool.name}</span>
                <small>{pool.description}</small>
              </li>
            ))}
            <li className={level2WordPool === 'custom' ? 'is-active' : ''}>
              <span>Custom</span>
              <small>Use your own words in settings.</small>
            </li>
          </ul>
        </div>
      </aside>
      <main className="level__main">
        <section className="drill-display">
          <header>
            <h2>Timed Run</h2>
            <p>Focus on accuracy first, then let speed follow.</p>
          </header>
          <div className="word-stream" aria-live="polite">
            {wordsToDisplay.map((word, index) => (
              <span key={`${word}-${index}`} className={index === 0 ? 'is-current' : ''}>
                {word}
              </span>
            ))}
          </div>
          <div className="word-input">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onKeyDown={handleKeyDown}
              onPaste={preventPaste}
              onChange={() => {}}
              placeholder={phase === 'active' ? 'Type here…' : 'Press start to begin'}
              aria-label="Type the current word"
              disabled={phase !== 'active'}
            />
          </div>
          <div className="drill-actions">
            {phase === 'idle' || phase === 'summary' ? (
              <button type="button" onClick={handleStart}>
                Start Run
              </button>
            ) : null}
            {phase === 'countdown' ? (
              <Countdown seconds={countdownSeconds} onComplete={beginRun} />
            ) : null}
            {phase === 'summary' && summary ? (
              <SummaryPanel summary={summary} onRestart={handleStart} />
            ) : null}
          </div>
        </section>
      </main>
      <Footer
        elapsedMs={elapsedMs}
        durationMs={run?.durationMs ?? level2Duration}
        wpm={Math.max(liveNetWpm, 0)}
        accuracy={accuracy}
        errors={totalUncorrectedErrors}
      />
    </div>
  )
}

interface SummaryPanelProps {
  summary: Level2Summary
  onRestart: () => void
}

function SummaryPanel({ summary, onRestart }: SummaryPanelProps) {
  return (
    <div className="drill-summary">
      <h3>Run Summary</h3>
      <ul>
        <li>
          Net WPM: <strong>{summary.netWpm.toFixed(1)}</strong>
        </li>
        <li>
          Accuracy: <strong>{summary.accuracy.toFixed(1)}%</strong>
        </li>
        <li>
          Correct words: <strong>{summary.correctWords}</strong>
        </li>
        <li>
          Consistency: <strong>{summary.consistency.toFixed(1)}</strong>
        </li>
      </ul>
      <div className="heatmap">
        <h4>Error heatmap</h4>
        <div className="heatmap__grid">
          {Object.entries(summary.errorHeatmap).map(([char, count]) => (
            <span key={char} title={`${count} errors`}>{char}</span>
          ))}
          {Object.keys(summary.errorHeatmap).length === 0 ? <span>No errors 🎉</span> : null}
        </div>
      </div>
      <button type="button" onClick={onRestart}>
        Run again
      </button>
    </div>
  )
}
