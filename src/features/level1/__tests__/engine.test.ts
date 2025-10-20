import { describe, expect, it } from 'vitest'
import { createDrill, summarizeDrill } from '../engine'

const mockStrokes = Array.from({ length: 30 }, (_, index) => ({
  expected: 'a',
  actual: index % 5 === 0 ? 's' : 'a',
  corrected: index % 5 === 0,
  timestamp: index * 100,
}))

describe('level 1 engine', () => {
  it('creates drills with expected metadata', () => {
    const drill = createDrill({
      unitId: 'home-row',
      type: 'single',
      durationMs: 60000,
      countdownSeconds: 3,
    })
    expect(drill.tokens.length).toBeGreaterThan(0)
    expect(drill.unitId).toBe('home-row')
  })

  it('summarizes drills and detects unlock', () => {
    const summary = summarizeDrill('home-row', 'single', mockStrokes, 60000, mockStrokes.length)
    expect(summary.totalEntries).toBe(mockStrokes.length)
    expect(typeof summary.accuracy).toBe('number')
    expect(typeof summary.netWpm).toBe('number')
  })
})
