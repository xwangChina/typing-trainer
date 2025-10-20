import { describe, expect, it } from 'vitest'
import { accuracy, netWPM, rawWPM, consistencyScore } from '../metrics'

describe('metrics', () => {
  it('calculates raw WPM', () => {
    expect(rawWPM(250, 60000)).toBe(50)
  })

  it('calculates net WPM with penalties', () => {
    expect(netWPM(250, 60000, 3)).toBe(47)
  })

  it('calculates accuracy', () => {
    expect(accuracy(90, 100)).toBe(90)
  })

  it('derives consistency score', () => {
    const score = consistencyScore([500, 520, 480, 510, 505])
    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })
})
