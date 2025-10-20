import { accuracy, consistencyScore, netWPM, rawWPM } from '../../utils/metrics'
import { getWordPool } from './words'
import type { WordPoolId } from './words'

export type Level2Phase = 'idle' | 'countdown' | 'active' | 'summary' | 'paused'

export interface Level2RunConfig {
  durationMs: number
  countdownSeconds: number
  wordPoolId: WordPoolId
  lookahead: number
  customWords?: string[]
}

export interface Level2Run {
  id: string
  durationMs: number
  countdownSeconds: number
  words: string[]
  lookahead: number
  wordPoolId: WordPoolId
}

export interface WordResult {
  expected: string
  typed: string
  correct: boolean
  correctedErrors: number
  uncorrectedErrors: number
  latencyMs: number
}

export interface Level2Summary {
  durationMs: number
  wordPoolId: WordPoolId
  totalWords: number
  completedWords: number
  correctWords: number
  rawWpm: number
  netWpm: number
  accuracy: number
  correctedErrors: number
  uncorrectedErrors: number
  latencies: number[]
  errorHeatmap: Record<string, number>
  consistency: number
}

export function createRun(config: Level2RunConfig): Level2Run {
  const pool = getWordPool(config.wordPoolId, config.customWords)
  if (!pool.length) throw new Error('Word pool is empty')
  const durationMs = config.durationMs
  const targetWords = Math.ceil((durationMs / 1000) * 2.2)
  const words: string[] = []
  for (let i = 0; i < targetWords; i += 1) {
    const word = pool[Math.floor(Math.random() * pool.length)]
    words.push(word)
  }
  return {
    id: `${config.wordPoolId}-${Date.now()}`,
    durationMs,
    countdownSeconds: config.countdownSeconds,
    words,
    lookahead: config.lookahead,
    wordPoolId: config.wordPoolId,
  }
}

export function summarizeRun(words: WordResult[], durationMs: number, wordPoolId: WordPoolId): Level2Summary {
  const totalWords = words.length
  const completedWords = words.filter((word) => word.typed.length > 0).length
  const correctWords = words.filter((word) => word.correct).length
  const totalCharacters = words.reduce((sum, word) => sum + word.typed.length, 0)
  const correctedErrors = words.reduce((sum, word) => sum + word.correctedErrors, 0)
  const uncorrectedErrors = words.reduce((sum, word) => sum + word.uncorrectedErrors, 0)
  const latencies = words.map((word) => word.latencyMs).filter((value) => value > 0)

  const elapsed = durationMs
  const raw = rawWPM(totalCharacters, elapsed)
  const net = netWPM(totalCharacters, elapsed, uncorrectedErrors)
  const accuracyPct = accuracy(correctWords, completedWords || totalWords)

  const errorHeatmap: Record<string, number> = {}
  for (const word of words) {
    if (word.correct) continue
    const expected = word.expected
    for (let i = 0; i < expected.length; i += 1) {
      const ch = expected[i]
      if (word.typed[i] !== ch) {
        errorHeatmap[ch] = (errorHeatmap[ch] ?? 0) + 1
      }
    }
  }

  return {
    durationMs,
    wordPoolId,
    totalWords,
    completedWords,
    correctWords,
    rawWpm: raw,
    netWpm: net,
    accuracy: accuracyPct,
    correctedErrors,
    uncorrectedErrors,
    latencies,
    errorHeatmap,
    consistency: consistencyScore(latencies),
  }
}
