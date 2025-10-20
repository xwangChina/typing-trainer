import { describe, expect, it } from 'vitest'
import { createRun, summarizeRun } from '../engine'

const run = createRun({
  durationMs: 60000,
  countdownSeconds: 3,
  wordPoolId: 'beginner',
  lookahead: 2,
})

describe('level 2 engine', () => {
  it('generates a run with words', () => {
    expect(run.words.length).toBeGreaterThan(0)
  })

  it('summarizes results with metrics', () => {
    const summary = summarizeRun(
      [
        { expected: 'test', typed: 'test', correct: true, correctedErrors: 0, uncorrectedErrors: 0, latencyMs: 500 },
        { expected: 'word', typed: 'word', correct: true, correctedErrors: 0, uncorrectedErrors: 0, latencyMs: 520 },
      ],
      run.durationMs,
      run.wordPoolId,
    )
    expect(summary.correctWords).toBe(2)
    expect(summary.netWpm).toBeGreaterThan(0)
    expect(summary.consistency).toBeGreaterThan(0)
  })
})
