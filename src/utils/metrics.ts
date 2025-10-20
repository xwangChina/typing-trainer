export function rawWPM(characters: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const words = characters / 5
  const minutes = elapsedMs / 60000
  return roundTo(words / minutes, 2)
}

export function netWPM(
  characters: number,
  elapsedMs: number,
  uncorrectedErrors: number,
): number {
  const penalty = Math.max(uncorrectedErrors, 0)
  const adjusted = Math.max(characters / 5 - penalty, 0)
  if (elapsedMs <= 0) return 0
  return roundTo(adjusted / (elapsedMs / 60000), 2)
}

export function accuracy(correct: number, total: number): number {
  if (total <= 0) return 0
  return roundTo((correct / total) * 100, 2)
}

export function consistencyScore(latencies: number[]): number {
  if (!latencies.length) return 0
  const mean = latencies.reduce((sum, value) => sum + value, 0) / latencies.length
  if (mean === 0) return 100
  const variance =
    latencies.reduce((sum, value) => sum + (value - mean) ** 2, 0) / latencies.length
  const stdDev = Math.sqrt(variance)
  const coefficient = stdDev / mean
  const score = Math.max(0, 100 - coefficient * 100)
  return roundTo(Math.min(score, 100), 2)
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export interface AccuracyBreakdown {
  correct: number
  incorrect: number
  accuracy: number
}

export function createAccuracyBreakdown(correct: number, total: number): AccuracyBreakdown {
  const incorrect = Math.max(total - correct, 0)
  return {
    correct,
    incorrect,
    accuracy: accuracy(correct, total),
  }
}
