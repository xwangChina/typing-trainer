import { describe, expect, it } from 'vitest'
import { fingerForKey, isLetterKey, normalizeKey } from '../keyboard'

describe('keyboard helpers', () => {
  it('normalizes keys to lowercase', () => {
    expect(normalizeKey('A')).toBe('a')
  })

  it('detects letter keys', () => {
    expect(isLetterKey('q')).toBe(true)
    expect(isLetterKey('5')).toBe(false)
  })

  it('returns finger assignments', () => {
    expect(fingerForKey('f')).toBe('leftIndex')
    expect(fingerForKey(' ')).toBe('thumbs')
  })
})
