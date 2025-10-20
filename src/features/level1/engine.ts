import { accuracy, createAccuracyBreakdown, netWPM, rawWPM } from '../../utils/metrics'
import { LEVEL1_UNITS, UNIT_UNLOCK_CRITERIA } from './units'
import type { DrillType } from './units'

export type Level1Phase = 'idle' | 'countdown' | 'active' | 'summary' | 'paused'

export interface Level1DrillConfig {
  unitId: string
  type: DrillType
  durationMs: number
  countdownSeconds: number
  weaknesses?: Record<string, number>
}

export interface Level1Drill {
  id: string
  unitId: string
  tokens: string[]
  type: DrillType
  countdownSeconds: number
  durationMs: number
  weaknessWeights: Record<string, number>
}

export interface Keystroke {
  expected: string
  actual: string
  timestamp: number
  corrected: boolean
}

export interface DrillMetrics {
  totalEntries: number
  correctEntries: number
  incorrectEntries: number
  correctedErrors: number
  uncorrectedErrors: number
  elapsedMs: number
  rawWpm: number
  netWpm: number
  accuracy: number
}

export interface DrillSummary extends DrillMetrics {
  unitId: string
  drillType: DrillType
  unlockedNext: boolean
}

const DEFAULT_DURATION = 60000
const DEFAULT_COUNTDOWN = 3

export function createDrill(config: Level1DrillConfig): Level1Drill {
  const unit = LEVEL1_UNITS.find((item) => item.id === config.unitId)
  if (!unit) {
    throw new Error(`Unknown unit ${config.unitId}`)
  }
  const durationMs = config.durationMs ?? DEFAULT_DURATION
  const countdownSeconds = config.countdownSeconds ?? DEFAULT_COUNTDOWN
  const weaknessWeights = { ...config.weaknesses }
  const tokens = buildSequence(unit.letters, config.type, weaknessWeights, durationMs)
  return {
    id: `${unit.id}-${config.type}-${Date.now()}`,
    unitId: unit.id,
    tokens,
    type: config.type,
    countdownSeconds,
    durationMs,
    weaknessWeights,
  }
}

function buildSequence(
  letters: string[],
  type: DrillType,
  weaknesses: Record<string, number> = {},
  durationMs: number,
): string[] {
  const approxCharacters = Math.ceil((durationMs / 1000) * 4) // approx 4 chars per second
  const pool = createWeightedPool(letters, weaknesses)
  const result: string[] = []
  if (type === 'single') {
    const letter = pool[0] ?? letters[0]
    for (let i = 0; i < approxCharacters; i += 1) {
      result.push(letter)
      if ((i + 1) % 5 === 0) result.push(' ')
    }
    return result
  }

  if (type === 'pair') {
    const [first, second] = pool.length >= 2 ? pool.slice(0, 2) : letters.slice(0, 2)
    for (let i = 0; i < approxCharacters; i += 1) {
      result.push(i % 2 === 0 ? first : second)
      if ((i + 1) % 5 === 0) result.push(' ')
    }
    return result
  }

  if (type === 'row') {
    while (result.length < approxCharacters) {
      for (const letter of letters) {
        result.push(letter)
      }
      result.push(' ')
    }
    return result
  }

  // mixed fallback
  while (result.length < approxCharacters) {
    const letter = pool[Math.floor(Math.random() * pool.length)] ?? letters[0]
    result.push(letter)
    if (result.length % 5 === 0) result.push(' ')
  }
  return result
}

function createWeightedPool(letters: string[], weaknesses: Record<string, number>): string[] {
  if (!letters.length) return []
  const pool: string[] = []
  const baseWeight = 1
  for (const letter of letters) {
    const weight = baseWeight + (weaknesses[letter] ?? 0)
    for (let i = 0; i < weight; i += 1) {
      pool.push(letter)
    }
  }
  return pool.length ? pool : [...letters]
}

export function calculateMetrics(
  keystrokes: Keystroke[],
  durationMs: number,
  expectedLength: number,
): DrillMetrics {
  const elapsedMs = Math.min(
    keystrokes.length ? keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp : 0,
    durationMs,
  )

  const totalEntries = Math.min(keystrokes.length, expectedLength)
  const correctEntries = keystrokes.filter((stroke) => stroke.expected === stroke.actual).length
  const correctedErrors = keystrokes.filter((stroke) => stroke.corrected).length
  const uncorrectedErrors = Math.max(totalEntries - correctEntries - correctedErrors, 0)

  const rawWpm = rawWPM(totalEntries, elapsedMs || durationMs)
  const netWpm = netWPM(totalEntries, elapsedMs || durationMs, uncorrectedErrors)
  const accuracyPct = accuracy(correctEntries, totalEntries)

  return {
    totalEntries,
    correctEntries,
    incorrectEntries: totalEntries - correctEntries,
    correctedErrors,
    uncorrectedErrors,
    elapsedMs: elapsedMs || durationMs,
    rawWpm,
    netWpm,
    accuracy: accuracyPct,
  }
}

export function shouldUnlockNext(metrics: DrillMetrics): boolean {
  return metrics.accuracy >= UNIT_UNLOCK_CRITERIA.accuracy && metrics.netWpm >= UNIT_UNLOCK_CRITERIA.netWpm
}

export function summarizeDrill(
  unitId: string,
  drillType: DrillType,
  keystrokes: Keystroke[],
  durationMs: number,
  expectedLength: number,
): DrillSummary {
  const metrics = calculateMetrics(keystrokes, durationMs, expectedLength)
  return {
    ...metrics,
    unitId,
    drillType,
    unlockedNext: shouldUnlockNext(metrics),
  }
}

export function aggregateWeaknesses(
  history: Array<{
    summary: DrillSummary
    breakdown: ReturnType<typeof createAccuracyBreakdown>
  }>,
): Record<string, number> {
  const weights: Record<string, number> = {}
  for (const { summary, breakdown } of history) {
    if (!summary || !breakdown) continue
    const mistakes = breakdown.incorrect
    if (mistakes <= 0) continue
    const unit = LEVEL1_UNITS.find((item) => item.id === summary.unitId)
    if (!unit) continue
    for (const letter of unit.letters) {
      weights[letter] = (weights[letter] ?? 0) + mistakes
    }
  }
  return weights
}
