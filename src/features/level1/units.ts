export type DrillType = 'single' | 'pair' | 'mixed' | 'row'

export interface Level1Unit {
  id: string
  name: string
  description: string
  letters: string[]
  recommendedTypes: DrillType[]
  prerequisites?: string[]
}

const baseUnits: Level1Unit[] = [
  {
    id: 'home-row',
    name: 'Home Row',
    description: 'Anchor your fingers on ASDF and JKL;',
    letters: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    recommendedTypes: ['single', 'row', 'mixed'],
  },
  {
    id: 'top-row-left',
    name: 'Top Row Left',
    description: 'Reach up with the left hand to QWERT.',
    letters: ['q', 'w', 'e', 'r', 't'],
    recommendedTypes: ['single', 'row', 'mixed'],
    prerequisites: ['home-row'],
  },
  {
    id: 'top-row-right',
    name: 'Top Row Right',
    description: 'Reach up with the right hand to YUIOP.',
    letters: ['y', 'u', 'i', 'o', 'p'],
    recommendedTypes: ['single', 'row', 'mixed'],
    prerequisites: ['top-row-left'],
  },
  {
    id: 'bottom-row-left',
    name: 'Bottom Row Left',
    description: 'Dip down with the left hand to ZXCVB.',
    letters: ['z', 'x', 'c', 'v', 'b'],
    recommendedTypes: ['single', 'row', 'mixed'],
    prerequisites: ['top-row-right'],
  },
  {
    id: 'bottom-row-right',
    name: 'Bottom Row Right',
    description: 'Finish the alphabet with N and M.',
    letters: ['n', 'm'],
    recommendedTypes: ['single', 'row', 'mixed'],
    prerequisites: ['bottom-row-left'],
  },
  {
    id: 'pairs',
    name: 'Pairs & Alternation',
    description: 'Common alternating digrams across the keyboard.',
    letters: ['a', 't', 'e', 'd', 'o', 'n', 'h', 'i'],
    recommendedTypes: ['pair', 'mixed'],
    prerequisites: ['bottom-row-right'],
  },
  {
    id: 'trigrams',
    name: 'Trigrams',
    description: 'High frequency letter triples.',
    letters: ['t', 'h', 'e', 'a', 'n', 'd', 'i', 'n', 'g'],
    recommendedTypes: ['mixed'],
    prerequisites: ['pairs'],
  },
]

const mixedReview: Level1Unit = {
  id: 'mixed-review',
  name: 'Mixed Review',
  description: 'A rotating mix of all previously mastered letters.',
  letters: baseUnits.flatMap((unit) => unit.letters),
  recommendedTypes: ['mixed'],
  prerequisites: ['trigrams'],
}

export const LEVEL1_UNITS: Level1Unit[] = [...baseUnits, mixedReview]

export function getUnitById(id: string): Level1Unit | undefined {
  return LEVEL1_UNITS.find((unit) => unit.id === id)
}

export const UNIT_UNLOCK_CRITERIA = {
  accuracy: 90,
  netWpm: 15,
}
