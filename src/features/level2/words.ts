import { advancedWords } from './data/advanced'
import { beginnerWords } from './data/beginner'
import { coreWords } from './data/core'

export type WordPoolId = 'beginner' | 'core' | 'advanced' | 'custom'

export interface WordPool {
  id: WordPoolId
  name: string
  description: string
  words: readonly string[]
}

export const WORD_POOLS: WordPool[] = [
  {
    id: 'beginner',
    name: 'Beginner 200',
    description: 'Top 200 English words for warm-up runs.',
    words: beginnerWords,
  },
  {
    id: 'core',
    name: 'Core 1000',
    description: 'High-frequency words for everyday typing.',
    words: coreWords,
  },
  {
    id: 'advanced',
    name: 'Advanced 5000',
    description: 'Extended vocabulary for fluent practice.',
    words: advancedWords,
  },
]

export function getWordPool(id: WordPoolId, customList: string[] = []): readonly string[] {
  if (id === 'custom') return customList
  const pool = WORD_POOLS.find((item) => item.id === id)
  return pool?.words ?? beginnerWords
}
